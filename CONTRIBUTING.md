# Contributing to VS Code Weather

感谢你有兴趣为 VS Code Weather 项目做出贡献！我们欢迎任何形式的贡献，包括报告 bug、提交功能建议和代码改进。

## 行为准则

请遵循我们的行为准则，确保一个友好、包容的社区环境。

## 开发指南

### 环境设置

1. **克隆仓库**
```bash
git clone https://github.com/yourusername/vscode-weather.git
cd vscode-weather
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发模式**
```bash
npm run watch
```

4. **启动调试实例**
在 VS Code 中按 F5 或运行 "Extension" 调试配置

### 代码风格

- 使用 TypeScript 开发
- 遵循 ESLint 配置规则
- 使用 4 空格缩进
- 为所有函数和类添加详细注释

### 编码规范

1. **类型安全**
   - 启用 `strict` 模式
   - 避免 `any` 类型
   - 为所有函数参数和返回值定义类型

2. **注释**
   - 为 public 方法添加 JSDoc 注释
   - 为复杂逻辑添加行注释
   - 包括中英双语注释说明

3. **错误处理**
   - 总是处理 promise 错误
   - 为用户提供有意义的错误消息
   - 添加调试日志

### 提交 Pull Request

1. **创建分支**
```bash
git checkout -b feature/your-feature-name
```

2. **编写代码**
   - 遵循上述编码规范
   - 运行 ESLint: `npm run lint`
   - 编译代码: `npm run compile`

3. **提交更改**
```bash
git add .
git commit -m "feat: add new feature description"
```

遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 规范:
- `feat:` 新功能
- `fix:` bug 修复
- `docs:` 文档更改
- `style:` 代码格式(不影响功能)
- `refactor:` 代码重构
- `test:` 添加或修改测试
- `chore:` 依赖更新或其他变更

4. **推送分支**
```bash
git push origin feature/your-feature-name
```

5. **创建 Pull Request**
   - 描述你的变更
   - 链接相关 Issue
   - 添加截图或演示（如适用）

### 审核过程

- 至少需要一个维护者的批准
- 所有 CI 检查必须通过
- 代码必须遵循项目规范

## 报告 Bug

发现 bug？请提交 Issue：

1. 使用清晰、描述性的标题
2. 提供复现步骤
3. 描述实际行为和预期行为
4. 包括系统信息（OS、VS Code 版本）
5. 检查开发者控制台的错误日志

## 功能建议

非常欢迎新功能建议！请：

1. 清晰描述功能需求
2. 解释用例和好处
3. 列出任何可能的缺点或限制

## 文档更新

如果你改进了文档或代码注释，请提交 PR。好的文档同样重要！

## 项目结构

```
src/
  ├── extension.ts         # 插件入口和生命周期管理
  ├── weatherProvider.ts   # 天气 API 集成
  ├── locationProvider.ts  # 位置检测和地理编码
  ├── statusBarUI.ts       # 状态栏 UI 组件
  ├── commandHandler.ts    # 命令注册和处理
  ├── config.ts            # 配置管理
  └── types.ts             # TypeScript 类型定义
```

## 测试

目前没有自动化测试框架，但你可以：

1. 在本地调试实例中手动测试
2. 验证所有命令正常工作
3. 测试各种网络条件和错误场景
4. 检查状态栏更新是否正常

## 发布过程

发布新版本时：

1. 更新 `package.json` 中的版本号
2. 更新 `CHANGELOG.md`
3. 运行 `npm run compile` 确保编译成功
4. 创建 git tag: `git tag v1.0.0`
5. 推送 tag: `git push origin v1.0.0`
6. 使用 `npm run package` 生成 VSIX
7. 使用 `npm run publish` 发布到市场

## 许可证

通过提交贡献，你同意你的代码将在 MIT 许可证下发布。

## 联系方式

- 提交 Issue 讨论
- 通过 GitHub Discussion 交流想法
- 查看 README 中的反馈方式

感谢你的贡献！🎉
