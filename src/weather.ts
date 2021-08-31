import fetch, { Response } from 'node-fetch';

import emojiMap, { EmojiMap } from './emojis';
import IConfig from './config';

const IP_API_URL = 'http://ip-api.com/json';
const OWM_API_BASE = 'https://api.openweathermap.org/data/2.5/onecall';

type FormatData = {
  emojiMap: EmojiMap;
  formatString: string;
  units: string;
  multiple: boolean;
};

type FormatMap = {
  [index: string]: string;
  i: string;
  t: string;
  m: string;
  M: string;
  w: string;
};

type TEMP_UNIT = 'standard' | 'metric' | 'imperial'; 

type WeatherQueryOptions = {
  [key: string]: string | number | TEMP_UNIT;
  appid: string;
  lat: number;
  lon: number;
  exclude: string;
  units: TEMP_UNIT;
};

/* Types to express Open Weather Map JSON Response */ 

type WeatherDescription = {
  main: string;
  description: string;
};

type TemperatureData = {
  min: number;
  max: number;
};

type DailyWeatherResponse = {
  dt: number;
  temp: TemperatureData;
  weather: WeatherDescription[];
};

type Coordinates = {
  lat: number;
  lon: number;
}

type WeatherResponse = {
  coords: Coordinates;
  daily: DailyWeatherResponse[];
};

/* End Open Weather Map JSON Response Types */

function buildSearchParamString(options: Coordinates & WeatherQueryOptions):string {

  return Object.entries(options).reduce((qs: string, entry: [string, string]) => {

    const [key, value] = entry;
    const segment = `&${key}=${value}`;
    return qs + segment;

  }, '');

}

async function getLocationFromIpAddress():Promise<Coordinates> {

  const result:Response = await fetch(IP_API_URL);
  const { lat, lon } = await result.json();

  return { lat, lon }

}

async function getWeatherFromCoords(queryParams: WeatherQueryOptions):Promise<WeatherResponse> {

  const qp = buildSearchParamString(queryParams);
  const weatherEndpoint = `${OWM_API_BASE}?${qp}`
  const response = await fetch(weatherEndpoint);
  const weather = await response.json();

  return weather

}

const formatWeather = ({ formatString, multiple, units, emojiMap }:FormatData) => (weatherData: DailyWeatherResponse):string => {

  const { main } = weatherData.weather[0];
  const { icon, text } = emojiMap[main];

  const { min, max } = weatherData.temp;
  const [ hi, lo ] = [ Math.round(max), Math.round(min) ];

  const secondsSinceUnixEpoch = weatherData.dt * 1000; 
  const weekday = new Date(secondsSinceUnixEpoch).toLocaleDateString('en-US', { weekday: 'short' });
  const howShort = ['S','T'].includes(weekday[0]) ? 2 : 1; 
  const weekdayShort = weekday.substr(0, howShort); 

  let valueMap:FormatMap = {
    'i': `${icon} `,
    't': text || '',
    'm': `${lo}`, 
    'M': `${hi}`,
    'w': weekdayShort,
    'u': `°${units}`,
  };

  let formattedString = '';
  let padding = multiple ? ' ' : '';

  for (let c of formatString) {
    formattedString += (c in valueMap ? valueMap[c] : c);
  }
  
  return formattedString + padding;

}

export default async function weather(config:IConfig) {

  const APPID = config.get('APPID');
  const FORMAT = config.get('FORMAT');
  const UNITS = config.get('UNITS').toLowerCase();
  const DAYS = config.get('DAYS');

  const { lat, lon }:Coordinates = await getLocationFromIpAddress();
  const days = parseInt(DAYS);

  // FIXME: type this map more narrowly
  const unitMap:Map<string,string> = new Map([
    ['k','standard'],
    ['f','imperial'],
    ['c','celcius']
  ]);

  const queryParams = {
    appid: APPID,
    exclude: 'minutely,hourly',
    lat,
    lon,
    units: unitMap.get(UNITS)
  } as WeatherQueryOptions; // is there a better way? 


  const { daily } = await getWeatherFromCoords(queryParams);

  const formatData = {
    emojiMap,
    formatString: FORMAT,
    units: UNITS,
    multiple: days > 1
  };


  return daily.slice(0, days).map(formatWeather(formatData)).join(' ');

}
