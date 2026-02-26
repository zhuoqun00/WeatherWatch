# ⚡ 快速发布指南 (Quick Start)

## 📋 5 分钟快速发布流程

### 准备步骤
```bash
# 进入项目目录
cd /mnt/d/vscode-weather

# 验证打包成功
ls -lh vscode-weather-1.0.0.vsix  # 应该显示 56KB
```

---

## 步骤 1: GitHub 推送 (5 分钟)

### 第一次初始化 GitHub 仓库

```bash
# 配置 Git 用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 初始化本地仓库
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "Initial commit: VS Code Weather v1.0.0"

# 添加远程仓库
git remote add origin https://github.com/zhuoqun00/WeatherWatch.git

# 推送到 GitHub（第一次需要设置上游分支）
git branch -M main
git push -u origin main
```

✅ 代码已成功推送到 GitHub！

---

## 步骤 2: 创建 Git 标签 (1 分钟)

```bash
# 创建版本标签
git tag -a v1.0.0 -m "Release v1.0.0: Initial release"

# 推送标签到 GitHub
git push origin v1.0.0
```

✅ 标签已推送！

---

## 步骤 3: GitHub Release (5 分钟)

### 网页操作流程

1. **打开 GitHub Releases 页面**
   ```
   https://github.com/zhuoqun00/WeatherWatch/releases
   ```

2. **点击 "Draft a new release"**

3. **填写以下信息**
   - **Tag version**: `v1.0.0`
   - **Release title**: `VS Code Weather v1.0.0`
   - **Description**: 复制下面的内容

4. **Release 描述内容** (复制粘贴)
   ```
   ## 🎉 首次发布 | Initial Release
   
   ### ✨ 新增功能 / New Features
   - 🌍 自动位置检测 / Automatic location detection via IP
   - 📍 手动设置位置 / Manual location configuration
   - 🌤️ 详细天气信息 / Comprehensive weather data display
   - 🔄 自动刷新功能 / Auto-refresh capability
   - 🌡️ 温度单位切换 / Temperature unit toggle
   - 📊 快速天气面板 / Quick weather details panel
   
   ### 📋 支持的天气参数
   - 当前温度 / Current temperature
   - 体感温度 / Feels-like temperature
   - 相对湿度 / Relative humidity
   - 风速和阵风 / Wind speed and gusts
   - 能见度 / Visibility
   - 气压 / Atmospheric pressure
   - 紫外线指数 / UV index
   - 云量和降水 / Cloud cover and precipitation
   - 日出日落 / Sunrise/Sunset times
   
   ### 📖 文档
   - [使用说明](https://github.com/zhuoqun00/WeatherWatch#readme)
   - [配置选项](https://github.com/zhuoqun00/WeatherWatch#-配置)
   - [故障排除](https://github.com/zhuoqun00/WeatherWatch#-故障排除)
   
   ### 📄 许可证
   MIT License
   ```

5. **上传 VSIX 文件**
   - 点击 "Attach binaries"
   - 选择: `vscode-weather-1.0.0.vsix`

6. **点击 "Publish release"**

✅ Release 已发布！

---

## 步骤 4: VS Code 市场发布 (10 分钟)

### 前置条件检查

```bash
# 检查 vsce 是否已安装
which vsce

# 如果没有，安装 vsce
npm install -g vsce
```

### 获取 Personal Access Token (PAT)

1. 访问: https://dev.azure.com
2. 创建新的 Personal Access Token
3. 权限: **Marketplace (publish)**
4. 有效期: 选择足够长的时间
5. 复制 token 值

### 发布命令

**首次发布（需要 PAT）**
```bash
vsce publish --pat YOUR_PERSONAL_ACCESS_TOKEN
```

**替换 `YOUR_PERSONAL_ACCESS_TOKEN` 为实际的 token**

示例：
```bash
vsce publish --pat ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 后续更新（无需 PAT）

```bash
# 使用 npm 脚本（需要首次设置过）
npm run publish
```

✅ 发布到市场完成！

---

## 步骤 5: 验证发布 (5 分钟)

### 验证清单

- [ ] 访问: https://marketplace.visualstudio.com
- [ ] 搜索: "VS Code Weather"
- [ ] 验证版本号: 1.0.0
- [ ] 验证发布者: weather-extension
- [ ] 尝试点击 "Install"（不必真的安装）
- [ ] 检查 README 显示正确

### 在 VS Code 中验证

```bash
# 打开 VS Code
code

# 按 Ctrl+Shift+X 打开扩展市场
# 搜索 "VS Code Weather"
# 应该显示新发布的版本
```

✅ 验证成功！

---

## 🐛 常见问题排查

### Git 相关问题

**问题**: `fatal: 'origin' does not appear to be a 'git' repository`
```bash
# 解决: 检查是否已添加远程仓库
git remote -v

# 如果输出为空，添加远程仓库
git remote add origin https://github.com/zhuoqun00/WeatherWatch.git
```

**问题**: `Permission denied (publickey)`
```bash
# 解决: 配置 SSH 密钥，或使用 HTTPS 推送
# 编辑 .git/config 或使用 GitHub CLI
gh auth login
```

### vsce 发布问题

**问题**: `vsce: command not found`
```bash
# 解决: 安装 vsce
npm install -g vsce
```

**问题**: `Invalid publisher id`
```bash
# 确保 package.json 中的 publisher 为 "weather-extension"
cat package.json | grep publisher
```

**问题**: `Token expired`
```bash
# 生成新的 PAT，重新发布
vsce publish --pat NEW_TOKEN
```

---

## ✅ 发布检查清单

### 推送前
- [ ] npm run compile 成功
- [ ] npm run lint 通过
- [ ] VSIX 文件存在 (56KB)

### GitHub 操作
- [ ] 代码已推送到 main 分支
- [ ] Git 标签已创建 (v1.0.0)
- [ ] Release 已发布
- [ ] VSIX 文件已上传

### 市场发布
- [ ] vsce 已安装
- [ ] PAT 有效
- [ ] 发布命令成功
- [ ] 市场上可以看到

### 验证
- [ ] marketplace.visualstudio.com 可以搜到
- [ ] 版本号正确
- [ ] README 显示正确
- [ ] 可以点击 Install

---

## 📞 需要帮助？

### 文档链接
- 完整发布指南: [RELEASE.md](./RELEASE.md)
- 发布准备说明: [PUBLISH_READY.md](./PUBLISH_READY.md)
- 检查清单: [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)

### 官方资源
- VS Code API: https://code.visualstudio.com/api
- vsce 文档: https://github.com/microsoft/vsce
- GitHub: https://docs.github.com

### 获取支持
- 在项目 Issues 提问
- GitHub Discussions 讨论
- 查看完整的 README 文档

---

## ⏱️ 预计时间

| 步骤 | 耗时 | 状态 |
|------|------|------|
| 1. GitHub 推送 | 5-10 分钟 | ⏳ |
| 2. 创建标签 | 1 分钟 | ⏳ |
| 3. GitHub Release | 5 分钟 | ⏳ |
| 4. 市场发布 | 5-10 分钟 | ⏳ |
| 5. 验证 | 2-5 分钟 | ⏳ |
| **总计** | **20-30 分钟** | ✅ |

市场显示可能需要 1-2 小时（有缓存）

---

## 🚀 现在就开始！

准备好了吗？

**步骤 1:**
```bash
cd /mnt/d/vscode-weather
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
git add .
git commit -m "Initial commit: VS Code Weather v1.0.0"
```

**步骤 2:**
```bash
git remote add origin https://github.com/zhuoqun00/WeatherWatch.git
git branch -M main
git push -u origin main
```

**步骤 3:**
```bash
git tag -a v1.0.0 -m "Release v1.0.0: Initial release"
git push origin v1.0.0
```

**步骤 4:** 手动创建 GitHub Release（见上面的网页操作流程）

**步骤 5:**
```bash
vsce publish --pat YOUR_PERSONAL_ACCESS_TOKEN
```

**步骤 6:** 等待 1-2 小时，然后在 marketplace.visualstudio.com 验证

---

祝发布顺利！🎉

**完毕！您的扩展将很快出现在 VS Code 市场中！**
