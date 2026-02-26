# 快速开始指南 | Quick Start Guide

[中文](#中文快速开始指南) | [English](#english-quick-start-guide)

## 中文快速开始指南

### 安装和使用

#### 步骤 1: 安装插件

有两种方式安装：

**方式 A: 从 VS Code 市场安装（推荐）**
1. 打开 VS Code
2. 按 `Ctrl+Shift+X` 打开扩展管理器
3. 搜索 "VS Code Weather"
4. 点击 "Install" 按钮

**方式 B: 手动安装 VSIX 文件**
1. 从 [Releases](https://github.com/yourusername/vscode-weather/releases) 下载最新的 `.vsix` 文件
2. 在 VS Code 中，按 `Ctrl+Shift+P` 打开命令面板
3. 输入 "Extensions: Install from VSIX"
4. 选择下载的 `.vsix` 文件

#### 步骤 2: 首次启动

插件安装后会自动激活。你会看到：
1. 状态栏右侧出现天气信息
2. 插件自动检测你的位置（基于 IP）
3. 显示当前的天气信息

#### 步骤 3: 基本操作

- **查看详细天气**：点击状态栏的天气信息
- **手动刷新**：按 `Ctrl+Shift+R` 或命令面板搜索 "Weather: Refresh"
- **设置位置**：命令面板搜索 "Weather: Set Location"
- **切换温度单位**：命令面板搜索 "Weather: Toggle Temperature Unit"

### 配置示例

#### 示例 1: 设置手动城市

在 `settings.json` 中添加：

```json
{
  "weather.city": "Shanghai"
}
```

插件会使用上海的天气而不是基于 IP 的自动检测。

#### 示例 2: 更改刷新间隔和温度单位

```json
{
  "weather.refreshInterval": 30,      // 每 30 分钟刷新一次
  "weather.temperatureUnit": "F",     // 显示华氏度
  "weather.autoRefresh": true         // 启用自动刷新
}
```

#### 示例 3: 禁用自动刷新

```json
{
  "weather.autoRefresh": false
}
```

然后手动使用 `Weather: Refresh` 命令更新天气。

### 常见操作

#### 更改位置

1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "Weather: Set Location"
3. 输入城市名称（如 "Beijing", "Shanghai", "London"）
4. 按 Enter

#### 更改温度单位

1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "Weather: Toggle Temperature Unit"
3. 按 Enter

#### 手动刷新天气

- 快捷键：`Ctrl+Shift+R`
- 或命令面板搜索：`Weather: Refresh`

#### 查看所有天气信息

1. 点击状态栏的天气显示
2. 会弹出详细信息面板

### 故障排除

#### Q: 怎么检查插件是否正常工作？
**A:** 状态栏右侧应该显示天气信息。如果没有显示，检查：
- 网络连接是否正常
- VS Code 开发者控制台是否有错误信息
- 尝试手动运行 `Weather: Refresh` 命令

#### Q: 为什么检测到的位置不准确？
**A:** IP 定位的准确度通常在城市级别。如果不准确，可以手动设置城市名称：
1. 运行命令 `Weather: Set Location`
2. 输入正确的城市名称

#### Q: 天气数据多久更新一次？
**A:** 默认每 10 分钟自动更新。可以在 `weather.refreshInterval` 配置中修改（1-120 分钟）。

#### Q: 这会收集我的位置信息吗？
**A:** 不会。
- IP 定位是匿名的，不存储任何个人数据
- 天气数据请求也是匿名的
- 所有数据都通过公开 API 获取

#### Q: 支持哪些城市？
**A:** 支持全球大多数城市。可以尝试输入：
- 英文城市名（推荐）：London, Paris, Tokyo
- 中文城市名：北京, 上海, 深圳
- 城市拼音：beijing, shanghai

### 系统要求

- VS Code 1.60.0 或更新版本
- 活跃的网络连接
- 不需要代理或 VPN（某些 VPN 可能影响位置检测）

### 键盘快捷方式

| 快捷方式 | 功能 |
|---------|------|
| `Ctrl+Shift+R` | 刷新天气 |
| `Ctrl+Shift+P` > Weather: | 所有天气命令 |

### 反馈和支持

- 遇到问题？[GitHub Issues](https://github.com/yourusername/vscode-weather/issues)
- 有建议？[GitHub Discussions](https://github.com/yourusername/vscode-weather/discussions)

---

## English Quick Start Guide

### Installation and Usage

#### Step 1: Install the Extension

There are two ways to install:

**Method A: Install from VS Code Marketplace (Recommended)**
1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions Manager
3. Search for "VS Code Weather"
4. Click the "Install" button

**Method B: Manual Installation with VSIX File**
1. Download the latest `.vsix` file from [Releases](https://github.com/yourusername/vscode-weather/releases)
2. In VS Code, press `Ctrl+Shift+P` to open Command Palette
3. Type "Extensions: Install from VSIX"
4. Select the downloaded `.vsix` file

#### Step 2: First Launch

After installation, the extension will automatically activate:
1. Weather information appears on the right side of the status bar
2. The extension automatically detects your location (based on IP)
3. Current weather information is displayed

#### Step 3: Basic Operations

- **View detailed weather**: Click the weather info in the status bar
- **Manual refresh**: Press `Ctrl+Shift+R` or search "Weather: Refresh" in Command Palette
- **Set location**: Search "Weather: Set Location" in Command Palette
- **Toggle temperature unit**: Search "Weather: Toggle Temperature Unit"

### Configuration Examples

#### Example 1: Set Manual City

Add to `settings.json`:

```json
{
  "weather.city": "Shanghai"
}
```

The extension will use Shanghai's weather instead of IP-based auto-detection.

#### Example 2: Change Refresh Interval and Temperature Unit

```json
{
  "weather.refreshInterval": 30,      // Refresh every 30 minutes
  "weather.temperatureUnit": "F",     // Display in Fahrenheit
  "weather.autoRefresh": true         // Enable auto-refresh
}
```

#### Example 3: Disable Auto-refresh

```json
{
  "weather.autoRefresh": false
}
```

Then manually use the `Weather: Refresh` command to update weather.

### Common Operations

#### Change Location

1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "Weather: Set Location"
3. Enter a city name (e.g., "Beijing", "Shanghai", "London")
4. Press Enter

#### Change Temperature Unit

1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "Weather: Toggle Temperature Unit"
3. Press Enter

#### Manually Refresh Weather

- Keyboard shortcut: `Ctrl+Shift+R`
- Or search in Command Palette: `Weather: Refresh`

#### View All Weather Information

1. Click the weather display in the status bar
2. A detailed information panel will pop up

### Troubleshooting

#### Q: How do I check if the extension is working correctly?
**A:** You should see weather information on the right side of the status bar. If not, check:
- Internet connection is working
- Check VS Code developer console for error messages
- Try running the `Weather: Refresh` command manually

#### Q: Why is the detected location inaccurate?
**A:** IP geolocation accuracy is typically at the city level. If inaccurate, you can manually set the city:
1. Run the `Weather: Set Location` command
2. Enter the correct city name

#### Q: How often is weather data updated?
**A:** By default, it updates automatically every 10 minutes. You can change this in the `weather.refreshInterval` configuration (1-120 minutes).

#### Q: Does this collect my location information?
**A:** No.
- IP geolocation is anonymous; no personal data is stored
- Weather data requests are also anonymous
- All data is fetched through public APIs

#### Q: Which cities are supported?
**A:** Most cities worldwide are supported. You can try:
- English city names (recommended): London, Paris, Tokyo
- Chinese city names: 北京, 上海, 深圳
- City pinyin: beijing, shanghai

### System Requirements

- VS Code 1.60.0 or later
- Active internet connection
- No proxy or VPN required (though some VPNs may affect location detection)

### Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| `Ctrl+Shift+R` | Refresh Weather |
| `Ctrl+Shift+P` > Weather: | All Weather Commands |

### Feedback and Support

- Found a bug? [GitHub Issues](https://github.com/yourusername/vscode-weather/issues)
- Have a suggestion? [GitHub Discussions](https://github.com/yourusername/vscode-weather/discussions)
