/**
 * 使用统计管理模块
 * 负责追踪用户在不同位置、不同天气条件下的VSCode使用时长
 */

import * as vscode from 'vscode';
import { Location, UsageSession, UsageStats, TimeRange, UsageStatsResult } from './types';

/**
 * 使用统计管理器类
 * 单例模式，维护当前会话信息和所有历史数据
 */
export class UsageManager {
  private context: vscode.ExtensionContext;
  private stats: UsageStats;
  private currentSession: {
    startTime: number;
    location: Location;
    weather: string;
    isPaused: boolean;
    pauseStartTime?: number;
    pausedDuration: number; // 累计暂停时长（毫秒）
  } | null = null;

  private readonly STORAGE_KEY = 'weather.usageStats';

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.stats = this.loadStats();
  }

  /**
   * 从globalState加载历史数据
   */
  private loadStats(): UsageStats {
    const stored = this.context.globalState.get<UsageStats>(this.STORAGE_KEY);
    if (stored) {
      return stored;
    }
    // 初始化空的统计数据
    return {
      totalMinutes: 0,
      lastUpdated: Date.now(),
      sessions: [],
      locationStats: {},
      weatherStats: {},
      dailyStats: {},
    };
  }

  /**
   * 保存统计数据到globalState
   */
  private async saveStats(): Promise<void> {
    this.stats.lastUpdated = Date.now();
    await this.context.globalState.update(this.STORAGE_KEY, this.stats);
  }

  /**
   * 开始一个会话
   */
  startSession(location: Location, weather: string): void {
    // 如果已有未完成的会话，先结束它
    if (this.currentSession) {
      this.endSession();
    }

    this.currentSession = {
      startTime: Date.now(),
      location,
      weather,
      isPaused: false,
      pausedDuration: 0,
    };

    console.log(
      `[UsageManager] 开始会话: ${location.city}, 天气: ${weather}`
    );
  }

  /**
   * 结束当前会话
   */
  endSession(): void {
    if (!this.currentSession) {
      return;
    }

    const now = Date.now();
    const totalDurationMs =
      now - this.currentSession.startTime - this.currentSession.pausedDuration;
    const durationMinutes = Math.max(0, Math.round(totalDurationMs / 60000));

    if (durationMinutes === 0) {
      // 如果会话时长为0，不记录
      this.currentSession = null;
      return;
    }

    const session: UsageSession = {
      startTime: this.currentSession.startTime,
      endTime: now,
      location: this.currentSession.location,
      weather: this.currentSession.weather,
      durationMinutes,
    };

    // 更新统计数据
    this.stats.sessions.push(session);
    this.stats.totalMinutes += durationMinutes;

    // 更新位置统计
    const locationKey = this.getLocationKey(this.currentSession.location);
    this.stats.locationStats[locationKey] =
      (this.stats.locationStats[locationKey] || 0) + durationMinutes;

    // 更新天气统计
    this.stats.weatherStats[this.currentSession.weather] =
      (this.stats.weatherStats[this.currentSession.weather] || 0) + durationMinutes;

    // 更新每日统计
    const dateKey = this.getDateKey(this.currentSession.startTime);
    this.stats.dailyStats[dateKey] =
      (this.stats.dailyStats[dateKey] || 0) + durationMinutes;

    this.currentSession = null;

    // 异步保存，不阻塞主线程
    this.saveStats().catch((error) =>
      console.error('[UsageManager] 保存统计数据失败:', error)
    );

    console.log(`[UsageManager] 会话已结束，时长: ${durationMinutes} 分钟`);
  }

  /**
   * 暂停当前会话
   */
  pauseSession(): void {
    if (!this.currentSession || this.currentSession.isPaused) {
      return;
    }

    this.currentSession.isPaused = true;
    this.currentSession.pauseStartTime = Date.now();

    console.log('[UsageManager] 会话已暂停');
  }

  /**
   * 恢复当前会话
   */
  resumeSession(): void {
    if (!this.currentSession || !this.currentSession.isPaused) {
      return;
    }

    // 修复: 时间计算应该是 现在 - 暂停时刻，而不是相反
    const pauseStartTime = this.currentSession.pauseStartTime || Date.now();
    const pauseDurationMs = Date.now() - pauseStartTime;
    this.currentSession.pausedDuration += Math.max(0, pauseDurationMs);
    this.currentSession.isPaused = false;
    this.currentSession.pauseStartTime = undefined;

    console.log('[UsageManager] 会话已恢复');
  }

  /**
   * 更新当前会话的位置和天气
   * 如果位置或天气发生变化，则结束当前会话并启动新会话
   */
  updateCurrentSession(location: Location, weather: string): void {
    if (!this.currentSession) {
      return;
    }

    // 检查位置或天气是否发生变化
    const locationChanged = this.getLocationKey(this.currentSession.location) !== this.getLocationKey(location);
    const weatherChanged = this.currentSession.weather !== weather;

    if (locationChanged || weatherChanged) {
      // 位置或天气变化，结束当前会话并启动新会话
      console.log('[UsageManager] 检测到位置或天气变化，结束当前会话');
      this.endSession();
      this.startSession(location, weather);
    }
  }

  /**
   * 获取指定时间范围的统计数据
   */
  getStats(timeRange: TimeRange = 'all'): UsageStatsResult {
    const now = Date.now();
    const filteredSessions = this.filterSessionsByTimeRange(
      this.stats.sessions,
      timeRange,
      now
    );

    // 计算位置统计
    const locationMap = new Map<string, number>();
    const weatherMap = new Map<string, number>();
    const dailyMap = new Map<string, number>();

    filteredSessions.forEach((session) => {
      const locationKey = this.getLocationKey(session.location);
      locationMap.set(
        locationKey,
        (locationMap.get(locationKey) || 0) + session.durationMinutes
      );

      weatherMap.set(
        session.weather,
        (weatherMap.get(session.weather) || 0) + session.durationMinutes
      );

      const dateKey = this.getDateKey(session.startTime);
      dailyMap.set(
        dateKey,
        (dailyMap.get(dateKey) || 0) + session.durationMinutes
      );
    });

    // 转换为数组并排序
    const locationStats = Array.from(locationMap, ([location, minutes]) => ({
      location,
      minutes,
    })).sort((a, b) => b.minutes - a.minutes);

    const weatherStats = Array.from(weatherMap, ([weather, minutes]) => ({
      weather,
      minutes,
    })).sort((a, b) => b.minutes - a.minutes);

    const dailyBreakdown = Array.from(dailyMap, ([date, minutes]) => ({
      date,
      minutes,
    })).sort((a, b) => a.date.localeCompare(b.date));

    const totalMinutes = filteredSessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0
    );

    return {
      timeRange,
      totalMinutes,
      locationStats,
      weatherStats,
      dailyBreakdown,
    };
  }

  /**
   * 重置所有统计数据
   */
  async resetStats(): Promise<void> {
    this.stats = {
      totalMinutes: 0,
      lastUpdated: Date.now(),
      sessions: [],
      locationStats: {},
      weatherStats: {},
      dailyStats: {},
    };

    this.currentSession = null;

    await this.saveStats();
    console.log('[UsageManager] 统计数据已重置');
  }

  /**
   * 获取全部统计数据
   */
  getAllStats(): UsageStats {
    return JSON.parse(JSON.stringify(this.stats));
  }

  /**
   * 将分钟转换为格式化的时间字符串
   */
  formatMinutesToHMS(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} 分钟`;
    }

    if (mins === 0) {
      return `${hours} 小时`;
    }

    return `${hours} 小时 ${mins} 分钟`;
  }

  /**
   * 获取位置的可显示字符串
   */
  private getLocationKey(location: Location): string {
    return `${location.city}, ${location.country}`;
  }

  /**
   * 获取日期键(yyyy-MM-dd格式)
   */
  private getDateKey(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 根据时间范围筛选会话
   */
  private filterSessionsByTimeRange(
    sessions: UsageSession[],
    timeRange: TimeRange,
    now: number
  ): UsageSession[] {
    let startTime = 0;

    switch (timeRange) {
      case 'today':
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        startTime = today.getTime();
        break;

      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        startTime = weekAgo.getTime();
        break;

      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);
        startTime = monthAgo.getTime();
        break;

      case 'all':
        startTime = 0;
        break;
    }

    return sessions.filter((session) => session.startTime >= startTime);
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.endSession();
  }
}
