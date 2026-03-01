# WeatherWatch 国际化 - 快速开始指南

## ✨ 已完成的实现

WeatherWatch 插件现已完全支持**自动多语言**（中文和英文），无需任何用户配置。

### 🎯 工作原理

插件启动时会自动检测 VS Code 的 UI 语言设置：
- 如果是**中文**（zh-CN、zh-Hans 等），显示中文界面
- 如果是**英文或其他语言**，显示英文界面

## 🚀 使用方法

### 方式 1：更改 VS Code Display Language（推荐）

1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 `Configure Display Language` 并按 Enter
3. 选择 **中文（简体）** 或 **English**
4. VS Code 会提示重启
5. 重启后，WeatherWatch 会自动显示该语言

### 方式 2：使用环境变量（开发测试）

```bash
# 启动中文版本
VSCODE_NLS_CONFIG='{"locale":"zh-CN"}' code

# 启动英文版本  
VSCODE_NLS_CONFIG='{"locale":"en-US"}' code
```

## 📝 已翻译的内容（150+ 翻译键）

| 组件 | 中文 | English |
|------|------|---------|
| 状态栏标题 | 天气信息 | Weather Information |
| 天气描述 | 晴朗、雨、雪等 | Clear, Rainy, Snowy, etc. |
| 风向 | 北、东北、东等 | N, NNE, NE, etc. |
| 成功消息 | 天气信息已更新 | Weather information updated |
| 错误消息 | 找不到城市、网络错误等 | Cannot find city, network error, etc. |
| 命令标题 | 刷新天气、设置位置等 | Refresh Weather, Set Location, etc. |
| 统计面板 | 使用时长统计 | Usage Statistics |

## 🔧 构建和开发

### 编译代码
```bash
npm run compile
```

### 监视模式（开发中自动重新编译）
```bash
npm run watch
```

### 完整的发布前构建（包括翻译文件复制）
```bash
npm run vscode:prepublish
```

### 打包为 .vsix（可分享的插件文件）
```bash
npm run package
```

### 发布到 VS Code 应用商店（需要认证）
```bash
npm run publish
```

## 📂 文件结构

```
src/
├── i18n/
│   ├── zh-CN.json           # 中文翻译（150+ 键）
│   ├── en-US.json           # 英文翻译（150+ 键）
│   └── i18nManager.ts       # 翻译管理器（核心逻辑）
├── extension.ts             # 插件入口（初始化 i18n）
├── statusBarUI.ts           # 状态栏 UI（使用翻译）
├── commandHandler.ts        # 命令处理（使用翻译）
├── weatherProvider.ts       # 天气 API（动态语言参数）
├── usagePanel.ts            # 统计面板（使用翻译）
├── locationProvider.ts      # 位置提供者（使用翻译）
└── ... 其他文件

dist/
├── i18n/
│   ├── zh-CN.json          # 打包后的翻译文件
│   └── en-US.json          # 打包后的翻译文件
└── ... 编译后的 JavaScript
```

## 💡 核心代码片段

### 初始化 i18n（在 extension.ts 中）
```typescript
import { initI18n, getI18n } from './i18n/i18nManager';

export function activate(context: vscode.ExtensionContext) {
  // 初始化多语言支持
  const i18n = initI18n(context.extensionUri);
  console.log(`✓ I18nManager 初始化成功，当前语言: ${i18n.getCurrentLanguage()}`);
  
  // 其余代码...
}
```

### 使用翻译（在任何源文件中）
```typescript
import { getI18n } from './i18n/i18nManager';

const i18n = getI18n();

// 基本翻译
const title = i18n.t('ui.statusBar.name');  // "天气信息" 或 "Weather Information"

// 带参数的翻译
const msg = i18n.tWithParams('messages.error.cannotFindCity', { city: 'Beijing' });
// "找不到城市: Beijing" 或 "Cannot find city: Beijing"

// 获取当前语言
const lang = i18n.getCurrentLanguage();  // 'zh-CN' 或 'en-US'

// 监听语言变化
i18n.onLanguageChange((lang) => {
  console.log('语言已切换:', lang);
  // 刷新 UI（如果需要）
});
```

## 🧪 验证检查列表

启动插件后，检查以下几点：

- [ ] 输出面板显示 `✓ I18nManager 初始化成功，当前语言: zh-CN` 或 `en-US`
- [ ] 状态栏显示的是中文或英文（根据 VS Code 语言设置）
- [ ] 运行"刷新天气"命令时显示的是该语言的成功消息
- [ ] 尝试设置一个无效城市时，错误消息是该语言显示
- [ ] 打开"使用时长统计"面板，标题和按钮文本都是该语言

## 🐛 常见问题

**Q: 插件启动后还是显示中文，但我设置的是英文？**  
A: VS Code 需要重启才会更新 `vscode.env.language`。请重启 VS Code。

**Q: 如何支持更多语言？**  
A: 在 `src/i18n/` 目录中添加新的 JSON 文件（如 `ja-JP.json`），然后在 `i18nManager.ts` 中添加语言映射即可。

**Q: 翻译文件会被打包到 .vsix 文件中吗？**  
A: 是的。`npm run vscode:prepublish` 会自动复制翻译文件到 `dist/i18n/` 目录，`.vscodeignore` 确保它们被包含在打包中。

## 📞 技术细节

### I18nManager API 的完整方法列表

```typescript
interface I18nManager {
  // 初始化（在 extension.ts 中调用）
  init(language?: string): void;
  
  // 获取翻译（支持点号式路径如 'weather.descriptions.clear'）
  t(key: string, defaultValue?: string): string;
  
  // 带参数的翻译（支持 {city}, {error} 等占位符）
  tWithParams(key: string, params: {[key: string]: string|number}, defaultValue?: string): string;
  
  // 获取当前语言代码
  getCurrentLanguage(): 'zh-CN' | 'en-US';
  
  // 获取区域设置字符串（用于 toLocaleString() 等方法）
  getLocale(): 'zh-CN' | 'en-US';
  
  // 语言变化事件监听（返回 Disposable，用于清理）
  onLanguageChange(callback: (lang: 'zh-CN' | 'en-US') => void): vscode.Disposable;
  
  // 手动切换语言（可选，通常自动检测）
  changeLanguage(language: 'zh-CN' | 'en-US'): void;
  
  // 清理资源（在 extension.ts 的 deactivate 中调用）
  dispose(): void;
}
```

### 翻译文件结构示例

```json
{
  "ui": {
    "statusBar": {
      "name": "天气信息",
      "loading": "加载中...",
      "error": "获取失败"
    }
  },
  "weather": {
    "descriptions": {
      "clear": "晴朗",
      "rainy": "下雨",
      "snowy": "下雪"
    },
    "windDirections": {
      "N": "北",
      "NNE": "北偏东北",
      "NE": "东北"
    }
  },
  "messages": {
    "success": {
      "weatherUpdated": "天气信息已更新"
    },
    "error": {
      "cannotFindCity": "找不到城市: {city}",
      "networkError": "网络连接失败"
    }
  }
}
```

## 🎉 总结

WeatherWatch 现已支持完全自动的中英文界面，开箱即用！用户只需更改 VS Code 的 Display Language 设置，插件界面就会自动切换相应的语言，无需任何额外配置。

---

**最后更新**: 2024年3月1日  
**版本**: 1.0.2  
**i18n 状态**: ✅ **完全实现和验证**
