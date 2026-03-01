/**
 * 国际化（i18n）管理器
 * 负责语言检测、翻译和语言切换
 */

import * as vscode from 'vscode';
import * as fs from 'fs';

type TranslationObject = { [key: string]: any };
type LanguageCode = 'zh-CN' | 'en-US';

/**
 * i18n管理器类
 * 管理插件的多语言支持
 */
export class I18nManager {
  private currentLanguage: LanguageCode = 'en-US';
  private translations: Map<LanguageCode, TranslationObject> = new Map();
  private onLanguageChangeCallbacks: ((lang: LanguageCode) => void)[] = [];
  private extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri;
    this.loadTranslations();
  }

  /**
   * 初始化，自动检测VS Code的语言
   * @param language 可选的强制语言代码
   */
  init(language?: string): void {
    let targetLanguage: LanguageCode = 'en-US';

    // 如果提供了强制语言，使用提供的语言
    if (language) {
      if (language === 'zh-CN' || language === 'en-US') {
        targetLanguage = language as LanguageCode;
      } else if (language.startsWith('zh')) {
        // 中文相关的所有 locale 映射到 zh-CN
        targetLanguage = 'zh-CN';
      }
    } else {
      // 自动检测 VS Code 的语言
      const vscodeLanguage = vscode.env.language;
      console.log(`[I18nManager] VS Code language: ${vscodeLanguage}`);

      if (vscodeLanguage.startsWith('zh')) {
        targetLanguage = 'zh-CN';
      } else {
        targetLanguage = 'en-US';
      }
    }

    this.currentLanguage = targetLanguage;
    console.log(`[I18nManager] 初始化完成，当前语言: ${this.currentLanguage}`);
  }

  /**
   * 加载所有翻译文件
   */
  private loadTranslations(): void {
    const languages: LanguageCode[] = ['zh-CN', 'en-US'];

    for (const lang of languages) {
      try {
        // 获取翻译文件的 URI：extensionUri/dist/i18n/{lang}.json
        const filePath = vscode.Uri.joinPath(this.extensionUri, 'dist', 'i18n', `${lang}.json`);
        const fileContent = fs.readFileSync(filePath.fsPath, 'utf-8');
        const translations = JSON.parse(fileContent);
        this.translations.set(lang, translations);
        console.log(`[I18nManager] 已加载 ${lang} 翻译文件`);
      } catch (error) {
        console.error(`[I18nManager] 加载 ${lang} 翻译文件失败:`, error);
        // 创建空的翻译对象作为备用
        this.translations.set(lang, {});
      }
    }
  }

  /**
   * 翻译函数，支持嵌套key（如 "weather.descriptions.sunny"）
   * @param key 翻译键，使用点号分隔的路径
   * @param defaultValue 默认值，如果不存在则使用此值
   * @returns 翻译文本或默认值
   */
  t(key: string, defaultValue?: string): string {
    const translations = this.translations.get(this.currentLanguage);
    if (!translations) {
      return defaultValue || key;
    }

    // 使用 reduce 递归访问嵌套对象
    const value = key.split('.').reduce(
      (obj: any, k: string) => {
        return obj?.[k];
      },
      translations
    );

    // 如果找到翻译，返回翻译文本；否则返回默认值或 key
    if (typeof value === 'string') {
      return value;
    }

    return defaultValue || key;
  }

  /**
   * 翻译并替换占位符的文本
   * @param key 翻译键
   * @param params 占位符对象，例如 { city: 'Beijing' } 替换 "${city}"
   * @param defaultValue 默认值
   * @returns 替换后的翻译文本
   */
  tWithParams(
    key: string,
    params: { [key: string]: string | number },
    defaultValue?: string
  ): string {
    let text = this.t(key, defaultValue);

    // 替换 ${key} 格式的占位符
    for (const [paramKey, paramValue] of Object.entries(params)) {
      const regex = new RegExp(`\\$\\{${paramKey}\\}`, 'g');
      text = text.replace(regex, String(paramValue));
    }

    return text;
  }

  /**
   * 获取当前语言代码
   * @returns 当前语言代码 ('zh-CN' 或 'en-US')
   */
  getCurrentLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  /**
   * 手动切换语言
   * @param language 新的语言代码
   */
  changeLanguage(language: LanguageCode): void {
    if (language !== this.currentLanguage && this.translations.has(language)) {
      this.currentLanguage = language;
      console.log(`[I18nManager] 语言已切换为: ${language}`);
      this.notifyLanguageChange();
    }
  }

  /**
   * 获取 locale 字符串，用于日期/时间格式化
   * @returns 'zh-CN' 或 'en-US'
   */
  getLocale(): string {
    return this.currentLanguage === 'zh-CN' ? 'zh-CN' : 'en-US';
  }

  /**
   * 监听语言变更事件
   * @param callback 当语言改变时调用的回调函数
   * @returns Disposable，用于取消监听
   */
  onLanguageChange(callback: (lang: LanguageCode) => void): vscode.Disposable {
    this.onLanguageChangeCallbacks.push(callback);

    // 返回 Disposable 以支持取消监听
    return {
      dispose: () => {
        const index = this.onLanguageChangeCallbacks.indexOf(callback);
        if (index > -1) {
          this.onLanguageChangeCallbacks.splice(index, 1);
        }
      },
    };
  }

  /**
   * 通知所有监听器语言已改变
   */
  private notifyLanguageChange(): void {
    for (const callback of this.onLanguageChangeCallbacks) {
      try {
        callback(this.currentLanguage);
      } catch (error) {
        console.error('[I18nManager] 语言变更回调执行出错:', error);
      }
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.onLanguageChangeCallbacks = [];
    this.translations.clear();
  }
}

// 全局 i18n 实例
let i18nInstance: I18nManager | null = null;

/**
 * 初始化全局 i18n 实例
 * @param extensionUri 扩展 URI
 */
export function initI18n(extensionUri: vscode.Uri): I18nManager {
  if (!i18nInstance) {
    i18nInstance = new I18nManager(extensionUri);
    i18nInstance.init();
  }
  return i18nInstance;
}

/**
 * 获取全局 i18n 实例
 */
export function getI18n(): I18nManager {
  if (!i18nInstance) {
    throw new Error('i18n not initialized. Call initI18n first.');
  }
  return i18nInstance;
}
