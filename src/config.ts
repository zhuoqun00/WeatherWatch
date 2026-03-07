/**
 * 配置管理模块
 * 负责读取和管理VS Code扩展配置
 */

import * as vscode from 'vscode';
import { ExtensionConfig } from './types';

/**
 * 配置管理器类
 * 管理来自settings.json的扩展配置
 */
export class ConfigManager {
  private static readonly CONFIG_SECTION = 'weather';

  /**
   * 获取所有扩展配置
   * @returns 扩展配置对象
   */
  static getConfig(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);

    return {
      refreshInterval: config.get('refreshInterval', 10),
      temperatureUnit: (config.get('temperatureUnit', 'C') as 'C' | 'F') || 'C',
      city: config.get('city'),
      autoRefresh: config.get('autoRefresh', true),
    };
  }

  /**
   * 获取自动刷新间隔（分钟）
   * @returns 刷新间隔（分钟）
   */
  static getRefreshInterval(): number {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    const interval = config.get<number>('refreshInterval', 10);
    // 确保最小值为1分钟，最大值为120分钟
    return Math.max(1, Math.min(120, interval));
  }

  /**
   * 获取温度单位
   * @returns 温度单位 (C/F)
   */
  static getTemperatureUnit(): 'C' | 'F' {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    const unit = config.get<'C' | 'F'>('temperatureUnit', 'C');
    return unit === 'F' ? 'F' : 'C';
  }

  /**
   * 获取手动设置的城市名称
   * @returns 城市名称或undefined
   */
  static getCity(): string | undefined {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    return config.get('city');
  }

  /**
   * 检查是否启用自动刷新
   * @returns true表示启用自动刷新
   */
  static isAutoRefreshEnabled(): boolean {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    return config.get('autoRefresh', true);
  }

  /**
   * 获取插件显示语言
   * @returns 语言代码 ('en-US' 或 'zh-CN')
   */
  static getLanguage(): 'en-US' | 'zh-CN' {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    const lang = config.get<string>('language', 'en-US');
    return lang === 'zh-CN' ? 'zh-CN' : 'en-US';
  }

  /**
   * 设置城市名称
   * @param city 城市名称
   */
  static async setCity(city: string | null): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    await config.update('city', city, vscode.ConfigurationTarget.Global);
  }

  /**
   * 设置温度单位
   * @param unit 温度单位 (C/F)
   */
  static async setTemperatureUnit(unit: 'C' | 'F'): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    await config.update('temperatureUnit', unit, vscode.ConfigurationTarget.Global);
  }

  /**
   * 注册配置变更监听器
   * @param callback 配置变更时的回调函数
   * @returns 取消订阅函数
   */
  static onConfigChange(callback: (config: ExtensionConfig) => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(this.CONFIG_SECTION)) {
        const newConfig = this.getConfig();
        callback(newConfig);
      }
    });
  }
}
