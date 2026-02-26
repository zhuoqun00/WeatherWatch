/**
 * 命令处理模块
 * 负责处理所有插件命令
 */

import * as vscode from 'vscode';
import { LocationProvider } from './locationProvider';
import { WeatherProvider } from './weatherProvider';
import { StatusBarUI } from './statusBarUI';
import { ConfigManager } from './config';
import { Location, WeatherInfo } from './types';

/**
 * 命令处理器类
 * 注册和处理天气插件的所有命令
 */
export class CommandHandler {
  private statusBarUI: StatusBarUI;
  private refreshTimer: NodeJS.Timeout | null = null;
  private currentLocation: Location | null = null;
  private currentWeather: WeatherInfo | null = null;

  constructor(statusBarUI: StatusBarUI) {
    this.statusBarUI = statusBarUI;
  }

  /**
   * 注册所有命令
   * @returns 一个Disposable对象数组
   */
  registerCommands(): vscode.Disposable[] {
    const disposables: vscode.Disposable[] = [];

    // 刷新天气命令
    disposables.push(
      vscode.commands.registerCommand('weather.refreshWeather', () =>
        this.handleRefreshWeather()
      )
    );

    // 设置位置命令
    disposables.push(
      vscode.commands.registerCommand('weather.setLocation', () =>
        this.handleSetLocation()
      )
    );

    // 显示详情命令
    disposables.push(
      vscode.commands.registerCommand('weather.showDetails', () =>
        this.statusBarUI.showDetailsPanel()
      )
    );

    // 切换温度单位命令
    disposables.push(
      vscode.commands.registerCommand('weather.toggleTemperatureUnit', () =>
        this.handleToggleTemperatureUnit()
      )
    );

    // 切换自动刷新命令
    disposables.push(
      vscode.commands.registerCommand('weather.toggleAutoRefresh', () =>
        this.handleToggleAutoRefresh()
      )
    );

    console.log('[CommandHandler] 所有命令已注册');
    return disposables;
  }

  /**
   * 初始化天气信息
   * 首次加载时获取位置和天气
   */
  async initialize(): Promise<void> {
    try {
      console.log('[CommandHandler] 开始初始化...');
      this.statusBarUI.showLoading();

      // 尝试从配置中读取手动设置的城市
      const configCity = ConfigManager.getCity();
      if (configCity) {
        console.log(`[CommandHandler] 使用配置中的城市: ${configCity}`);
        this.currentLocation = await LocationProvider.getLocationFromCity(configCity);
      }

      // 如果没有配置城市，则进行IP定位
      if (!this.currentLocation) {
        console.log('[CommandHandler] 通过IP获取位置...');
        this.currentLocation = await LocationProvider.getLocationFromIP();
      }

      if (!this.currentLocation) {
        throw new Error('无法获取位置信息');
      }

      // 获取天气信息
      await this.fetchAndUpdateWeather();

      // 设置自动刷新
      this.setupAutoRefresh();

      // 监听配置变更
      this.setupConfigListener();

      console.log('[CommandHandler] 初始化完成');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error(`[CommandHandler] 初始化失败: ${errorMsg}`);
      this.statusBarUI.showError(`初始化失败: ${errorMsg}`);
      vscode.window.showErrorMessage(`天气插件初始化失败: ${errorMsg}`);
    }
  }

  /**
   * 处理刷新天气命令
   */
  private async handleRefreshWeather(): Promise<void> {
    try {
      console.log('[CommandHandler] 执行刷新天气命令');
      this.statusBarUI.showLoading();

      if (!this.currentLocation) {
        throw new Error('位置信息不可用');
      }

      await this.fetchAndUpdateWeather();
      vscode.window.showInformationMessage('天气信息已更新');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error(`[CommandHandler] 刷新失败: ${errorMsg}`);
      this.statusBarUI.showError(errorMsg);
      vscode.window.showErrorMessage(`刷新天气失败: ${errorMsg}`);
    }
  }

  /**
   * 处理设置位置命令
   */
  private async handleSetLocation(): Promise<void> {
    try {
      console.log('[CommandHandler] 执行设置位置命令');

      const city = await LocationProvider.promptForCity();
      if (!city) {
        return; // 用户取消
      }

      this.statusBarUI.showLoading();

      // 获取位置
      const location = await LocationProvider.getLocationFromCity(city);
      if (!location) {
        throw new Error(`无法找到城市: ${city}`);
      }

      this.currentLocation = location;

      // 保存到配置
      await ConfigManager.setCity(city);

      // 获取天气信息
      await this.fetchAndUpdateWeather();

      vscode.window.showInformationMessage(`位置已设置为: ${location.city}`);
      console.log(`[CommandHandler] 位置已更新: ${location.city}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error(`[CommandHandler] 设置位置失败: ${errorMsg}`);
      this.statusBarUI.showError(errorMsg);
      vscode.window.showErrorMessage(`设置位置失败: ${errorMsg}`);
    }
  }

  /**
   * 处理切换温度单位命令
   */
  private async handleToggleTemperatureUnit(): Promise<void> {
    try {
      console.log('[CommandHandler] 执行切换温度单位命令');

      const currentUnit = ConfigManager.getTemperatureUnit();
      const newUnit: 'C' | 'F' = currentUnit === 'C' ? 'F' : 'C';

      await ConfigManager.setTemperatureUnit(newUnit);

      // 更新显示
      if (this.currentWeather) {
        this.statusBarUI.updateWeather(this.currentWeather, newUnit);
      }

      vscode.window.showInformationMessage(`温度单位已切换为: °${newUnit}`);
      console.log(`[CommandHandler] 温度单位已切换: ${newUnit}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error(`[CommandHandler] 切换单位失败: ${errorMsg}`);
      vscode.window.showErrorMessage(`切换温度单位失败: ${errorMsg}`);
    }
  }

  /**
   * 处理切换自动刷新命令
   */
  private async handleToggleAutoRefresh(): Promise<void> {
    try {
      console.log('[CommandHandler] 执行切换自动刷新命令');

      const isEnabled = ConfigManager.isAutoRefreshEnabled();
      const config = vscode.workspace.getConfiguration('weather');
      await config.update('autoRefresh', !isEnabled, vscode.ConfigurationTarget.Global);

      const status = !isEnabled ? '已启用' : '已禁用';
      vscode.window.showInformationMessage(`自动刷新${status}`);
      console.log(`[CommandHandler] 自动刷新${status}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error(`[CommandHandler] 切换自动刷新失败: ${errorMsg}`);
      vscode.window.showErrorMessage(`切换自动刷新失败: ${errorMsg}`);
    }
  }

  /**
   * 获取并更新天气信息
   */
  private async fetchAndUpdateWeather(): Promise<void> {
    if (!this.currentLocation) {
      throw new Error('位置信息不可用');
    }

    const weather = await WeatherProvider.getWeather(this.currentLocation);
    this.currentWeather = weather;

    // 更新状态栏显示
    const unit = ConfigManager.getTemperatureUnit();
    this.statusBarUI.updateWeather(weather, unit);
  }

  /**
   * 启动自动刷新功能
   */
  private setupAutoRefresh(): void {
    // 清除已有的定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    // 检查是否启用自动刷新
    if (!ConfigManager.isAutoRefreshEnabled()) {
      console.log('[CommandHandler] 自动刷新已禁用');
      return;
    }

    const interval = ConfigManager.getRefreshInterval();
    const intervalMs = interval * 60 * 1000; // 转换为毫秒

    console.log(`[CommandHandler] 启动自动刷新，间隔${interval}分钟`);

    this.refreshTimer = setInterval(() => {
      console.log('[CommandHandler] 执行自动刷新');
      this.fetchAndUpdateWeather().catch((error) => {
        console.error('[CommandHandler] 自动刷新失败:', error);
      });
    }, intervalMs);
  }

  /**
   * 监听配置变更
   */
  private setupConfigListener(): void {
    ConfigManager.onConfigChange((config) => {
      console.log('[CommandHandler] 配置已变更');

      // 重新启动自动刷新（如果间隔或启用状态改变）
      this.setupAutoRefresh();

      // 更新状态栏显示（如果温度单位改变）
      if (this.currentWeather) {
        this.statusBarUI.updateWeather(this.currentWeather, config.temperatureUnit);
      }
    });
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }
}
