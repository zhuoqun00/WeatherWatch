/**
 * 状态栏UI模块
 * 负责管理状态栏中的天气信息显示
 */

import * as vscode from 'vscode';
import { WeatherInfo } from './types';
import { WeatherProvider } from './weatherProvider';
import { getI18n } from './i18n/i18nManager';

/**
 * 状态栏UI管理器
 * 负责在VS Code状态栏显示和更新天气信息
 */
export class StatusBarUI {
  private statusBarItem: vscode.StatusBarItem;
  private currentWeather: WeatherInfo | null = null;
  private temperatureUnit: 'C' | 'F' = 'C';

  constructor() {
    // 创建状态栏项，显示在右侧
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    const i18n = getI18n();
    this.statusBarItem.name = i18n.t('ui.statusBar.name');
    this.statusBarItem.command = 'weather.showDetails';
    console.log('✓ 状态栏项已创建');
  }

  /**
   * 更新状态栏显示内容
   * @param weather 天气信息
   * @param unit 温度单位
   */
  updateWeather(weather: WeatherInfo, unit: 'C' | 'F' = 'C'): void {
    this.currentWeather = weather;
    this.temperatureUnit = unit;

    // 格式化温度
    const temperature = WeatherProvider.formatTemperature(weather.temperature, unit);

    // 构建状态栏文本
    const statusText = `${weather.icon} ${weather.description} ${temperature}`;
    const tooltip = this.buildTooltip(weather);

    this.statusBarItem.text = statusText;
    this.statusBarItem.tooltip = tooltip;
    this.statusBarItem.show();
    
    console.log(`✓ 状态栏已更新: ${statusText}`);
  }

  /**
   * 构建状态栏悬停提示信息
   * @param weather 天气信息
   * @returns 提示信息
   */
  private buildTooltip(weather: WeatherInfo): vscode.MarkdownString {
    const i18n = getI18n();
    const markdown = new vscode.MarkdownString();
    markdown.supportHtml = true;

    const tempF = WeatherProvider.formatTemperature(weather.temperature, 'F');
    const tempC = WeatherProvider.formatTemperature(weather.temperature, 'C');
    const feelsLikeC = WeatherProvider.formatTemperature(weather.feelsLike, 'C');
    const feelsLikeF = WeatherProvider.formatTemperature(weather.feelsLike, 'F');
    const locale = i18n.getLocale();
    const sunriseTime = new Date(weather.sunrise).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
    const sunsetTime = new Date(weather.sunset).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });

    markdown.appendMarkdown(`# ${weather.location.city} ${i18n.t('weather.tooltips.location')}\n\n`);
    markdown.appendMarkdown(`**${i18n.t('ui.quickPick.location')}**: ${weather.location.city}, ${weather.location.region}, ${weather.location.country}\n\n`);

    markdown.appendMarkdown(`## ${i18n.t('ui.quickPick.currentWeather')}\n\n`);
    markdown.appendMarkdown(`- **${i18n.t('weather.tooltips.weather')}**: ${weather.description} ${weather.icon}\n`);
    markdown.appendMarkdown(
      `- **${i18n.t('weather.tooltips.temperature')}**: ${tempC} / ${tempF} (${i18n.t('weather.tooltips.feelsLike')}: ${feelsLikeC} / ${feelsLikeF})\n`
    );
    markdown.appendMarkdown(`- **${i18n.t('weather.tooltips.maxMin')}**: ${weather.temperatureMax.toFixed(1)}°C / ${weather.temperatureMin.toFixed(1)}°C\n`);

    markdown.appendMarkdown(`## ${i18n.t('usagePanel.title')}\n\n`);
    markdown.appendMarkdown(`- **${i18n.t('ui.quickPick.humidity')}**: ${weather.humidity}%\n`);
    markdown.appendMarkdown(`- **${i18n.t('ui.quickPick.windSpeed')}**: ${weather.windSpeed.toFixed(1)} km/h\n`);
    markdown.appendMarkdown(`- **${i18n.t('weather.tooltips.windGust')}**: ${weather.windGust.toFixed(1)} km/h\n`);
    markdown.appendMarkdown(`- **${i18n.t('weather.tooltips.windDirection')}**: ${this.getWindDirection(weather.windDirection)}\n`);
    markdown.appendMarkdown(`- **${i18n.t('ui.quickPick.visibility')}**: ${weather.visibility.toFixed(1)} km\n`);
    markdown.appendMarkdown(`- **${i18n.t('weather.tooltips.pressure')}**: ${weather.pressure.toFixed(1)} hPa\n`);
    markdown.appendMarkdown(`- **${i18n.t('ui.quickPick.uvIndex')}**: ${weather.uvIndex.toFixed(1)}\n`);
    markdown.appendMarkdown(`- **${i18n.t('weather.tooltips.cloudCover')}**: ${weather.cloudCover}%\n`);
    markdown.appendMarkdown(`- **${i18n.t('weather.tooltips.precipitation')}**: ${weather.precipitation.toFixed(1)} mm\n`);

    markdown.appendMarkdown(`## ${i18n.t('weather.tooltips.sunriseSunset')}\n\n`);
    markdown.appendMarkdown(`- **${i18n.t('weather.tooltips.sunrise')}**: ${sunriseTime}\n`);
    markdown.appendMarkdown(`- **${i18n.t('weather.tooltips.sunset')}**: ${sunsetTime}\n`);

    markdown.appendMarkdown(`\n*${i18n.t('weather.tooltips.updateTime')}: ${new Date(weather.timestamp).toLocaleTimeString(locale)}*\n`);

    return markdown;
  }

  /**
   * 根据风向度数获取风向文字
   * @param direction 风向（度数）
   * @returns 风向文字
   */
  private getWindDirection(direction: number): string {
    const i18n = getI18n();
    const directions = [
      i18n.t('weather.windDirections.N'),
      i18n.t('weather.windDirections.NNE'),
      i18n.t('weather.windDirections.NE'),
      i18n.t('weather.windDirections.ENE'),
      i18n.t('weather.windDirections.E'),
      i18n.t('weather.windDirections.ESE'),
      i18n.t('weather.windDirections.SE'),
      i18n.t('weather.windDirections.SSE'),
      i18n.t('weather.windDirections.S'),
      i18n.t('weather.windDirections.SSW'),
      i18n.t('weather.windDirections.SW'),
      i18n.t('weather.windDirections.WSW'),
      i18n.t('weather.windDirections.W'),
      i18n.t('weather.windDirections.WNW'),
      i18n.t('weather.windDirections.NW'),
      i18n.t('weather.windDirections.NNW'),
    ];
    const index = Math.round((direction % 360) / 22.5) % 16;
    return directions[index];
  }

  /**
   * 显示详细天气信息面板
   */
  async showDetailsPanel(): Promise<void> {
    const i18n = getI18n();
    if (!this.currentWeather) {
      vscode.window.showInformationMessage(i18n.t('ui.webview.noData'));
      return;
    }

    const weather = this.currentWeather;
    const options: vscode.QuickPickItem[] = [
      {
        label: `📍 ${i18n.t('ui.quickPick.location')}: ${weather.location.city}, ${weather.location.country}`,
        description: `${weather.location.latitude.toFixed(2)}°, ${weather.location.longitude.toFixed(2)}°`,
      },
      {
        label: `${weather.icon} ${i18n.t('ui.quickPick.currentWeather')}: ${weather.description}`,
        description: `${i18n.t('weather.tooltips.temperature')} ${WeatherProvider.formatTemperature(weather.temperature, this.temperatureUnit)}`,
      },
      {
        label: `🌡️ ${i18n.t('ui.quickPick.temperatureRange')}`,
        description: `${weather.temperatureMax.toFixed(1)}°C ~ ${weather.temperatureMin.toFixed(1)}°C`,
      },
      {
        label: `💧 ${i18n.t('ui.quickPick.humidity')}: ${weather.humidity}%`,
        description: `${i18n.t('weather.tooltips.feelsLike')}: ${WeatherProvider.formatTemperature(weather.feelsLike, this.temperatureUnit)}`,
      },
      {
        label: `💨 ${i18n.t('ui.quickPick.windSpeed')}: ${weather.windSpeed.toFixed(1)} km/h`,
        description: `${i18n.t('weather.tooltips.windGust')}: ${weather.windGust.toFixed(1)} km/h`,
      },
      {
        label: `👁️ ${i18n.t('ui.quickPick.visibility')}: ${weather.visibility.toFixed(1)} km`,
        description: `${i18n.t('weather.tooltips.pressure')}: ${weather.pressure.toFixed(1)} hPa`,
      },
      {
        label: `☀️ ${i18n.t('ui.quickPick.uvIndex')}: ${weather.uvIndex.toFixed(1)}`,
        description: `${i18n.t('weather.tooltips.cloudCover')}: ${weather.cloudCover}%`,
      },
    ];

    await vscode.window.showQuickPick(options, {
      title: `${weather.location.city} ${i18n.t('ui.details.detailsPanel')}`,
      placeHolder: i18n.t('ui.details.detailsPanel'),
      canPickMany: false,
    });
  }

  /**
   * 显示加载状态
   */
  showLoading(): void {
    const i18n = getI18n();
    this.statusBarItem.text = `$(loading~spin) ${i18n.t('ui.statusBar.loading')}`;
    this.statusBarItem.show();
    console.log('⏳ 显示加载状态');
  }

  /**
   * 显示错误状态
   * @param error 错误信息
   */
  showError(error: string): void {
    const i18n = getI18n();
    this.statusBarItem.text = `$(error) ${i18n.t('ui.statusBar.failed')}`;
    this.statusBarItem.tooltip = error;
    this.statusBarItem.show();
    console.error('❌ 错误状态:', error);
  }

  /**
   * 隐藏状态栏
   */
  hide(): void {
    this.statusBarItem.hide();
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.statusBarItem.dispose();
  }
}
