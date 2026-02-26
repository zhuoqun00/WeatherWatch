# VS Code Weather - 发布指南

## 📦 发布流程

### 1️⃣ 本地准备

#### 确保代码编译正确
```bash
npm run compile
npm run lint
```

#### 验证功能
- ✅ 扩展成功激活
- ✅ 状态栏显示天气信息
- ✅ 所有命令正常工作
- ✅ 配置选项生效
- ✅ 自动刷新正常

### 2️⃣ GitHub 仓库初始化

#### 首次创建（如未创建）

```bash
# 初始化本地git仓库
git init

# 配置用户信息
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 添加所有文件
git add .

# 提交初始版本
git commit -m "Initial commit: VS Code Weather v1.0.0"

# 添加远程仓库
git remote add origin https://github.com/zhuoqun00/WeatherWatch.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

#### 已有仓库提交更新

```bash
git add .
git commit -m "Release: v1.0.0"
git push origin main
```

### 3️⃣ 创建GitHub Release

#### 使用GitHub网页版：

1. 转到 https://github.com/zhuoqun00/WeatherWatch/releases
2. 点击 "Draft a new release"
3. 填写以下信息：

**Tag version**: v1.0.0
**Release title**: VS Code Weather v1.0.0
**Description**:

```
## 🎉 首次发布 / Initial Release

### ✨ 新功能 / Features
- 🌍 自动位置检测 / Automatic location detection via IP
- 📍 手动设置位置 / Manual location configuration
- 🌤️ 详细天气信息 / Comprehensive weather data display
- 🔄 自动刷新功能 / Auto-refresh capability
- 🌡️ 温度单位切换 / Temperature unit toggle (°C/°F)
- 📊 快速天气面板 / Quick weather details panel
- ⚙️ 灵活配置选项 / Flexible configuration options

### 📋 支持的天气参数 / Weather Information
- 当前温度 / Current temperature
- 体感温度 / Feels-like temperature
- 最高/最低温度 / High/Low temperature  
- 相对湿度 / Relative humidity
- 风速和阵风 / Wind speed and gusts
- 能见度 / Visibility
- 气压 / Atmospheric pressure
- 紫外线指数 / UV index
- 云量 / Cloud cover
- 降水量 / Precipitation
- 日出/日落时间 / Sunrise/Sunset time

### 🔗 资源 / Resources
- Documentation: https://github.com/zhuoqun00/WeatherWatch#readme
- Issue Tracker: https://github.com/zhuoqun00/WeatherWatch/issues
- Source Code: https://github.com/zhuoqun00/WeatherWatch

### 📄 许可证 / License
MIT
```

4. 点击 "Publish release"

### 4️⃣ VS Code 市场发布

#### 前置条件

1. **拥有 Microsoft 账户**
   - 如果没有，访问 https://aka.ms/VSCodeExtensionPublisher

2. **创建 Personal Access Token**
   - 访问 https://dev.azure.com
   - 创建新的 Personal Access Token（PAT）
   - 权限：Marketplace (publish)

3. **安装 vsce 工具** （已包含在项目中）
   ```bash
   npm install -g vsce
   ```

#### 打包扩展

```bash
# 清理旧的打包文件
rm -f *.vsix

# 打包新版本
npm run package
```

这会生成 `vscode-weather-1.0.0.vsix` 文件。

#### 发布到 VS Code 市场

**方式1：使用 vsce 命令行**

首次发布：
```bash
vsce publish --pat YOUR_PERSONAL_ACCESS_TOKEN
```

后续更新：
```bash
vsce publish
```

**方式2：使用 npm 脚本**

```bash
npm run publish
```

#### 验证发布成功

1. 访问 https://marketplace.visualstudio.com/
2. 搜索 "VS Code Weather"
3. 验证插件信息是否正确显示

### 5️⃣ 更新检查清单

发布前必须完成以下项目：

- ✅ 代码编译无错误
- ✅ npm lint 检查通过
- ✅ 功能测试完成
- ✅ README 文档完整
- ✅ CHANGELOG 已更新
- ✅ package.json 版本号已更新
- ✅ Git 标签已创建
- ✅ GitHub Release 已发布
- ✅ VS Code 市场发布成功

## 📝 版本号管理

使用 Semantic Versioning (SemVer)：

- **主版本 (Major)**: 1.0.0
  - 大功能更新或 API 破坏性变化
  - 例如：添加全新的天气参数源

- **次版本 (Minor)**: 1.1.0
  - 新增功能，向后兼容
  - 例如：添加新的配置选项

- **修订版 (Patch)**: 1.0.1
  - 错误修复，向后兼容
  - 例如：修复显示错误

## 🔄 后续更新流程

### 对于小更新（修复 bug）

1. 修改代码
2. 更新 `package.json` 中的 version（如 1.0.1）
3. 更新 `CHANGELOG.md`
4. `git commit -m "Fix: description"`
5. `git push origin main`
6. 创建 GitHub Release（v1.0.1）
7. `npm run publish`

### 对于新功能

1. 新增功能代码
2. `npm run compile && npm run lint`
3. 更新 `package.json` 中的 version（如 1.1.0）
4. 更新 `README.md` 和 `CHANGELOG.md`
5. `git commit -m "Feature: description"`
6. `git push origin main`
7. 创建 GitHub Release（v1.1.0）
8. `npm run publish`

## 🐛 常见问题

### Q: vsce publish 命令失败？
A: 确保您有有效的 Personal Access Token 和发布权限。

### Q: 如何验证发布是否成功？
A: 
- 检查 VS Code 市场页面
- 在 VS Code 中搜索扩展名并检查版本号
- 检查是否可以安装最新版本

### Q: 需要多长时间才能在市场上显示？
A: 通常几分钟到几小时，偶尔可能需要一个工作日。

### Q: 如何撤回错误版本？
A: 联系 Microsoft VS Code 市场支持，或在 GitHub 标记为预发布。

## 📚 参考资源

- [VS Code 扩展发布指南](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce 文档](https://github.com/Microsoft/vscode-vsce)
- [Semantic Versioning](https://semver.org/)
- [Open-Meteo API](https://open-meteo.com/)
- [ipapi.co API](https://ipapi.co/)

---

祝发布顺利！🚀
