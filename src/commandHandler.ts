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
import { UsageManager } from './usageManager';
import { UsagePanel } from './usagePanel';

/**
 * 命令处理器类
 * 注册和处理天气插件的所有命令
 */
export class CommandHandler {
  private statusBarUI: StatusBarUI;
  private usageManager: UsageManager;
  private usagePanel: UsagePanel;
  private refreshTimer: NodeJS.Timeout | null = null;
  private windowStateListener: vscode.Disposable | null = null;
  private currentLocation: Location | null = null;
  private currentWeather: WeatherInfo | null = null;

  constructor(statusBarUI: StatusBarUI, usageManager: UsageManager, usagePanel: UsagePanel) {
    this.statusBarUI = statusBarUI;
    this.usageManager = usageManager;
    this.usagePanel = usagePanel;
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

    // 刷新位置命令
    disposables.push(
      vscode.commands.registerCommand('weather.refreshLocation', () =>
        this.handleRefreshLocation()
      )
    );

    // 显示使用统计命令
    disposables.push(
      vscode.commands.registerCommand('weather.showUsageStats', () =>
        this.handleShowUsageStats()
      )
    );

    // 重置使用统计命令
    disposables.push(
      vscode.commands.registerCommand('weather.resetUsageStats', () =>
        this.handleResetUsageStats()
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

      // 首先尝试通过IP自动检测位置
      console.log('[CommandHandler] 尝试自动检测位置...');
      this.currentLocation = await LocationProvider.getLocationFromIP();

      // 如果自动检测失败，尝试使用配置中的城市
      if (!this.currentLocation) {
        const configCity = ConfigManager.getCity();
        if (configCity) {
          console.log(`[CommandHandler] 自动检测失败，使用配置中的城市: ${configCity}`);
          this.currentLocation = await LocationProvider.getLocationFromCity(configCity);
        }
      }

      if (!this.currentLocation) {
        throw new Error('无法获取位置信息');
      }

      // 获取天气信息
      await this.fetchAndUpdateWeather();

      // 开始使用时长统计会话
      if (this.currentWeather) {
        this.usageManager.startSession(this.currentLocation, this.currentWeather.description);
      }

      // 设置自动刷新
      this.setupAutoRefresh();

      // 监听配置变更
      this.setupConfigListener();

      // 设置窗口焦点监听
      this.setupWindowFocusListener();

      console.log('[CommandHandler] 初始化完成');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error(`[CommandHandler] 初始化失败: ${errorMsg}`);
      this.statusBarUI.showError(`初始化失败: ${errorMsg}`);
      vscode.window.showErrorMessage(`天气插件初始化失败: ${errorMsg}`);
    }
  }

  /**
   * 处理刷新位置命令
   * 重新自动检测当前位置
   */
  private async handleRefreshLocation(): Promise<void> {
    try {
      console.log('[CommandHandler] 执行刷新位置命令');
      this.statusBarUI.showLoading();

      // 自动检测新位置
      const newLocation = await LocationProvider.getLocationFromIP();
      if (!newLocation) {
        throw new Error('无法检测位置');
      }

      this.currentLocation = newLocation;

      // 清除配置中的手动城市设置（因为使用了自动检测）
      await ConfigManager.setCity('');

      // 获取新位置的天气信息
      await this.fetchAndUpdateWeather();

      vscode.window.showInformationMessage(
        `位置已更新为: ${newLocation.city}, ${newLocation.country}`
      );
      console.log(
        `[CommandHandler] 位置已更新: ${newLocation.city}, ${newLocation.country}`
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error(`[CommandHandler] 刷新位置失败: ${errorMsg}`);
      this.statusBarUI.showError(errorMsg);
      vscode.window.showErrorMessage(`刷新位置失败: ${errorMsg}`);
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

    // 更新使用统计会话信息
    this.usageManager.updateCurrentSession(this.currentLocation, weather.description);
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
   * 监听窗口焦点变化
   * 窗口获得焦点时恢复计时，失去焦点时暂停
   */
  private setupWindowFocusListener(): void {
    this.windowStateListener = vscode.window.onDidChangeWindowState((event) => {
      if (event.focused) {
        console.log('[CommandHandler] VS Code窗口获得焦点，恢复计时');
        this.usageManager.resumeSession();
      } else {
        console.log('[CommandHandler] VS Code窗口失去焦点，暂停计时');
        this.usageManager.pauseSession();
      }
    });
  }

  /**
   * 处理显示使用统计命令
   */
  private handleShowUsageStats(): void {
    console.log('[CommandHandler] 执行显示使用统计命令');
    // 此命令将由UsagePanel处理，这里只是注册入口
    vscode.commands.executeCommand('usageStats.openPanel');
  }

  /**
   * 处理重置使用统计命令
   */
  private async handleResetUsageStats(): Promise<void> {
    console.log('[CommandHandler] 执行重置使用统计命令');
    
    const confirmed = await vscode.window.showWarningMessage(
      '确定要清空所有使用统计数据吗？此操作无法撤销。',
      { modal: true },
      '清空数据'
    );
    
    if (confirmed === '清空数据') {
      try {
        await this.usageManager.resetStats();
        vscode.window.showInformationMessage('✓ 使用统计数据已成功清空！');
        console.log('[CommandHandler] 使用统计数据重置成功');
        
        // 刷新使用统计面板的数据（如果面板已打开）
        this.usagePanel.refreshData();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '未知错误';
        vscode.window.showErrorMessage(`清空统计数据失败: ${errorMsg}`);
        console.error('[CommandHandler] 重置统计数据失败:', errorMsg);
      }
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 结束使用统计会话
    this.usageManager.endSession();

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    if (this.windowStateListener) {
      this.windowStateListener.dispose();
    }
  }
}
