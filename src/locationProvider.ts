/**
 * 位置检测模块
 * 负责通过IP地址或用户输入获取地理位置
 */

import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';
import { Location } from './types';
import { getI18n } from './i18n/i18nManager';

/**
 * 位置提供者类
 * 提供从IP地址和用户输入获取位置的功能
 */
export class LocationProvider {
  // 多个位置检测API，按优先级排列
  private static readonly LOCATION_APIS = [
    {
      name: 'ip-api.com',
      url: 'http://ip-api.com/json/',
      parser: (data: any) => {
        if (data.status === 'success' && data.city && data.lat && data.lon) {
          return {
            city: data.city,
            latitude: data.lat,
            longitude: data.lon,
            country: data.country,
            region: data.regionName,
          };
        }
        return null;
      }
    },
    {
      name: 'ipapi.co',
      url: 'https://ipapi.co/json/',
      parser: (data: any) => {
        if (data.city && data.latitude && data.longitude) {
          return {
            city: data.city,
            latitude: typeof data.latitude === 'string' ? parseFloat(data.latitude) : data.latitude,
            longitude: typeof data.longitude === 'string' ? parseFloat(data.longitude) : data.longitude,
            country: data.country_name || 'Unknown',
            region: data.region || '',
          };
        }
        return null;
      }
    },
    {
      name: 'ipinfo.io',
      url: 'https://ipinfo.io/json?token=b42d6436b65ea5',
      parser: (data: any) => {
        if (data.city && data.loc) {
          const [lat, lon] = data.loc.split(',').map((v: string) => parseFloat(v));
          return {
            city: data.city,
            latitude: lat,
            longitude: lon,
            country: data.country,
            region: data.region,
          };
        }
        return null;
      }
    },
    {
      name: 'geoip-db.com',
      url: 'https://geoip-db.com/json',
      parser: (data: any) => {
        if (data.city && data.latitude && data.longitude) {
          return {
            city: data.city,
            latitude: data.latitude,
            longitude: data.longitude,
            country: data.country_name,
            region: data.state,
          };
        }
        return null;
      }
    },
  ];

  private static readonly TIMEOUT = 5000; // 5秒超时
  // 默认城市作为备用
  private static readonly DEFAULT_LOCATION: Location = {
    city: '北京',
    latitude: 39.9075,
    longitude: 116.39723,
    country: '中国',
    region: '北京市',
  };

  /**
   * 通过IP地址自动检测当前位置
   * 支持多个API，按优先级轮流尝试
   * @returns 返回位置信息或默认位置（失败时）
   */
  static async getLocationFromIP(): Promise<Location | null> {
    try {
      console.log('[LocationProvider] 尝试通过IP获取位置...');
      
      // 轮流尝试各个API
      for (const api of this.LOCATION_APIS) {
        try {
          console.log(`[LocationProvider] 尝试 ${api.name}...`);
          const data = await this.fetchWithTimeout(api.url, this.TIMEOUT);
          
          // 使用API特定的解析器提取位置信息
          const locationData = api.parser(data);
          if (locationData) {
            const location: Location = {
              city: locationData.city,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              country: locationData.country,
              region: locationData.region,
            };
            console.log(`[LocationProvider] ✓ ${api.name} 成功获取位置: ${location.city}, ${location.country}`);
            return location;
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '未知错误';
          console.warn(`[LocationProvider] ${api.name} 失败: ${errorMsg}，尝试下一个API...`);
          continue;
        }
      }

      // 所有API都失败，使用默认位置
      console.warn('[LocationProvider] 所有位置检测API都失败，使用默认位置');
      console.log(`[LocationProvider] 使用默认位置: ${this.DEFAULT_LOCATION.city}`);
      return this.DEFAULT_LOCATION;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.warn(`[LocationProvider] 位置检测异常: ${errorMsg}`);
      console.log(`[LocationProvider] 使用默认位置: ${this.DEFAULT_LOCATION.city}`);
      return this.DEFAULT_LOCATION;
    }
  }

  /**
   * 通过用户输入的城市名称获取位置
   * 使用Open-Meteo的地理编码API
   * @param cityName 城市名称
   * @returns 返回位置信息或null（失败时）
   */
  static async getLocationFromCity(cityName: string): Promise<Location | null> {
    try {
      const i18n = getI18n();
      if (!cityName || cityName.trim().length === 0) {
        throw new Error(i18n.t('messages.error.emptyCity'));
      }

      const encodedCity = encodeURIComponent(cityName.trim());
      const locale = i18n.getLocale();
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedCity}&count=1&language=${locale === 'zh-CN' ? 'zh' : 'en'}&format=json`;

      const data = await this.fetchWithTimeout(url, this.TIMEOUT);

      if (!data.results || data.results.length === 0) {
        throw new Error(i18n.tWithParams('messages.error.cityNotFound', { city: cityName }));
      }

      const result = data.results[0];
      const location: Location = {
        city: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        country: result.country || 'Unknown',
        region: result.admin1 || '',
      };

      console.log(`[LocationProvider] 通过城市名检测到位置: ${location.city}, ${location.country}`);
      return location;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error(`[LocationProvider] 城市位置检测失败: ${errorMsg}`);
      return null;
    }
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

      // 选择合适的协议处理器
      const protocol = url.startsWith('https') ? https : http;

      protocol.get(url, (res) => {
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
   * 提示用户输入城市名称
   * @returns 用户输入的城市名称或null（取消时）
   */
  static async promptForCity(): Promise<string | null> {
    const i18n = getI18n();
    const city = await vscode.window.showInputBox({
      prompt: i18n.getCurrentLanguage() === 'zh-CN' 
        ? '输入城市名称（例如：北京、上海、伦敦）'
        : 'Enter city name (e.g. Beijing, London)',
      placeHolder: i18n.t('usagePanel.table.location'),
      validateInput: (value) => {
        if (value.trim().length === 0) {
          return i18n.t('messages.error.emptyCity');
        }
        return '';
      },
    });

    return city || null;
  }
}
