# GitHub 发布前检查清单 (Pre-Release Checklist)

## ✅ 代码质量检查

### 编译和格式
- [ ] `npm run compile` 成功，无错误
- [ ] `npm run lint` 通过，无严重错误
- [ ] 所有 TypeScript 类型检查通过
- [ ] 代码格式正确，可读性强

### 功能验证
- [ ] ✅ 扩展成功激活和初始化
- [ ] ✅ 状态栏显示天气信息（"☂️ 阴天 5.2°C"）
- [ ] ✅ 手动刷新天气（Ctrl+Shift+P → Weather: Refresh）
- [ ] ✅ 设置位置功能正常（输入城市名）
- [ ] ✅ 切换温度单位（摄氏度 ↔ 华氏度）
- [ ] ✅ 自动刷新每10分钟工作一次
- [ ] ✅ 点击状态栏显示详细天气面板
- [ ] ✅ 所有配置选项生效
- [ ] ✅ 错误处理正确（网络异常等）
- [ ] ✅ 日志输出准确

### 跨平台测试
- [ ] Windows 上测试通过
- [ ] macOS 上测试通过
- [ ] Linux 上测试通过

---

## ✅ 文档检查

### 主要文档
- [ ] **README.md**
  - [ ] 中文部分完整且清晰
  - [ ] English 部分完整且清晰
  - [ ] 功能说明准确
  - [ ] 安装步骤清晰
  - [ ] 配置选项已列出
  - [ ] 屏幕截图（如有）
  - [ ] 链接都有效

- [ ] **CHANGELOG.md**
  - [ ] v1.0.0 版本信息完整
  - [ ] 新增功能列表清晰
  - [ ] 日期正确（2024-02-26）
  - [ ] 许可证说明正确

- [ ] **RELEASE.md**
  - [ ] 发布流程清晰
  - [ ] 包含 GitHub 推送步骤
  - [ ] 包含市场发布步骤
  - [ ] PAT token 说明清晰

### 用户文档
- [ ] **LICENSE** 文件存在（MIT）
- [ ] **CONTRIBUTING.md** 存在（鼓励贡献）
- [ ] **.github/ISSUE_TEMPLATE** 存在（可选）
- [ ] 所有文档在根目录可见

---

## ✅ 项目配置检查

### package.json
- [ ] `name` 正确: `vscode-weather`
- [ ] `version` 为 1.0.0
- [ ] `publisher` 设置（不是 "your-publisher-name"）
- [ ] `displayName` 准确: "VS Code Weather"
- [ ] `description` 完整且准确
- [ ] `homepage` 指向正确的 GitHub 地址
- [ ] `repository` 指向正确的 GitHub 地址
- [ ] `bugs` 指向 GitHub issues
- [ ] `main` 指向 "./dist/extension.js"
- [ ] `activationEvents` 包含 "*"
- [ ] 所有必要的 npm script 存在
- [ ] `devDependencies` 完整

### TypeScript 配置
- [ ] tsconfig.json 存在且有效
- [ ] 编译目标正确
- [ ] 严格模式启用

### VS Code 约定
- [ ] `.vscode/launch.json` 存在
- [ ] `.vscode/settings.json` 存在
- [ ] `.vscodeignore` 包含不必要的文件

### Git 配置
- [ ] `.gitignore` 包含 node_modules、dist 等
- [ ] `.git/config` 远程地址正确

---

## ✅ 发布资源检查

### 扩展资源
- [ ] **Icon** - `media/icon.png` 存在且清晰
  - [ ] 尺寸至少 128x128px
  - [ ] PNG 格式
  - [ ] 背景透明

### 可选资源
- [ ] 说明图片（可选）
- [ ] 演示 GIF（可选）
- [ ] 横幅图片（可选）

---

## ✅ GitHub 仓库准备

### 仓库基础设置
- [ ] 仓库已创建: `zhuoqun-vscode-extensions/vscode-weather`
- [ ] 仓库描述: "VS Code Weather - Real-time weather display"
- [ ] 仓库主题标签: `vscode-extension`, `weather`, `typescript`
- [ ] README.md 在首页显示
- [ ] LICENSE 类型为 MIT

### 分支配置
- [ ] 默认分支为 `main`
- [ ] `main` 分支受保护（可选）
- [ ] 分支保护规则已配置（可选）

### Issue 和 PR 模板
- [ ] ISSUE_TEMPLATE 已创建（可选）
- [ ] PULL_REQUEST_TEMPLATE 已创建（可选）

### Pages 和 Wiki
- [ ] GitHub Pages 已启用（可选）
- [ ] Wiki 已创建（可选）

---

## ✅ Git 提交检查

### 提交历史
- [ ] 首次提交已完成
- [ ] 提交信息格式清晰
- [ ] 所有文件都已提交
- [ ] `.gitignore` 工作正确

### 创建标签
- [ ] Git 标签 v1.0.0 已创建

命令参考：
```bash
git tag -a v1.0.0 -m "Release v1.0.0: Initial release"
git push origin v1.0.0
```

---

## ✅ GitHub Release 检查

### Release 内容
- [ ] Title: "VS Code Weather v1.0.0"
- [ ] Tag: "v1.0.0"
- [ ] Description: 包含功能列表和资源链接
- [ ] 不标记为 Pre-release
- [ ] 不标记为 Latest（除非是最新版本）
- [ ] Assets 已上传：
  - [ ] vscode-weather-1.0.0.vsix 包

### Release 可见性
- [ ] Release 在 GitHub 上可见
- [ ] Release 链接可共享

---

## ✅ VS Code 市场发布检查

### 发布者账户准备
- [ ] 拥有 Microsoft 账户
- [ ] 已注册为 VS Code 发布者
- [ ] Personal Access Token 已生成
- [ ] PAT 有 Marketplace (publish) 权限
- [ ] PAT 未过期

### 打包检查
- [ ] `npm run package` 成功
- [ ] .vsix 文件已生成
- [ ] 文件大小合理（通常 < 5MB）
- [ ] 文件名为 `vscode-weather-1.0.0.vsix`

### 发布检查
- [ ] vsce 工具已安装：`npm install -g vsce`
- [ ] 发布命令验证：`vsce publish --pat <YOUR_PAT>`
- [ ] 发布成功，无错误
- [ ] VS Code 市场显示新版本

### 市场验证
- [ ] 访问 marketplace.visualstudio.com
- [ ] 搜索 "VS Code Weather"
- [ ] 插件信息显示正确
- [ ] 版本号显示 1.0.0
- [ ] 插件可以被安装
- [ ] README 显示正确

---

## ✅ 社交媒体和宣传

### 可选宣传计划
- [ ] 在 GitHub Discussion 发布公告
- [ ] 更新个人网站/博客（如有）
- [ ] 发布到 VS Code 社区论坛
- [ ] 分享到社交媒体（推特、LinkedIn 等）
- [ ] 提交到 VS Code 汇总网站

---

## 📋 发布清单执行

### 第一步：本地准备（Day 1）
```bash
# 验证代码
npm run compile
npm run lint

# 测试功能
# 在 VS Code 中按 F5 运行

# 打包
npm run package
```

### 第二步：Git 推送（Day 1）
```bash
# 确保所有更改已提交
git status

# 创建标签
git tag -a v1.0.0 -m "Release v1.0.0: Initial release"

# 推送到 GitHub
git push origin main
git push origin v1.0.0
```

### 第三步：GitHub Release（Day 1）
- 访问 GitHub Releases 页面
- 创建新的 Release
- 上传 .vsix 文件
- 发布 Release

### 第四步：VS Code 市场发布（Day 1-2）
```bash
# 使用 vsce 发布
vsce publish --pat <YOUR_PERSONAL_ACCESS_TOKEN>

# 或使用 npm 脚本
npm run publish
```

### 第五步：验证（Day 2）
- 访问 VS Code 市场
- 搜索插件
- 验证信息和版本号
- 尝试安装

---

## 🚨 常见问题排查

### 如果编译失败
- [ ] 检查 Node.js 版本 (需要 14+)
- [ ] 运行 `npm install` 更新依赖
- [ ] 检查 tsconfig.json 配置
- [ ] 查看编译错误信息

### 如果发布失败
- [ ] 验证 PAT 有效性
- [ ] 检查 package.json 版本号
- [ ] 确保发布者账户正确
- [ ] 查看 vsce 错误信息

### 如果市场没有显示
- [ ] 等待 1-2 小时（有缓存）
- [ ] 清除浏览器缓存
- [ ] 检查 marketplace.visualstudio.com
- [ ] 联系 VS Code 市场支持

---

## 📞 获取帮助

- VS Code 市场发布文档: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- vsce 文档: https://github.com/microsoft/vsce
- GitHub 帮助: https://docs.github.com
- VS Code API: https://code.visualstudio.com/api

---

**发布状态**: 准备中（Ready for Release）

**预计发布日期**: 2024-02-26

**发布检查人**: You
