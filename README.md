# WeatherWatch | 天气守望

[English](#english) | [中文](#中文)

## 中文

### WeatherWatch 扩展 - VS Code 天气

一个专业的 VS Code 扩展，在编辑器状态栏实时显示当前位置的天气信息。支持自动位置检测、多种天气参数显示和灵活的配置选项。

### ✨ 主要功能

- **🌍 自动位置检测** - 通过 IP 地址自动获取用户位置
- **📍 手动设置位置** - 支持输入城市名称来覆盖自动定位
- **🌤️ 详细天气信息** - 显示温度、湿度、风速、能见度、紫外线指数等
- **🔄 自动刷新** - 可配置的自动刷新间隔（默认 10 分钟）
- **🌡️ 温度单位切换** - 支持摄氏度和华氏度
- **📊 详细天气面板** - 点击状态栏快速查看完整天气信息
- **⚙️ 灵活配置** - 通过 settings.json 自定义各项设置

### 📋 天气参数

状态栏显示：
- 当前温度（摄氏度/华氏度）
- 天气描述（晴朗、多云、下雨等）
- 天气图标（emoji）

详情面板包括：
- 位置信息（城市、坐标）
- 当前温度和体感温度
- 最高/最低温度
- 相对湿度
- 风速和阵风
- 风向
- 能见度
- 气压
- 紫外线指数
- 云量
- 降水量
- 日出日落时间

### 🚀 快速开始

#### 安装

1. 打开 VS Code
2. 进入扩展市场（Ctrl+Shift+X）
3. 搜索 "WeatherWatch"
4. 点击安装

#### 使用

启动 VS Code 后，插件会自动：
1. 获取您的位置（通过 IP）
2. 获取天气信息
3. 在状态栏右侧显示天气

**点击状态栏**的天气信息可查看详细天气数据。

### ⌨️ 命令

通过命令面板（Ctrl+Shift+P）访问：

- `Weather: 刷新天气` - 手动刷新天气信息
- `Weather: 设置位置` - 输入城市名称来设置位置
- `Weather: 显示天气详情` - 显示详细天气面板
- `Weather: 切换温度单位` - 在摄氏度和华氏度之间切换
- `Weather: 切换自动刷新` - 启用/禁用自动刷新

### 🎨 配置

在 `settings.json` 中配置以下选项：

```json
{
  "weather.refreshInterval": 10,           // 自动刷新间隔（分钟，1-120）
  "weather.temperatureUnit": "C",          // 温度单位：C 或 F
  "weather.city": null,                    // 手动设置的城市名称（可选）
  "weather.autoRefresh": true              // 是否启用自动刷新
}
```

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `weather.refreshInterval` | number | 10 | 自动刷新间隔（分钟），范围 1-120 |
| `weather.temperatureUnit` | string | C | 温度单位，C（摄氏度）或 F（华氏度） |
| `weather.city` | string | null | 手动设置的城市名称，设置后会覆盖 IP 定位 |
| `weather.autoRefresh` | boolean | true | 是否启用自动刷新功能 |

### 🔌 API 说明

- **天气数据** - 使用 [Open-Meteo](https://open-meteo.com/) 免费 API（无需密钥）
- **位置定位** - 使用 [ipapi.co](https://ipapi.co/) 免费 IP 定位服务
- **地理编码** - 使用 Open-Meteo 地理编码 API

### 🛡️ 隐私

- 所有天气数据请求都是匿名的
- 不收集任何用户数据
- 仅在获取位置和天气时发送必要的请求
- 所有数据都是公开 API，无需身份验证

### 📦 项目结构

```
vscode-weather/
├── src/
│   ├── extension.ts          # 插件入口
│   ├── weatherProvider.ts    # 天气 API 调用
│   ├── locationProvider.ts   # 位置检测
│   ├── statusBarUI.ts        # 状态栏 UI 管理
│   ├── commandHandler.ts     # 命令处理
│   ├── config.ts             # 配置管理
│   └── types.ts              # 类型定义
├── package.json              # npm 配置
├── tsconfig.json             # TypeScript 配置
├── .vscodeignore             # 打包忽略文件
└── README.md                 # 本文件
```

### 🔧 开发

#### 环境要求

- Node.js 14+
- npm 6+
- TypeScript 4.9+
- VS Code 1.60+

#### 克隆和安装

```bash
git clone https://github.com/yourusername/vscode-weather.git
cd vscode-weather
npm install
```

#### 开发模式

```bash
npm run watch
```

然后在 VS Code 中按 F5 启动开发实例。

#### 编译

```bash
npm run compile
```

#### 遵循代码标准

```bash
npm run lint
```

### 📦 打包和发布

#### 打包为 VSIX

```bash
npm run package
```

#### 发布到 VS Code 市场

```bash
npm run publish
```

### 🐛 故障排除

#### 天气信息显示不了

1. 检查网络连接
2. 检查防火墙/代理是否阻止了 API 请求
3. 查看 VS Code 的开发者控制台（F12）获取错误信息

#### 位置检测失败

可能原因：
- VPN 或代理导致 IP 地址不准确
- IP 定位服务暂时不可用
- 手动设置城市名称：打开命令面板输入"设置位置"

#### API 限额

Open-Meteo 和 ipapi.co 都提供免费但有限额的 API。如果遇到限额问题，请稍候后重试。

### 📝 更新日志

#### v1.0.0 (2024-02-26)

- ✨ 首次发布
- 🌍 自动 IP 位置检测
- 🎨 詳細な天気情報表示
- ⚙️ 灵活的配置选项
- 🔄 自动刷新功能

### 📄 许可证

MIT

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 📧 反馈

如有问题或建议，请在 GitHub 提交 Issue。

---

## English

### VS Code Weather Extension

A professional VS Code extension that displays real-time weather information of your current location in the editor's status bar. Supports automatic location detection, multiple weather parameters, and flexible configuration options.

### ✨ Features

- **🌍 Automatic Location Detection** - Auto-detect location via IP address
- **📍 Manual Location Setting** - Set location by entering city name
- **🌤️ Detailed Weather Info** - Temperature, humidity, wind speed, visibility, UV index, etc.
- **🔄 Auto Refresh** - Configurable refresh interval (default 10 minutes)
- **🌡️ Temperature Unit Toggle** - Support Celsius and Fahrenheit
- **📊 Quick Weather Panel** - Click status bar to view complete weather info
- **⚙️ Flexible Configuration** - Customize via settings.json

### 📋 Weather Data

Status Bar Display:
- Current temperature (°C/°F)
- Weather description (clear, cloudy, rainy, etc.)
- Weather icon (emoji)

Details Panel includes:
- Location info (city, coordinates)
- Current and "feels like" temperature
- High/Low temperature
- Relative humidity
- Wind speed and gusts
- Wind direction
- Visibility
- Atmospheric pressure
- UV index
- Cloud cover
- Precipitation
- Sunrise/Sunset time

### 🚀 Getting Started

#### Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "VS Code Weather"
4. Click Install

#### Usage

After starting VS Code, the extension will automatically:
1. Detect your location (via IP)
2. Fetch weather information
3. Display weather in the status bar (right side)

**Click the status bar** weather info to view detailed weather data.

### ⌨️ Commands

Access via Command Palette (Ctrl+Shift+P):

- `Weather: Refresh` - Manually refresh weather
- `Weather: Set Location` - Set location by entering city name
- `Weather: Show Details` - Display weather details panel
- `Weather: Toggle Temperature Unit` - Switch between Celsius and Fahrenheit
- `Weather: Toggle Auto Refresh` - Enable/Disable auto refresh

### 🎨 Configuration

Configure in `settings.json`:

```json
{
  "weather.refreshInterval": 10,           // Refresh interval in minutes (1-120)
  "weather.temperatureUnit": "C",          // Temperature unit: C or F
  "weather.city": null,                    // Manual city name (optional)
  "weather.autoRefresh": true              // Enable auto refresh
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `weather.refreshInterval` | number | 10 | Auto refresh interval (minutes), 1-120 |
| `weather.temperatureUnit` | string | C | Temperature unit: C (Celsius) or F (Fahrenheit) |
| `weather.city` | string | null | Manual city name, overrides IP detection if set |
| `weather.autoRefresh` | boolean | true | Enable/Disable auto refresh |

### 🔌 API Details

- **Weather Data** - [Open-Meteo](https://open-meteo.com/) free API (no key required)
- **Location Detection** - [ipapi.co](https://ipapi.co/) free IP geolocation
- **Geocoding** - Open-Meteo Geocoding API

### 🛡️ Privacy

- All weather requests are anonymous
- No user data is collected
- Only necessary requests are sent for location and weather
- All APIs are public and require no authentication

### 📦 Project Structure

```
vscode-weather/
├── src/
│   ├── extension.ts          # Plugin entry point
│   ├── weatherProvider.ts    # Weather API integration
│   ├── locationProvider.ts   # Location detection
│   ├── statusBarUI.ts        # Status bar UI management
│   ├── commandHandler.ts     # Command handling
│   ├── config.ts             # Configuration management
│   └── types.ts              # Type definitions
├── package.json              # npm configuration
├── tsconfig.json             # TypeScript configuration
├── .vscodeignore             # Package ignore rules
└── README.md                 # This file
```

### 🔧 Development

#### Requirements

- Node.js 14+
- npm 6+
- TypeScript 4.9+
- VS Code 1.60+

#### Clone and Install

```bash
git clone https://github.com/yourusername/vscode-weather.git
cd vscode-weather
npm install
```

#### Development Mode

```bash
npm run watch
```

Then press F5 in VS Code to launch the debug instance.

#### Compile

```bash
npm run compile
```

#### Linting

```bash
npm run lint
```

### 📦 Packaging and Publishing

#### Package as VSIX

```bash
npm run package
```

#### Publish to VS Code Marketplace

```bash
npm run publish
```

### 🐛 Troubleshooting

#### Weather not displaying

1. Check your internet connection
2. Check if firewall/proxy blocks API requests
3. Check VS Code developer console (F12) for errors

#### Location detection fails

Possible causes:
- VPN or proxy causing inaccurate IP geolocation
- IP geolocation service temporarily unavailable
- Manually set city: Open command palette and select "Set Location"

#### API Rate Limit

Both Open-Meteo and ipapi.co have free but rate-limited APIs. If you hit the limit, try again later.

### 📝 Changelog

#### v1.0.0 (2024-02-26)

- ✨ Initial release
- 🌍 Auto IP location detection
- 🎨 Detailed weather information display
- ⚙️ Flexible configuration options
- 🔄 Auto-refresh functionality

### 📄 License

MIT

### 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

### 📧 Feedback

For questions or suggestions, please open an issue on GitHub.
