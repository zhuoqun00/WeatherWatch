/**
 * 天气API模块
 * 负责从Open-Meteo API获取天气信息
 */

import * as https from 'https';
import { Location, WeatherInfo } from './types';
import { getI18n } from './i18n/i18nManager';

/**
 * 天气提供者类
 * 使用Open-Meteo免费API获取天气数据
 */
export class WeatherProvider {
  private static readonly API_BASE = 'https://api.open-meteo.com/v1/forecast';
  private static readonly TIMEOUT = 10000; // 10秒超时

  /**
   * 获取指定位置的天气信息
   * @param location 地理位置
   * @returns 返回天气信息
   */
  static async getWeather(location: Location): Promise<WeatherInfo> {
    try {
      const url = this.buildWeatherUrl(location);
      console.log(`[WeatherProvider] 请求天气数据: ${location.city}`);

      const data = await this.fetchWithTimeout(url, this.TIMEOUT);

      if (!data.current) {
        throw new Error('天气API未返回当前天气数据');
      }

      const weatherInfo = this.parseWeatherData(data, location);
      console.log(`[WeatherProvider] 成功获取${location.city}的天气数据`);

      return weatherInfo;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error(`[WeatherProvider] 获取天气数据失败: ${errorMsg}`);
      throw new Error(`无法获取${location.city}的天气数据: ${errorMsg}`);
    }
  }

  /**
   * 构建天气API请求URL
   * @param location 地理位置
   * @returns API URL
   */
  private static buildWeatherUrl(location: Location): string {
    const i18n = getI18n();
    const language = i18n.getCurrentLanguage() === 'zh-CN' ? 'zh' : 'en';
    
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'visibility',
        'pressure_msl',
        'uv_index',
        'cloud_cover',
        'precipitation',
      ].join(','),
      daily: ['sunrise', 'sunset', 'weather_code', 'temperature_2m_max', 'temperature_2m_min'].join(
        ','
      ),
      timezone: 'auto',
      language: language,
    });

    return `${this.API_BASE}?${params.toString()}`;
  }

  /**
   * 解析Open-Meteo API响应数据
   * @param data API响应数据
   * @param location 位置信息
   * @returns 解析后的天气信息
   */
  private static parseWeatherData(data: any, location: Location): WeatherInfo {
    const current = data.current;
    const daily = data.daily;

    // 解析天气代码
    const description = this.getWeatherDescription(current.weather_code);
    const icon = this.getWeatherIcon(current.weather_code);

    const weatherInfo: WeatherInfo = {
      location,
      timestamp: new Date().getTime(),

      // 温度
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      temperatureMin: daily.temperature_2m_min[0],
      temperatureMax: daily.temperature_2m_max[0],

      // 天气描述
      description,
      icon,

      // 其他参数
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windGust: current.wind_gusts_10m,
      windDirection: current.wind_direction_10m,
      visibility: current.visibility / 1000, // 转换为km
      uvIndex: current.uv_index,
      cloudCover: current.cloud_cover,
      pressure: current.pressure_msl,
      precipitation: current.precipitation,

      // 日出日落
      sunrise: new Date(daily.sunrise[0]).getTime(),
      sunset: new Date(daily.sunset[0]).getTime(),
    };

    return weatherInfo;
  }

  /**
   * 根据WMO天气代码获取天气描述
   * @param code WMO天气代码
   * @returns 天气描述
   */
  private static getWeatherDescription(code: number): string {
    const i18n = getI18n();
    
    const weatherCodes: { [key: number]: string } = {
      0: 'clear',
      1: 'mostlyClear',
      2: 'partlyCloudy',
      3: 'overcast',
      45: 'fog',
      48: 'rime',
      51: 'drizzleLarge',
      53: 'drizzleModerate',
      55: 'drizzleHeavy',
      61: 'rainSmall',
      63: 'rainModerate',
      65: 'rainHeavy',
      71: 'snowSmall',
      73: 'snowModerate',
      75: 'snowHeavy',
      80: 'rainShowerSmall',
      81: 'rainShowerModerate',
      82: 'rainShowerHeavy',
      85: 'snowShowerSmall',
      86: 'snowShowerHeavy',
      95: 'thunderstorm',
      96: 'thunderstormSmallHail',
      99: 'thunderstormLargeHail',
    };

    const keyName = weatherCodes[code] || 'unclear';
    return i18n.t(`weather.descriptions.${keyName}`);
  }

  /**
   * 根据WMO天气代码获取天气图标（emoji）
   * @param code WMO天气代码
   * @returns 天气图标
   */
  private static getWeatherIcon(code: number): string {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '🌤️';
    if (code === 3) return '☁️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '⛈️';
    if (code >= 85 && code <= 86) return '❄️⛈️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '🌡️';
  }

  /**
   * 带超时的HTTP GET请求
   * @param url 请求URL
   * @param timeout 超时时间（毫秒）
   * @returns 响应数据
   */
  private static async fetchWithTimeout(url: string, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('请求超时'));
      }, timeout);

      https.get(url, (res) => {
        clearTimeout(timeoutId);
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (error) {
            reject(new Error('响应数据解析失败'));
          }
        });
      }).on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  /**
   * 将摄氏度转换为华氏度
   * @param celsius 摄氏度
   * @returns 华氏度
   */
  static celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
  }

  /**
   * 根据单位获取温度字符串
   * @param celsius 摄氏度温度
   * @param unit 温度单位 (C/F)
   * @returns 格式化的温度字符串
   */
  static formatTemperature(celsius: number, unit: 'C' | 'F' = 'C'): string {
    if (unit === 'F') {
      const fahrenheit = this.celsiusToFahrenheit(celsius);
      return `${fahrenheit.toFixed(1)}°F`;
    }
    return `${celsius.toFixed(1)}°C`;
  }
}
