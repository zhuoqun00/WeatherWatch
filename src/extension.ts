/**
 * VS Code 天气插件入口文件
 * 主要负责激活插件和管理生命周期
 */

import * as vscode from 'vscode';
import { StatusBarUI } from './statusBarUI';
import { CommandHandler } from './commandHandler';
import { initI18n, getI18n } from './i18n/i18nManager';
import { ConfigManager } from './config';

// 全局变量，保持对象引用以避免垃圾回收
let statusBarUI: StatusBarUI;
let commandHandler: CommandHandler;
let disposables: vscode.Disposable[] = [];

/**
 * 插件被激活时调用
 * @param context 扩展上下文
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('=== 天气插件已启动 ===');
  console.log(`插件存储路径: ${context.extensionPath}`);

  try {
    // 初始化 i18n（必须最先初始化），使用用户配置的语言，默认英文
    const i18n = initI18n(context.extensionUri, ConfigManager.getLanguage());
    console.log(`✓ I18nManager 初始化成功，当前语言: ${i18n.getCurrentLanguage()}`);

    // 初始化UI
    statusBarUI = new StatusBarUI();
    console.log('✓ StatusBarUI 初始化成功');

    // 初始化命令处理器
    commandHandler = new CommandHandler(statusBarUI);
    console.log('✓ CommandHandler 初始化成功');

    // 注册所有命令
    const commandDisposables = commandHandler.registerCommands();
    commandDisposables.forEach((d) => context.subscriptions.push(d));
    console.log('✓ 命令注册成功');

    // 保存disposables用于清理
    disposables = commandDisposables;

    // 初始化天气信息
    console.log('开始初始化天气数据...');
    commandHandler.initialize().catch((error) => {
      console.error('初始化失败:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      statusBarUI.showError(`初始化失败: ${errorMsg}`);
    });

    // 监听语言配置变更，动态切换插件显示语言
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('weather.language')) {
          const newLang = ConfigManager.getLanguage();
          getI18n().changeLanguage(newLang);
          console.log(`[extension] 语言已切换为: ${newLang}`);
        }
      })
    );

    // 将UI对象添加到上下文的清理列表
    context.subscriptions.push(statusBarUI);

    console.log('✓ 天气插件初始化完成');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    console.error('✗ 插件激活失败:', errorMsg);
    vscode.window.showErrorMessage(`天气插件激活失败: ${errorMsg}`);
  }
}

/**
 * 插件被停用时调用
 */
export function deactivate() {
  console.log('=== 天气插件已停用 ===');

  try {
    // 清理命令处理器
    if (commandHandler) {
      commandHandler.dispose();
    }

    // 清理UI
    if (statusBarUI) {
      statusBarUI.dispose();
    }

    // 清理 i18n
    try {
      const i18n = getI18n();
      i18n.dispose();
    } catch (error) {
      // i18n 不可用时忽略
    }

    // 清理disposables
    disposables.forEach((d) => d.dispose());
    disposables = [];

    console.log('天气插件清理完成');
  } catch (error) {
    console.error('插件停用时出错:', error);
  }
}
