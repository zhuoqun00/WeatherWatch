/**
 * 使用统计面板模块
 * 负责管理WebView面板用于显示使用统计数据
 */

import * as vscode from 'vscode';
import { UsageManager } from './usageManager';
import { TimeRange } from './types';
import { getI18n } from './i18n/i18nManager';

/**
 * 使用统计面板管理器
 */
export class UsagePanel {
  private context: vscode.ExtensionContext;
  private usageManager: UsageManager;
  private panel: vscode.WebviewPanel | undefined;
  private disposables: vscode.Disposable[] = [];

  constructor(context: vscode.ExtensionContext, usageManager: UsageManager) {
    this.context = context;
    this.usageManager = usageManager;

    // 注册命令处理器
    this.registerCommandHandler();
  }

  /**
   * 注册命令处理器
   */
  private registerCommandHandler(): void {
    const disposable = vscode.commands.registerCommand(
      'usageStats.openPanel',
      () => {
        this.showPanel();
      }
    );
    this.disposables.push(disposable);
  }

  /**
   * 刷新面板数据（供外部使用，如重置后刷新）
   */
  refreshData(): void {
    if (this.panel) {
      console.log('[UsagePanel] 刷新面板数据');
      // 获取当前选中的时间范围，如果面板没有显式保存，默认使用 'today'
      this.sendDataToWebview('all');
    }
  }

  /**
   * 打开或切到前台使用统计面板
   */
  showPanel(): void {
    console.log('[UsagePanel] showPanel 被调用');
    
    if (this.panel) {
      // 面板已存在，切到前台
      console.log('[UsagePanel] 面板已存在，切到前台');
      this.panel.reveal(vscode.ViewColumn.One);
      this.sendDataToWebview('today');
      return;
    }

    console.log('[UsagePanel] 创建新的WebView面板');
    // 创建新的WebView面板
    const i18n = getI18n();
    this.panel = vscode.window.createWebviewPanel(
      'usageStats',
      i18n.t('usagePanel.title'),
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')],
      }
    );

    // 设置HTML内容
    this.panel.webview.html = this.createWebviewContent();
    console.log('[UsagePanel] WebView HTML 已设置');

    // 监听来自WebView的消息
    this.panel.webview.onDidReceiveMessage(
      (message) => {
        console.log('[UsagePanel] onDidReceiveMessage 监听器被触发');
        this.onDidReceiveMessage(message);
      },
      undefined,
      this.disposables
    );
    console.log('[UsagePanel] onDidReceiveMessage 监听器已注册');

    // 监听面板关闭事件
    this.panel.onDidDispose(
      () => {
        console.log('[UsagePanel] 面板已关闭');
        this.panel = undefined;
      },
      undefined,
      this.disposables
    );

    // 初始化发送数据
    console.log('[UsagePanel] 发送初始数据给WebView');
    this.sendDataToWebview('today');
  }

  /**
   * 创建WebView的HTML内容
   */
  private createWebviewContent(): string {
    const i18n = getI18n();
    
    // 获取所有需要的翻译文本
    const translations = {
      title: i18n.t('usagePanel.title'),
      refreshBtn: i18n.t('usagePanel.buttons.refresh'),
      tab1: i18n.t('usagePanel.tabs.overview'),
      tab2: i18n.t('usagePanel.tabs.locations'),
      tab3: i18n.t('usagePanel.tabs.weather'),
      today: i18n.t('usagePanel.timeRange.today'),
      week: i18n.t('usagePanel.timeRange.week'),
      month: i18n.t('usagePanel.timeRange.month'),
      all: i18n.t('usagePanel.timeRange.all'),
      loading: i18n.t('usagePanel.table.loading'),
      dailyChart: i18n.t('usagePanel.charts.daily30Days'),
      locationHeader: i18n.t('usagePanel.table.location'),
      weatherHeader: i18n.t('usagePanel.table.weather'),
      durationHeader: i18n.t('usagePanel.table.duration'),
      percentageHeader: i18n.t('usagePanel.table.percentage'),
      noData: i18n.t('usagePanel.table.noData'),
      totalDuration: i18n.t('usagePanel.cards.totalDuration'),
      minutesFormat: i18n.t('usagePanel.formats.minutes'),
      hoursFormat: i18n.t('usagePanel.formats.hours'),
      hoursMinutesFormat: i18n.t('usagePanel.formats.hoursMinutes'),
    };

    return this.getWebviewContent(translations);
  }

  /**
   * 获取WebView的HTML内容
   */
  private getWebviewContent(translations: any): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${translations.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
                'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            padding: 16px;
            line-height: 1.6;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-widget-border);
        }

        .title {
            font-size: 24px;
            font-weight: 600;
        }

        .buttons {
            display: flex;
            gap: 8px;
        }

        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }

        button:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .tabs {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--vscode-widget-border);
        }

        .tab-button {
            background: none;
            color: var(--vscode-foreground);
            border: none;
            padding: 12px 16px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
        }

        .tab-button:hover {
            background: var(--vscode-list-hoverBackground);
        }

        .tab-button.active {
            border-bottom-color: var(--vscode-activityBar-activeBorder);
            color: var(--vscode-activityBar-activeBorder);
        }

        .time-range-selector {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
        }

        .time-btn {
            padding: 6px 12px;
            font-size: 12px;
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .time-btn.active {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-color: var(--vscode-button-background);
        }

        .content {
            display: none;
        }

        .content.active {
            display: block;
        }

        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .card {
            background: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 6px;
            padding: 16px;
        }

        .card-title {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .card-value {
            font-size: 28px;
            font-weight: 600;
            color: var(--vscode-foreground);
        }

        .card-unit {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }

        .chart-container {
            background: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 24px;
        }

        .chart-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .chart-bars {
            display: flex;
            align-items: flex-end;
            gap: 4px;
            height: 150px;
        }

        .bar-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            gap: 4px;
            text-align: center;
        }

        .bar {
            width: 100%;
            background: var(--vscode-activityBar-activeBorder);
            border-radius: 4px 4px 0 0;
            min-height: 2px;
            transition: all 0.2s;
        }

        .bar:hover {
            opacity: 0.8;
        }

        .bar-label {
            font-size: 10px;
            color: var(--vscode-descriptionForeground);
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .table-container {
            background: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 6px;
            overflow: hidden;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
        }

        .table thead {
            background: var(--vscode-list-hoverBackground);
        }

        .table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            color: var(--vscode-foreground);
            border-bottom: 1px solid var(--vscode-widget-border);
        }

        .table td {
            padding: 12px;
            font-size: 13px;
            border-bottom: 1px solid var(--vscode-widget-border);
        }

        .table tbody tr:hover {
            background: var(--vscode-list-hoverBackground);
        }

        .progress-bar {
            width: 100%;
            height: 6px;
            background: var(--vscode-widget-border);
            border-radius: 3px;
            overflow: hidden;
            margin: 4px 0;
        }

        .progress-fill {
            height: 100%;
            background: var(--vscode-activityBar-activeBorder);
            border-radius: 3px;
        }

        .empty-state {
            text-align: center;
            color: var(--vscode-descriptionForeground);
            padding: 40px 20px;
        }

        .loading {
            text-align: center;
            color: var(--vscode-descriptionForeground);
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">${translations.title}</div>
            <div class="buttons">
                <button onclick="refreshData()" title="${translations.refreshBtn}">${translations.refreshBtn}</button>
            </div>
        </div>

        <div class="tabs">
            <button class="tab-button active" onclick="switchTab('overview')">${translations.tab1}</button>
            <button class="tab-button" onclick="switchTab('locations')">${translations.tab2}</button>
            <button class="tab-button" onclick="switchTab('weather')">${translations.tab3}</button>
        </div>

        <!-- 总时长标签页 -->
        <div id="overview" class="content active">
            <div class="time-range-selector">
                <button class="time-btn active" onclick="switchTimeRange('today')">${translations.today}</button>
                <button class="time-btn" onclick="switchTimeRange('week')">${translations.week}</button>
                <button class="time-btn" onclick="switchTimeRange('month')">${translations.month}</button>
                <button class="time-btn" onclick="switchTimeRange('all')">${translations.all}</button>
            </div>

            <div class="cards" id="overviewCards">
                <div class="card">
                    <div class="card-title">${translations.loading}</div>
                </div>
            </div>

            <div class="chart-container">
                <div class="chart-title">${translations.dailyChart}</div>
                <div class="chart-bars" id="dailyChart">
                    <div class="loading">${translations.loading}</div>
                </div>
            </div>
        </div>

        <!-- 位置分布标签页 -->
        <div id="locations" class="content">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>${translations.locationHeader}</th>
                            <th>${translations.durationHeader}</th>
                            <th>${translations.percentageHeader}</th>
                        </tr>
                    </thead>
                    <tbody id="locationsTable">
                        <tr>
                            <td colspan="3" style="text-align: center; color: var(--vscode-descriptionForeground);">${translations.loading}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 天气分布标签页 -->
        <div id="weather" class="content">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>${translations.weatherHeader}</th>
                            <th>${translations.durationHeader}</th>
                            <th>${translations.percentageHeader}</th>
                        </tr>
                    </thead>
                    <tbody id="weatherTable">
                        <tr>
                            <td colspan="3" style="text-align: center; color: var(--vscode-descriptionForeground);">${translations.loading}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        // 立即输出日志，验证脚本是否执行
        console.error('====== WeatherWatch UsagePanel 脚本开始执行 ======');
        
        const vscode = acquireVsCodeApi();
        console.error('====== vscode API 已获取 ======');
        
        let currentTimeRange = 'today';
        let currentTab = 'overview';
        let statsData = null;

        function switchTab(tabName) {
            // 隐藏所有内容
            document.querySelectorAll('.content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));

            // 显示选中的标签页
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');

            currentTab = tabName;
            updateDisplay();
        }

        function switchTimeRange(range) {
            currentTimeRange = range;
            document.querySelectorAll('.time-btn').forEach(el => el.classList.remove('active'));
            event.target.classList.add('active');

            requestData(range);
        }

        function requestData(timeRange) {
            vscode.postMessage({
                command: 'getRangeData',
                timeRange: timeRange
            });
        }

        function refreshData() {
            requestData(currentTimeRange);
        }

        // 使用事件委托监听按钮点击，刷新数据
        document.addEventListener('click', function(event) {
            const target = event.target;
            const button = target.closest('button');
            
            if (!button) return;
            
            // 所有按钮点击都已通过onclick属性处理
            // 这里只是为了确保事件正确传播
        }, true);
        
        console.log('[UsagePanel] WebView 脚本已加载，重置数据请使用命令: weather.resetUsageStats');

        function formatMinutes(minutes) {
            const minutesFormat = ${JSON.stringify(translations.minutesFormat)};
            const hoursFormat = ${JSON.stringify(translations.hoursFormat)};
            const hoursMinutesFormat = ${JSON.stringify(translations.hoursMinutesFormat)};
            
            if (minutes < 60) {
                return minutesFormat.replace('\${minutes}', minutes);
            }
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (mins === 0) {
                return hoursFormat.replace('\${hours}', hours);
            }
            return hoursMinutesFormat.replace('\${hours}', hours).replace('\${minutes}', mins);
        }

        function formatHM(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return \`\${hours}:\${String(mins).padStart(2, '0')}\`;
        }

        function updateDisplay() {
            if (!statsData) return;

            if (currentTab === 'overview') {
                renderOverview();
            } else if (currentTab === 'locations') {
                renderLocations();
            } else if (currentTab === 'weather') {
                renderWeather();
            }
        }

        function renderOverview() {
            const totalMinutes = statsData.totalMinutes || 0;
            
            const cardsHtml = \`
                <div class="card">
                    <div class="card-title">${translations.totalDuration}</div>
                    <div class="card-value">\${formatMinutes(totalMinutes)}</div>
                </div>
            \`;

            document.getElementById('overviewCards').innerHTML = cardsHtml;

            // 渲染每日图表
            renderDailyChart();
        }

        function renderDailyChart() {
            const dailyBreakdown = statsData.dailyBreakdown || [];
            
            if (dailyBreakdown.length === 0) {
                document.getElementById('dailyChart').innerHTML = '<div class="empty-state">${translations.noData}</div>';
                return;
            }

            // 获取最后30天的数据
            const last30Days = dailyBreakdown.slice(-30);
            const maxMinutes = Math.max(...last30Days.map(d => d.minutes), 1);

            const barsHtml = last30Days.map(day => {
                const percentage = (day.minutes / maxMinutes) * 100;
                const date = new Date(day.date);
                const label = \`\${date.getMonth() + 1}/\${date.getDate()}\`;
                return \`
                    <div class="bar-wrapper" title="\${label}: \${formatMinutes(day.minutes)}">
                        <div class="bar" style="height: \${Math.max(percentage, 5)}%"></div>
                        <div class="bar-label">\${label}</div>
                    </div>
                \`;
            }).join('');

            document.getElementById('dailyChart').innerHTML = barsHtml;
        }

        function renderLocations() {
            const locations = statsData.locationStats || [];
            
            if (locations.length === 0) {
                document.getElementById('locationsTable').innerHTML = 
                    '<tr><td colspan="3" style="text-align: center; color: var(--vscode-descriptionForeground);">${translations.noData}</td></tr>';
                return;
            }

            const totalMinutes = locations.reduce((sum, loc) => sum + loc.minutes, 0);

            const rowsHtml = locations.map(location => {
                const percentage = Math.round((location.minutes / totalMinutes) * 100);
                return \`
                    <tr>
                        <td>\${location.location}</td>
                        <td>\${formatHM(location.minutes)}</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div class="progress-bar" style="flex: 1;">
                                    <div class="progress-fill" style="width: \${percentage}%"></div>
                                </div>
                                <span>\${percentage}%</span>
                            </div>
                        </td>
                    </tr>
                \`;
            }).join('');

            document.getElementById('locationsTable').innerHTML = rowsHtml;
        }

        function renderWeather() {
            const weathers = statsData.weatherStats || [];
            
            if (weathers.length === 0) {
                document.getElementById('weatherTable').innerHTML = 
                    '<tr><td colspan="3" style="text-align: center; color: var(--vscode-descriptionForeground);">${translations.noData}</td></tr>';
                return;
            }

            const totalMinutes = weathers.reduce((sum, w) => sum + w.minutes, 0);

            const rowsHtml = weathers.map(weather => {
                const percentage = Math.round((weather.minutes / totalMinutes) * 100);
                return \`
                    <tr>
                        <td>\${weather.weather}</td>
                        <td>\${formatHM(weather.minutes)}</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div class="progress-bar" style="flex: 1;">
                                    <div class="progress-fill" style="width: \${percentage}%"></div>
                                </div>
                                <span>\${percentage}%</span>
                            </div>
                        </td>
                    </tr>
                \`;
            }).join('');

            document.getElementById('weatherTable').innerHTML = rowsHtml;
        }

        // 监听来自extension的消息
        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.command === 'updateData') {
                statsData = message.data;
                updateDisplay();
            }
        });

        // 初始化
        requestData(currentTimeRange);
    </script>
</body>
</html>
`;
  }

  /**
   * 处理来自WebView的消息
   */
  private onDidReceiveMessage(message: any): void {
    console.log('[UsagePanel] 收到来自WebView的消息:', message.command);
    
    if (message.command === 'getRangeData') {
      console.log('[UsagePanel] 获取时间范围数据:', message.timeRange);
      this.sendDataToWebview(message.timeRange);
    } else {
      console.warn('[UsagePanel] 收到未知命令:', message.command);
    }
  }

  /**
   * 发送数据给WebView
   */
  private sendDataToWebview(timeRange: TimeRange): void {
    if (!this.panel) {
      return;
    }

    const stats = this.usageManager.getStats(timeRange);

    this.panel.webview.postMessage({
      command: 'updateData',
      data: stats,
    });
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.panel) {
      this.panel.dispose();
    }

    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }
}
