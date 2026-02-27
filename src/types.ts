/**
 * 类型定义文件
 * 包含插件中使用的所有TypeScript接口和类型
 */

/**
 * 地理位置信息
 */
export interface Location {
  city: string;
  latitude: number;
  longitude: number;
  country: string;
  region: string;
}

/**
 * 天气信息
 */
export interface WeatherInfo {
  // 基本信息
  location: Location;
  timestamp: number;

  // 温度相关
  temperature: number; // 摄氏度
  feelsLike: number; // 体感温度
  temperatureMin: number; // 最低温度
  temperatureMax: number; // 最高温度

  // 天气描述
  description: string; // 天气描述文本
  icon: string; // 天气图标代码

  // 其他气象参数
  humidity: number; // 相对湿度 (%)
  windSpeed: number; // 风速 (km/h)
  windGust: number; // 阵风速度 (km/h)
  windDirection: number; // 风向 (度数)
  visibility: number; // 能见度 (km)
  uvIndex: number; // 紫外线指数
  cloudCover: number; // 云量 (%)
  pressure: number; // 气压 (hPa)
  precipitation: number; // 降水量 (mm)

  // 日出日落
  sunrise: number; // 日出时间 (unix timestamp)
  sunset: number; // 日落时间 (unix timestamp)
}

/**
 * 扩展配置
 */
export interface ExtensionConfig {
  refreshInterval: number; // 自动刷新间隔（分钟）
  temperatureUnit: 'C' | 'F'; // 温度单位
  city?: string; // 手动设置的城市名称
  autoRefresh: boolean; // 是否启用自动刷新
}

/**
 * API响应错误
 */
export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

/**
 * 缓存的天气数据
 */
export interface CachedWeather {
  data: WeatherInfo;
  timestamp: number;
  expiresAt: number;
}

/**
 * 使用统计 - 单一会话
 */
export interface UsageSession {
  startTime: number; // 会话开始时间戳
  endTime?: number; // 会话结束时间戳（可选，进行中为undefined）
  location: Location; // 该会话的位置信息
  weather: string; // 该会话的天气描述（如"晴朗"、"多云"等）
  durationMinutes: number; // 会话时长（分钟）
}

/**
 * 使用统计 - 汇总数据
 */
export interface UsageStats {
  totalMinutes: number; // 总使用时长（分钟）
  lastUpdated: number; // 最后更新时间戳
  sessions: UsageSession[]; // 所有会话记录
  locationStats: Record<string, number>; // 位置名称 => 使用分钟数
  weatherStats: Record<string, number>; // 天气类型 => 使用分钟数
  dailyStats: Record<string, number>; // 日期(yyyy-MM-dd) => 使用分钟数
}

/**
 * 时间范围类型
 */
export type TimeRange = 'today' | 'week' | 'month' | 'all';

/**
 * 使用统计结果 - 按时间范围筛选后的数据
 */
export interface UsageStatsResult {
  timeRange: TimeRange;
  totalMinutes: number;
  locationStats: { location: string; minutes: number }[]; // 排序后的位置统计
  weatherStats: { weather: string; minutes: number }[]; // 排序后的天气统计
  dailyBreakdown: { date: string; minutes: number }[]; // 按日期排序的时长分布
}
