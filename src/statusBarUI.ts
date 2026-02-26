/**
 * 状态栏UI模块
 * 负责管理状态栏中的天气信息显示
 */

import * as vscode from 'vscode';
import { WeatherInfo } from './types';
import { WeatherProvider } from './weatherProvider';

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
    this.statusBarItem.name = '天气信息';
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
    const markdown = new vscode.MarkdownString();
    markdown.supportHtml = true;

    const tempF = WeatherProvider.formatTemperature(weather.temperature, 'F');
    const tempC = WeatherProvider.formatTemperature(weather.temperature, 'C');
    const feelsLikeC = WeatherProvider.formatTemperature(weather.feelsLike, 'C');
    const feelsLikeF = WeatherProvider.formatTemperature(weather.feelsLike, 'F');
    const sunriseTime = new Date(weather.sunrise).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const sunsetTime = new Date(weather.sunset).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    markdown.appendMarkdown(`# ${weather.location.city} 的天气\n\n`);
    markdown.appendMarkdown(`**位置**: ${weather.location.city}, ${weather.location.region}, ${weather.location.country}\n\n`);

    markdown.appendMarkdown(`## 当前天气\n\n`);
    markdown.appendMarkdown(`- **天气**: ${weather.description} ${weather.icon}\n`);
    markdown.appendMarkdown(
      `- **温度**: ${tempC} / ${tempF} (体感: ${feelsLikeC} / ${feelsLikeF})\n`
    );
    markdown.appendMarkdown(`- **最高/最低**: ${weather.temperatureMax.toFixed(1)}°C / ${weather.temperatureMin.toFixed(1)}°C\n`);

    markdown.appendMarkdown(`## 气象数据\n\n`);
    markdown.appendMarkdown(`- **湿度**: ${weather.humidity}%\n`);
    markdown.appendMarkdown(`- **风速**: ${weather.windSpeed.toFixed(1)} km/h\n`);
    markdown.appendMarkdown(`- **阵风**: ${weather.windGust.toFixed(1)} km/h\n`);
    markdown.appendMarkdown(`- **风向**: ${this.getWindDirection(weather.windDirection)}\n`);
    markdown.appendMarkdown(`- **能见度**: ${weather.visibility.toFixed(1)} km\n`);
    markdown.appendMarkdown(`- **气压**: ${weather.pressure.toFixed(1)} hPa\n`);
    markdown.appendMarkdown(`- **紫外线指数**: ${weather.uvIndex.toFixed(1)}\n`);
    markdown.appendMarkdown(`- **云量**: ${weather.cloudCover}%\n`);
    markdown.appendMarkdown(`- **降水**: ${weather.precipitation.toFixed(1)} mm\n`);

    markdown.appendMarkdown(`## 日出日落\n\n`);
    markdown.appendMarkdown(`- **日出**: ${sunriseTime}\n`);
    markdown.appendMarkdown(`- **日落**: ${sunsetTime}\n`);

    markdown.appendMarkdown(`\n*更新时间: ${new Date(weather.timestamp).toLocaleTimeString('zh-CN')}*\n`);

    return markdown;
  }

  /**
   * 根据风向度数获取风向文字
   * @param direction 风向（度数）
   * @returns 风向文字
   */
  private getWindDirection(direction: number): string {
    const directions = ['北', '北东北', '东北', '东东北', '东', '东东南', '东南', '南东南',
                        '南', '南西南', '西南', '西西南', '西', '西西北', '西北', '北西北'];
    const index = Math.round((direction % 360) / 22.5) % 16;
    return directions[index];
  }

  /**
   * 显示详细天气信息面板
   */
  async showDetailsPanel(): Promise<void> {
    if (!this.currentWeather) {
      vscode.window.showInformationMessage('暂无天气数据，请先刷新');
      return;
    }

    const weather = this.currentWeather;
    const options: vscode.QuickPickItem[] = [
      {
        label: `📍 位置: ${weather.location.city}, ${weather.location.country}`,
        description: `${weather.location.latitude.toFixed(2)}°, ${weather.location.longitude.toFixed(2)}°`,
      },
      {
        label: `${weather.icon} 当前天气: ${weather.description}`,
        description: `温度 ${WeatherProvider.formatTemperature(weather.temperature, this.temperatureUnit)}`,
      },
      {
        label: `🌡️ 温度范围`,
        description: `${weather.temperatureMax.toFixed(1)}°C ~ ${weather.temperatureMin.toFixed(1)}°C`,
      },
      {
        label: `💧 湿度: ${weather.humidity}%`,
        description: `体感温度: ${WeatherProvider.formatTemperature(weather.feelsLike, this.temperatureUnit)}`,
      },
      {
        label: `💨 风速: ${weather.windSpeed.toFixed(1)} km/h`,
        description: `阵风: ${weather.windGust.toFixed(1)} km/h`,
      },
      {
        label: `👁️ 能见度: ${weather.visibility.toFixed(1)} km`,
        description: `气压: ${weather.pressure.toFixed(1)} hPa`,
      },
      {
        label: `☀️ 紫外线指数: ${weather.uvIndex.toFixed(1)}`,
        description: `云量: ${weather.cloudCover}%`,
      },
    ];

    await vscode.window.showQuickPick(options, {
      title: `${weather.location.city} 详细天气信息`,
      placeHolder: '查看更多天气详情',
      canPickMany: false,
    });
  }

  /**
   * 显示加载状态
   */
  showLoading(): void {
    this.statusBarItem.text = '$(loading~spin) 正在加载天气...';
    this.statusBarItem.show();
    console.log('⏳ 显示加载状态');
  }

  /**
   * 显示错误状态
   * @param error 错误信息
   */
  showError(error: string): void {
    this.statusBarItem.text = '$(error) 天气获取失败';
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
