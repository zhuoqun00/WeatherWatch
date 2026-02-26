# 变更日志 (Changelog) | Release Notes

所有值得注意的项目变更都会记录在此文件中。

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/) 。

参考格式: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [1.0.0] - 2024-02-26

首次发布！初始版本包含完整的核心功能。

### ✨ 新增功能 (Added)

#### 核心功能
- 🌍 **自动位置检测** - 通过 IP 地址自动获取用户位置
- 📍 **手动位置设置** - 支持输入城市名称手动设置位置
- 🎨 **实时天气显示** - 在状态栏右侧显示当前天气信息
- 📊 **详细天气面板** - 点击状态栏快速查看完整天气信息
- 🔄 **自动刷新功能** - 可配置的自动刷新间隔（默认10分钟）
- 🌡️ **温度单位切换** - 支持摄氏度和华氏度切换

#### 显示信息
- 🌡️ 当前温度和体感温度
- 🌤️ 天气描述和状态图标
- 📈 最高/最低温度
- 💧 相对湿度百分比
- 💨 风速、阵风和风向
- 👁️ 能见度距离
- 🔽 大气压力值
- ☀️ 紫外线指数
- ☁️ 云量百分比
- 🌧️ 降水量
- 🌅 日出/日落时间

#### 配置选项
- `weather.refreshInterval` - 自动刷新间隔（1-120分钟）
- `weather.temperatureUnit` - 温度单位（C/F）
- `weather.city` - 手动设置的城市名称
- `weather.autoRefresh` - 启用/禁用自动刷新

#### 命令
| 命令 | 说明 |
|------|------|
| `Weather: 刷新天气` | 手动刷新天气信息 |
| `Weather: 设置位置` | 输入城市名称设置位置 |
| `Weather: 显示天气详情` | 显示详细天气面板 |
| `Weather: 切换温度单位` | 在摄氏度和华氏度之间切换 |
| `Weather: 切换自动刷新` | 启用/禁用自动刷新 |

#### 技术特性
- TypeScript 完整类型检查
- ESLint 代码质量检查
- Node.js HTTPS 网络请求
- 完整的错误处理
- 详细的调试日志
- 所有成熟的 VS Code API 使用

#### 外部集成
- **天气数据**: [Open-Meteo](https://open-meteo.com/) - 免费无需密钥
- **位置定位**: [ipapi.co](https://ipapi.co/) - 免费 IP 地理位置
- **地理编码**: Open-Meteo Geocoding API

#### 文档
- 详细的 README（中英文）
- 完整的项目结构说明
- 开发和发布指南
- API 文档
- 故障排除指南

### 🛡️ 安全性和隐私
- ✅ 所有请求完全匿名
- ✅ 不收集用户数据
- ✅ 所有 API 都是公开服务
- ✅ HTTPS 加密传输
- ✅ MIT 开源许可证

### 🔧 已知限制和问题

#### API 限额处理
- ipapi.co 免费版本有请求限额
- 超限时自动使用默认位置（北京）
- 用户可手动设置位置绕过此限制

#### 地理定位准确性
- IP 地址定位精度取决于数据库
- VPN/代理可能导致定位不准
- 支持手动位置设置

#### 网络相关
- 首次加载需要几秒钟
- 支持手动刷新以立即获取最新数据
- 自动超时处理（10秒）

### 📥 安装方式

#### VS Code 市场安装
1. 打开 VS Code (Ctrl+Shift+X)
2. 搜索 "VS Code Weather"
3. 点击安装

#### 源代码安装
```bash
git clone https://github.com/zhuoqun-vscode-extensions/vscode-weather.git
cd vscode-weather
npm install
npm run compile
# VS Code 中按 F5 运行
```

#### VSIX 文件安装
```bash
code --install-extension vscode-weather-1.0.0.vsix
```

### 🚀 开始使用

启动 VS Code 后：
1. 扩展自动激活并获取位置
2. 在状态栏右侧显示当前天气
3. 点击天气查看详细信息
4. 使用命令面板 (Ctrl+Shift+P) 操作

### 🙏 致谢

感谢这些开源项目和服务：
- [VS Code](https://github.com/microsoft/vscode)
- [Open-Meteo](https://open-meteo.com/)
- [ipapi.co](https://ipapi.co/)
- [TypeScript](https://www.typescriptlang.org/)

---

## 发布历史

| 版本 | 日期 | 状态 | 链接 |
|------|------|------|------|
| 1.0.0 | 2024-02-26 | ✅ 已发布 | [v1.0.0](https://github.com/zhuoqun-vscode-extensions/vscode-weather/releases/tag/v1.0.0) |

---

## 计划功能 (Roadmap)

### v1.1.0 (计划中)
- [ ] 多地点天气支持
- [ ] 天气预报（3天/7天）
- [ ] 天气历史数据
- [ ] 更多天气数据源

### v1.2.0 (计划中)
- [ ] 空气质量指数（AQI）
- [ ] 天气警告和预警
- [ ] 自定义通知
- [ ] 天气趋势图表

### v2.0.0 (长期规划)
- [ ] WebView 仪表板
- [ ] 多语言完整支持
- [ ] AI 天气分析
- [ ] 社区功能集成

---

## 许可证

MIT License © 2024

详见 [LICENSE](./LICENSE) 文件。
- One-click access to detailed weather information
- Automatic location detection
- Manual location override
- Temperature unit preferences
- Configurable refresh intervals
- Complete weather data visualization
- Clean and intuitive UI

### Documentation

- Full English and Chinese README
- Comprehensive changelog
- Development setup instructions
- API documentation
- Configuration guide
- Troubleshooting guide

## Version History

### 1.0.0
- First stable release
- Feature-complete implementation
- Comprehensive testing and documentation
