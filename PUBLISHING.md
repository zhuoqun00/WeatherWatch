# VS Code Weather 部署和发布指南

## 概述

本指南详细说明如何构建、测试和发布 VS Code Weather 插件到 VS Code 市场。

## 前置要求

1. **工具**
   - Node.js 14+
   - npm 6+
   - VS Code 1.60+
   - Git

2. **帐户**
   - GitHub 帐户
   - Azure DevOps 帐户（用于发布到 VS Code 市场）

3. **凭证**
   - VS Code Personal Access Token (PAT)

## 步骤 1: 本地开发和测试

### 1.1 安装依赖

```bash
cd vscode-weather
npm install
```

### 1.2 编译代码

```bash
npm run compile
```

验证是否有编译错误。

### 1.3 代码质量检查

```bash
npm run lint
```

修复任何 ESLint 警告。

### 1.4 本地测试

1. 按 F5 启动调试实例
2. 在打开的 VS Code 窗口中测试各个功能：
   - 查看状态栏天气显示
   - 运行所有天气命令
   - 测试配置变更
   - 测试不同的网络条件
   - 查看控制台日志

### 1.5 功能检查清单

- [ ] 状态栏显示天气信息（带图标、温度、描述）
- [ ] 点击状态栏显示详细天气面板
- [ ] `Weather: Refresh` 命令工作正常
- [ ] `Weather: Set Location` 命令可以设置城市
- [ ] `Weather: Toggle Temperature Unit` 切换单位正常
- [ ] `Weather: Toggle Auto Refresh` 切换自动刷新
- [ ] 配置更改实时生效
- [ ] 错误消息友好清晰
- [ ] 日志输出正常
- [ ] 网络故障时有适当的错误处理

## 步骤 2: 准备发布

### 2.1 更新版本号

编辑 `package.json`:

```json
{
  "version": "1.0.0"
}
```

遵循 [Semantic Versioning](https://semver.org/):
- Major: 重大功能或不兼容的改动
- Minor: 新功能（向后兼容）
- Patch: bug 修复

### 2.2 更新 CHANGELOG

在 `CHANGELOG.md` 顶部添加新版本条目：

```markdown
## [1.0.0] - 2024-02-26

### Added
- Feature descriptions
- Bug fixes
- Improvements

### Changed
- Breaking changes
- Deprecations

### Fixed
- Bug fixes
```

### 2.3 更新 README（如需要）

检查并更新以下部分：
- 功能列表
- 安装说明
- 使用示例
- 已知问题

### 2.4 检查 package.json 元数据

确保以下字段已正确填写：

```json
{
  "name": "vscode-weather",
  "displayName": "VS Code Weather",
  "description": "实时天气显示插件",
  "version": "1.0.0",
  "publisher": "your-publisher-name",
  "license": "MIT",
  "icon": "media/icon.png",
  "homepage": "https://github.com/yourusername/vscode-weather",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/vscode-weather.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/vscode-weather/issues"
  }
}
```

## 步骤 3: 创建发布版本

### 3.1 检查编译

```bash
npm run compile
```

确保没有错误。

### 3.2 创建 Git 标签

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 3.3 创建 GitHub Release

1. 在 GitHub 上，转到 Releases
2. 点击 "Draft a new release"
3. 选择刚才创建的标签 `v1.0.0`
4. 添加发布标题和描述
5. 上传 VSIX 文件（参见下一步）
6. 发布

## 步骤 4: 打包为 VSIX

### 4.1 安装 vsce

```bash
npm install -g vsce
```

### 4.2 生成 VSIX 文件

```bash
npm run package
```

这会生成 `vscode-weather-1.0.0.vsix` 文件。

### 4.3 验证 VSIX

```bash
vsce show
```

检查输出中的扩展信息是否正确。

## 步骤 5: 发布到 VS Code 市场

### 5.1 创建发布者帐户

如果还没有，请在 [VS Code 市场](https://marketplace.visualstudio.com/) 创建发布者帐户。

### 5.2 获取 Personal Access Token

1. 在 [Azure DevOps](https://dev.azure.com/) 创建帐户
2. 创建 Personal Access Token (PAT)
3. 作用域：Marketplace > acquire, manage

### 5.3 登录 vsce

```bash
vsce login your-publisher-name
```

系统会提示输入 PAT。

### 5.4 发布

```bash
npm run publish
```

或者直接使用 vsce：

```bash
vsce publish
```

### 5.5 验证发布

1. 访问 https://marketplace.visualstudio.com/items?itemName=your-publisher-name.vscode-weather
2. 检查插件信息是否正确
3. 测试安装功能

## 步骤 6: 发布后操作

### 6.1 验证市场列表

- [ ] 插件信息正确显示
- [ ] 图标正确加载
- [ ] README 正确显示
- [ ] 版本号正确
- [ ] 下载链接有效

### 6.2 测试市场安装

1. 在新的 VS Code 实例中从市场安装
2. 验证功能是否正常

### 6.3 发布社交媒体公告（可选）

- GitHub 讨论
- Twitter/X
- Stack Overflow

### 6.4 收集反馈

- 监控 GitHub Issues
- 回复用户反馈
- 记录问题进行后续改进

## 故障排除

### 问题: "Publisher not authorized"

**解决方案**:
- 检查 publisher 名称是否正确
- 验证 PAT 是否有效和没有过期
- 重新登录：`vsce logout` 然后 `vsce login`

### 问题: VSIX 文件过大

**解决方案**:
- 检查 `.vscodeignore` 是否正确排除了 node_modules
- 删除不必要的文件
- 使用 `vsce ls` 检查包含的文件

### 问题: 发布后插件不出现

**解决方案**:
- 刷新 VS Code 扩展市场
- 清除浏览器缓存
- 等待几分钟让市场缓存更新

## 更新发布

对于后续版本更新：

1. 修改代码并测试
2. 更新版本号（`package.json` 和 `CHANGELOG.md`）
3. 运行 `npm run compile`
4. 创建 git 标签和 Release
5. 运行 `npm run publish`

## 版本发布检查清单

发布前，确保：

- [ ] 版本号已更新
- [ ] CHANGELOG 已更新
- [ ] 代码已编译和测试
- [ ] 代码质量检查通过
- [ ] Readme 和文档已更新
- [ ] 没有编译或 lint 错误
- [ ] 功能测试清单全部通过
- [ ] package.json 元数据完整正确
- [ ] .vscodeignore 配置正确
- [ ] Git 标签已创建
- [ ] VSIX 文件已生成
- [ ] 市场发布成功

## 常用命令速查

```bash
# 开发
npm run watch          # 开发模式，自动编译
npm run compile        # 编译 TypeScript
npm run lint           # 代码质量检查

# 打包发布
npm run package        # 生成 VSIX 文件
npm run publish        # 直接发布到市场

# 版本控制
git tag v1.0.0         # 创建版本标签
git push origin v1.0.0 # 推送标签

# vsce 命令
vsce login publisher   # 登录发布者
vsce publish           # 发布到市场
vsce show              # 显示扩展信息
vsce ls                # 列出包含的文件
```

## 支持和反馈

- 文档问题？查看 [vsce 文档](https://github.com/Microsoft/vscode-vsce)
- 市场问题？查看 [VS Code 市场文档](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- 发布问题？在 GitHub 提交 Issue

---

祝发布顺利！🚀
