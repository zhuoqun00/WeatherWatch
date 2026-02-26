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
