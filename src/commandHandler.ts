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
import { getI18n } from './i18n/i18nManager';

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

    // 刷新位置命令
    disposables.push(
      vscode.commands.registerCommand('weather.refreshLocation', () =>
        this.handleRefreshLocation()
      )
    );

    // 设置显示语言命令
    disposables.push(
      vscode.commands.registerCommand('weather.setLanguage', () =>
        this.handleSetLanguage()
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
        const i18n = getI18n();
        throw new Error(i18n.t('messages.error.cannotGetLocation'));
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
   * 处理刷新位置命令
   * 重新自动检测当前位置
   */
  private async handleRefreshLocation(): Promise<void> {
    try {
      console.log('[CommandHandler] 执行刷新位置命令');
      this.statusBarUI.showLoading();

      const newLocation = await LocationProvider.getLocationFromIP();
      if (!newLocation) {
        const i18n = getI18n();
        throw new Error(i18n.t('messages.error.cannotDetectLocation'));
      }

      this.currentLocation = newLocation;

      // 清除配置中的手动城市设置（因为使用了自动检测）
      await ConfigManager.setCity('');

      // 获取新位置的天气信息
      await this.fetchAndUpdateWeather();

      const i18n = getI18n();
      vscode.window.showInformationMessage(
        `${i18n.t('messages.success.locationUpdated')} ${newLocation.city}, ${newLocation.country}`
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
        const i18n = getI18n();
        throw new Error(i18n.t('messages.error.locationUnavailable'));
      }

      await this.fetchAndUpdateWeather();
      const i18n = getI18n();
      vscode.window.showInformationMessage(i18n.t('messages.success.weatherUpdated'));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      const i18n = getI18n();
      console.error(`[CommandHandler] 刷新失败: ${errorMsg}`);
      this.statusBarUI.showError(errorMsg);
      vscode.window.showErrorMessage(`${i18n.t('messages.error.refreshFailed')}: ${errorMsg}`);
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
        const i18n = getI18n();
        throw new Error(i18n.tWithParams('messages.error.cannotFindCity', { city }));
      }

      this.currentLocation = location;

      // 保存到配置
      await ConfigManager.setCity(city);

      // 获取天气信息
      await this.fetchAndUpdateWeather();

      const i18n = getI18n();
      vscode.window.showInformationMessage(`${i18n.t('messages.success.locationSet')} ${location.city}`);
      console.log(`[CommandHandler] 位置已更新: ${location.city}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      const i18n = getI18n();
      console.error(`[CommandHandler] 设置位置失败: ${errorMsg}`);
      this.statusBarUI.showError(errorMsg);
      vscode.window.showErrorMessage(`${i18n.t('messages.error.setLocationFailed')}: ${errorMsg}`);
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

      const i18n = getI18n();
      vscode.window.showInformationMessage(`${i18n.t('messages.success.temperatureUnitToggled')} °${newUnit}`);
      console.log(`[CommandHandler] 温度单位已切换: ${newUnit}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      const i18n = getI18n();
      console.error(`[CommandHandler] 切换单位失败: ${errorMsg}`);
      vscode.window.showErrorMessage(`${i18n.t('messages.error.toggleUnitFailed')}: ${errorMsg}`);
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

      const i18n = getI18n();
      const status = !isEnabled ? i18n.t('messages.success.autoRefreshEnabled') : i18n.t('messages.success.autoRefreshDisabled');
      vscode.window.showInformationMessage(status);
      console.log(`[CommandHandler] ${status}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      const i18n = getI18n();
      console.error(`[CommandHandler] 切换自动刷新失败: ${errorMsg}`);
      vscode.window.showErrorMessage(`${i18n.t('messages.error.toggleAutoRefreshFailed')}: ${errorMsg}`);
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
   * 处理设置显示语言命令
   */
  private async handleSetLanguage(): Promise<void> {
    const i18n = getI18n();
    const currentLang = i18n.getCurrentLanguage();

    const items: vscode.QuickPickItem[] = [
      {
        label: 'English',
        description: 'en-US',
        picked: currentLang === 'en-US',
      },
      {
        label: '中文（简体）',
        description: 'zh-CN',
        picked: currentLang === 'zh-CN',
      },
    ];

    const selected = await vscode.window.showQuickPick(items, {
      title: i18n.t('commands.titles.setLanguage'),
      placeHolder: i18n.t('commands.titles.setLanguage'),
      canPickMany: false,
    });

    if (!selected || selected.description === currentLang) {
      return;
    }

    const newLang = selected.description as 'en-US' | 'zh-CN';
    await vscode.workspace
      .getConfiguration('weather')
      .update('language', newLang, vscode.ConfigurationTarget.Global);

    console.log(`[CommandHandler] 显示语言已设置为: ${newLang}`);

    // 语言切换后刷新天气，使新语言的天气描述立即生效
    if (this.currentLocation) {
      await this.fetchAndUpdateWeather();
    }
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
