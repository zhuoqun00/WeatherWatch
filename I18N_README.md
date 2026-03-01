# WeatherWatch - 国际化实现指南

## 🌍 语言支持

WeatherWatch 现已支持**自动多语言界面**！

### 支持的语言
- 🇨🇳 **中文** (简体) - `zh-CN`
- 🇺🇸 **英文** - `en-US`
- 🌐 其他语言默认使用英文

## 🚀 快速开始

### 方式 1：自动检测（推荐 ✨）

WeatherWatch 会自动检测您的 VS Code 显示语言设置：

1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 `Configure Display Language`
3. 选择语言（中文或英文）
4. VS Code 重启后，WeatherWatch 自动适应该语言

### 方式 2：环境变量（开发测试）

```bash
# 启动中文版本
VSCODE_NLS_CONFIG='{"locale":"zh-CN"}' code

# 启动英文版本
VSCODE_NLS_CONFIG='{"locale":"en-US"}' code
```

## 📦 文件结构

```
src/
├── i18n/                          # 国际化目录
│   ├── zh-CN.json                # 中文翻译 (150+ 键)
│   ├── en-US.json                # 英文翻译 (150+ 键)
│   └── i18nManager.ts            # 翻译管理器
├── extension.ts                   # 初始化 i18n
├── statusBarUI.ts                # 状态栏 UI
├── commandHandler.ts             # 命令处理
├── weatherProvider.ts            # 天气 API
├── usagePanel.ts                 # 统计面板
└── locationProvider.ts           # 位置服务
```

## 💻 开发指南

### 使用翻译

在任何模块中使用翻译：

```typescript
import { getI18n } from './i18n/i18nManager';

const i18n = getI18n();

// 基本翻译
const text = i18n.t('ui.statusBar.name');
// → "天气信息" (中文) 或 "Weather Information" (英文)

// 参数化翻译
const error = i18n.tWithParams('messages.error.cannotFindCity', { 
  city: 'Beijing' 
});
// → "找不到城市: Beijing" 或 "Cannot find city: Beijing"
```

### 添加新的翻译键

1. 编辑 `src/i18n/zh-CN.json` 添加中文翻译
2. 编辑 `src/i18n/en-US.json` 添加英文翻译
3. 在代码中使用 `i18n.t('your.key.path')`

### 翻译键命名规范

使用点号分隔的路径结构：

```
ui.statusBar.name          # UI 组件 > 子组件 > 属性
weather.descriptions.clear # 功能 > 子功能 > 具体项
messages.success.updated   # 消息类型 > 级别 > 消息
```

## 🛠️ 构建和部署

### 开发

```bash
npm run watch              # 监视模式，自动重新编译
npm run compile            # 编译 TypeScript
```

### 构建

```bash
npm run vscode:prepublish  # 完整构建（包括翻译文件复制）
npm run package            # 创建 .vsix 文件
```

### 发布

```bash
npm run publish            # 发布到 VS Code 应用商店（需要认证）
```

## 📚 详细文档

- [I18N_QUICK_START.md](./I18N_QUICK_START.md) - 快速开始指南
- [I18N_IMPLEMENTATION_SUMMARY.md](./I18N_IMPLEMENTATION_SUMMARY.md) - 完整实现总结
- [I18N_DETAILED_CHANGELOG.md](./I18N_DETAILED_CHANGELOG.md) - 详细变更日志
- [I18N_DELIVERY_SUMMARY.md](./I18N_DELIVERY_SUMMARY.md) - 交付总结

## 🧪 测试

### 编译测试
```bash
npm run compile
# 应输出：✓ 编译成功（零错误）
```

### 翻译验证
```bash
node -e "
const fs = require('fs');
const zh = JSON.parse(fs.readFileSync('dist/i18n/zh-CN.json'));
const en = JSON.parse(fs.readFileSync('dist/i18n/en-US.json'));
console.log('✓ zh-CN.json 有效');
console.log('✓ en-US.json 有效');
"
```

### 功能测试

1. 启动插件（调试模式或本地安装）
2. 在 VS Code 中更改显示语言设置
3. 重启 VS Code
4. 验证插件界面语言已改变

## 🎯 翻译的内容

| 组件 | 翻译内容 |
|------|---------|
| 状态栏 | 标题、提示框、风向 |
| 命令面板 | 命令标题、提示文本 |
| 天气信息 | 30+ 种天气描述 |
| 消息提示 | 成功、错误、警告 |
| 统计面板 | 标题、按钮、表头 |
| 位置服务 | 错误消息、输入提示 |

## 🔍 调试

### 检查当前语言

在开发工具控制台中：

```javascript
// 获取 i18n 管理器
const ext = vscode.extensions.getExtension('ZhuoqunLi.weatherwatch');
const i18n = ext?.exports?.i18n;

// 检查当前语言
console.log(i18n?.getCurrentLanguage());  // 'zh-CN' 或 'en-US'
console.log(vscode.env.language);         // VS Code 的语言设置
```

### 常见问题排查

| 问题 | 解决方案 |
|------|---------|
| 语言未改变 | VS Code 需要重启 |
| 翻译缺失 | 检查 JSON 文件是否存在于 `dist/i18n/` |
| 文本未翻译 | 检查是否调用了 `getI18n()` 和 `i18n.t()` |
| 编译错误 | 运行 `npm run vscode:prepublish` 确保翻译文件已复制 |

## 🌟 特色功能

✨ **自动语言检测** - 无需用户配置
✨ **完整覆盖** - 150+ 翻译键
✨ **参数化翻译** - 支持动态文本
✨ **轻量级实现** - 无第三方依赖
✨ **易于扩展** - 简单的 JSON 结构

## 📈 API 参考

### getI18n()

获取全局 i18n 管理器实例。

```typescript
const i18n = getI18n();
```

### i18n.t(key, defaultValue?)

获取翻译文本。

```typescript
i18n.t('weather.descriptions.clear')
// → "晴朗" 或 "Clear"

i18n.t('unknown.key', 'Fallback text')
// → "Fallback text"
```

### i18n.tWithParams(key, params, defaultValue?)

获取带参数的翻译文本。

```typescript
i18n.tWithParams('messages.error.cannotFindCity', { city: 'Beijing' })
// → "找不到城市: Beijing" 或 "Cannot find city: Beijing"
```

### i18n.getCurrentLanguage()

获取当前语言代码。

```typescript
i18n.getCurrentLanguage()
// → 'zh-CN' 或 'en-US'
```

### i18n.getLocale()

获取区域设置字符串（用于日期格式化）。

```typescript
const locale = i18n.getLocale();
new Date().toLocaleString(locale)
```

### i18n.onLanguageChange(callback)

监听语言变化事件。

```typescript
const disposable = i18n.onLanguageChange((lang) => {
  console.log('语言已改变:', lang);
  // 刷新 UI 等操作
});

// 不使用时清理
disposable.dispose();
```

## 🎓 示例代码

### 在 Extension 中初始化

```typescript
// src/extension.ts
import { initI18n, getI18n } from './i18n/i18nManager';

export function activate(context: vscode.ExtensionContext) {
  // 初始化 i18n
  const i18n = initI18n(context.extensionUri);
  console.log(`当前语言: ${i18n.getCurrentLanguage()}`);
  
  // 其余代码...
}
```

### 在状态栏中使用

```typescript
// src/statusBarUI.ts
import { getI18n } from './i18n/i18nManager';

export function createStatusBar() {
  const i18n = getI18n();
  const statusBar = vscode.window.createStatusBarItem();
  
  statusBar.name = i18n.t('ui.statusBar.name');
  statusBar.tooltip = i18n.t('weather.tooltips.temperature');
  statusBar.show();
}
```

### 在命令处理中使用

```typescript
// src/commandHandler.ts
import { getI18n } from './i18n/i18nManager';

export function handleRefreshWeather() {
  const i18n = getI18n();
  
  // 获取天气...
  if (success) {
    vscode.window.showInformationMessage(
      i18n.t('messages.success.weatherUpdated')
    );
  } else {
    vscode.window.showErrorMessage(
      i18n.tWithParams('messages.error.failedToFetch', { 
        error: errorMsg 
      })
    );
  }
}
```

## 📞 支持

遇到问题？请检查：

1. VS Code 是否已重启（如果更改了语言设置）
2. `dist/i18n/` 目录是否包含翻译文件
3. 代码中是否正确调用了 `getI18n()` 方法
4. JSON 文件是否有效（使用 JSON validator 检查）

## 📄 许可证

MIT License

---

**最后更新**: 2024年3月1日  
**版本**: 1.0.2  
**i18n 状态**: ✅ **完全实现**
