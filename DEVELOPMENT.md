# 开发指南 | Development Guide

[中文](#中文) | [English](#english)

## 中文

### 项目概述

VS Code Weather 是一个完全使用 TypeScript 开发的 VS Code 扩展，提供实时天气信息显示功能。项目使用最新的 VS Code Extension API 和现代 Web API。

### 技术栈

- **语言**: TypeScript 4.9+
- **框架/库**: VS Code Extension API 1.60+
- **运行时**: Node.js 14+
- **构建工具**: TypeScript 编译器
- **代码检查**: ESLint + TypeScript ESLint
- **包管理**: npm

### API 说明

#### 天气数据: Open-Meteo

- **网址**: https://api.open-meteo.com/v1/forecast
- **特点**:
  - 完全免费，无需 API 密钥
  - 开源且尊重隐私
  - 支持实时天气数据
  - 支持多种参数（温度、湿度、风速等）
  - 有速率限制但非常宽松

**请求参数**:
```
GET /v1/forecast?latitude=39.9&longitude=116.4&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,uv_index&timezone=auto
```

#### IP 定位: ipapi.co

- **网址**: https://ipapi.co/json/
- **特点**:
  - 完全免费
  - 无需认证
  - 返回城市、坐标等信息
  - 准确度通常在城市级别

**响应格式**:
```json
{
  "city": "Beijing",
  "latitude": 39.9,
  "longitude": 116.4,
  "country_name": "China",
  "region": "Beijing"
}
```

#### 地理编码: Open-Meteo Geocoding

- **网址**: https://geocoding-api.open-meteo.com/v1/search
- **特点**:
  - 支持多语言搜索
  - 返回坐标和城市信息
  - 无需认证

**请求参数**:
```
GET /v1/search?name=Beijing&count=1&language=zh&format=json
```

### 项目结构深入说明

#### src/types.ts
- 定义所有 TypeScript 接口
- 包括 `Location`, `WeatherInfo`, `ExtensionConfig` 等
- 确保类型安全

#### src/weatherProvider.ts
- 调用 Open-Meteo API 获取天气
- WMO 天气代码解析
- 温度单位转换
- 天气图标映射

**关键函数**:
- `getWeather(location)`: 获取指定位置的天气
- `getWeatherDescription(code)`: 获取天气描述
- `getWeatherIcon(code)`: 获取 emoji 图标
- `formatTemperature(celsius, unit)`: 格式化温度

#### src/locationProvider.ts
- IP 自动定位
- 城市名称地理编码
- 用户输入处理
- 超时控制

**关键函数**:
- `getLocationFromIP()`: 通过 IP 获取位置
- `getLocationFromCity(cityName)`: 通过城市名获取位置
- `promptForCity()`: 弹出输入框

#### src/statusBarUI.ts
- 管理 VS Code 状态栏项目
- 构建悬停提示信息
- 显示详细天气信息
- 管理 UI 生命周期

**关键类**:
- `StatusBarUI`: 负责所有 UI 相关操作

#### src/config.ts
- 读写 VS Code 配置
- 配置变更监听
- 配置验证

**关键函数**:
- `getConfig()`: 获取当前配置
- `setCity(city)`: 保存城市设置
- `onConfigChange(callback)`: 监听配置变更

#### src/commandHandler.ts
- 注册和处理所有命令
- 管理自动刷新定时器
- 协调各个模块
- 错误处理

**关键命令**:
- `weather.refreshWeather`: 手动刷新
- `weather.setLocation`: 设置位置
- `weather.showDetails`: 显示详情
- `weather.toggleTemperatureUnit`: 切换单位
- `weather.toggleAutoRefresh`: 切换自动刷新

#### src/extension.ts
- 插件激活和停用
- 初始化插件
- 清理资源

### 开发工作流

1. **开发模式**
```bash
npm run watch
```
TypeScript 会自动编译并输出到 `dist/` 目录。

2. **调试**
在 VS Code 中按 F5 或选择 "Run Extension" 调试配置。
编译输出会在新打开的 VS Code 窗口中加载。

3. **测试**
在调试窗口中手动测试：
- 打开命令面板 (Ctrl+Shift+P)
- 运行天气相关命令
- 检查状态栏显示
- 查看开发者控制台日志

4. **代码检查**
```bash
npm run lint
```

5. **生产编译**
```bash
npm run compile
```

### 常见开发任务

#### 添加新命令

1. 在 `commandHandler.ts` 中添加处理函数
2. 在 `registerCommands()` 中注册命令
3. 在 `package.json` 的 `contributes.commands` 中声明命令
4. （可选）在 `contributes.keybindings` 中添加快捷键

#### 修改 API 请求

编辑 `weatherProvider.ts` 中的 `buildWeatherUrl()` 方法。

#### 更改状态栏显示

编辑 `statusBarUI.ts` 中的 `updateWeather()` 和 `buildTooltip()` 方法。

#### 新增配置项

1. 在 `src/types.ts` 中的 `ExtensionConfig` 接口中添加
2. 在 `config.ts` 中添加 getter/setter
3. 在 `package.json` 的 `contributes.configuration` 中声明

### 调试技巧

#### 查看日志

在调试窗口的输出面板中选择 "Weather" 频道查看插件日志。

所有日志都以 `[ModuleName]` 开头，便于筛选。

#### 常用日志语句

```typescript
console.log('[ModuleName] 消息');      // 信息
console.error('[ModuleName] 错误');    // 错误
console.warn('[ModuleName] 警告');     // 警告
```

#### 检查网络请求

在浏览器开发者工具中可以看不到，但可以在代码中添加日志：

```typescript
console.log(`[WeatherProvider] 请求 URL: ${url}`);
```

### 性能优化建议

- 缓存天气数据以减少 API 调用
- 使用 AbortController 实现请求超时
- 定期清理定时器以避免内存泄漏
- 使用异步操作不阻塞 UI

### 错误处理最佳实践

```typescript
try {
  // 操作
} catch (error) {
  const errorMsg = error instanceof Error ? error.message : '未知错误';
  console.error(`[ModuleName] 错误描述: ${errorMsg}`);
  vscode.window.showErrorMessage(`友好的错误提示: ${errorMsg}`);
  statusBarUI.showError(errorMsg);
}
```

---

## English

### Project Overview

VS Code Weather is a VS Code extension developed entirely in TypeScript, providing real-time weather information display functionality. The project uses modern Web APIs and the latest VS Code Extension API.

### Tech Stack

- **Language**: TypeScript 4.9+
- **Framework/Libraries**: VS Code Extension API 1.60+
- **Runtime**: Node.js 14+
- **Build Tools**: TypeScript Compiler
- **Code Quality**: ESLint + TypeScript ESLint
- **Package Manager**: npm

### API Documentation

#### Weather Data: Open-Meteo

- **URL**: https://api.open-meteo.com/v1/forecast
- **Features**:
  - Completely free, no API key required
  - Open-source and privacy-respecting
  - Real-time weather data
  - Multiple parameters (temperature, humidity, wind speed, etc.)
  - Generous rate limits

**Request Parameters**:
```
GET /v1/forecast?latitude=39.9&longitude=116.4&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,uv_index&timezone=auto
```

#### IP Geolocation: ipapi.co

- **URL**: https://ipapi.co/json/
- **Features**:
  - Completely free
  - No authentication required
  - Returns city, coordinates, etc.
  - City-level accuracy

**Response Format**:
```json
{
  "city": "Beijing",
  "latitude": 39.9,
  "longitude": 116.4,
  "country_name": "China",
  "region": "Beijing"
}
```

#### Geocoding: Open-Meteo Geocoding

- **URL**: https://geocoding-api.open-meteo.com/v1/search
- **Features**:
  - Multi-language search support
  - Returns coordinates and city info
  - No authentication required

**Request Parameters**:
```
GET /v1/search?name=Beijing&count=1&language=en&format=json
```

### Detailed Project Structure

#### src/types.ts
- Defines all TypeScript interfaces
- Includes `Location`, `WeatherInfo`, `ExtensionConfig`, etc.
- Ensures type safety

#### src/weatherProvider.ts
- Calls Open-Meteo API for weather data
- WMO weather code parsing
- Temperature unit conversion
- Weather icon mapping

**Key Functions**:
- `getWeather(location)`: Fetch weather for location
- `getWeatherDescription(code)`: Get weather description
- `getWeatherIcon(code)`: Get emoji icon
- `formatTemperature(celsius, unit)`: Format temperature

#### src/locationProvider.ts
- IP-based auto-detection
- City name geocoding
- User input handling
- Timeout management

**Key Functions**:
- `getLocationFromIP()`: Get location from IP
- `getLocationFromCity(cityName)`: Get location from city name
- `promptForCity()`: Show input dialog

#### src/statusBarUI.ts
- Manages VS Code status bar item
- Builds tooltip information
- Displays detailed weather
- Manages UI lifecycle

**Key Class**:
- `StatusBarUI`: Handles all UI operations

#### src/config.ts
- Read/write VS Code configuration
- Configuration change listening
- Configuration validation

**Key Functions**:
- `getConfig()`: Get current configuration
- `setCity(city)`: Save city setting
- `onConfigChange(callback)`: Listen for config changes

#### src/commandHandler.ts
- Register and handle all commands
- Manage auto-refresh timer
- Coordinate modules
- Error handling

**Key Commands**:
- `weather.refreshWeather`: Manual refresh
- `weather.setLocation`: Set location
- `weather.showDetails`: Show details
- `weather.toggleTemperatureUnit`: Toggle unit
- `weather.toggleAutoRefresh`: Toggle auto-refresh

#### src/extension.ts
- Plugin activation and deactivation
- Plugin initialization
- Resource cleanup

### Development Workflow

1. **Development Mode**
```bash
npm run watch
```
TypeScript automatically compiles to the `dist/` directory.

2. **Debugging**
Press F5 in VS Code or select "Run Extension" debug configuration.
Compilation output loads in a new VS Code window.

3. **Testing**
Test manually in the debug window:
- Open command palette (Ctrl+Shift+P)
- Run weather-related commands
- Check status bar display
- View developer console logs

4. **Code Quality**
```bash
npm run lint
```

5. **Production Build**
```bash
npm run compile
```

### Common Development Tasks

#### Adding a New Command

1. Add handler function in `commandHandler.ts`
2. Register in `registerCommands()`
3. Declare in `package.json` under `contributes.commands`
4. (Optional) Add keybinding in `contributes.keybindings`

#### Modifying API Requests

Edit `buildWeatherUrl()` method in `weatherProvider.ts`.

#### Changing Status Bar Display

Edit `updateWeather()` and `buildTooltip()` methods in `statusBarUI.ts`.

#### Adding New Configuration

1. Add to `ExtensionConfig` interface in `src/types.ts`
2. Add getter/setter in `config.ts`
3. Declare in `package.json` under `contributes.configuration`

### Debugging Tips

#### Viewing Logs

Select "Weather" channel in the Output panel of the debug window.

All logs start with `[ModuleName]` for easy filtering.

#### Common Log Statements

```typescript
console.log('[ModuleName] message');      // Info
console.error('[ModuleName] error');      // Error
console.warn('[ModuleName] warning');     // Warning
```

#### Inspecting Network Requests

Add logging in the code:

```typescript
console.log(`[WeatherProvider] Request URL: ${url}`);
```

### Performance Optimization Tips

- Cache weather data to reduce API calls
- Use AbortController for request timeouts
- Regularly clean up timers to prevent memory leaks
- Use async operations to avoid blocking UI

### Error Handling Best Practices

```typescript
try {
  // operation
} catch (error) {
  const errorMsg = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[ModuleName] Error: ${errorMsg}`);
  vscode.window.showErrorMessage(`Friendly error message: ${errorMsg}`);
  statusBarUI.showError(errorMsg);
}
```
