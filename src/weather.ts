import fetch, { Response } from 'node-fetch';

import emojiMap, { EmojiMap } from './emojis';
import IConfig from './config';
import log from './log';

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
  l: string;
  h: string;
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

function buildSearchParamString(options: Coordinates & WeatherQueryOptions):string {

  return Object.entries(options).reduce((qs: string, entry: [string, string | number]) => {

    const [key, value] = entry;
    const segment = `&${key}=${value}`;
    return qs + segment;

  }, '');

}

async function getLocationFromIpAddress():Promise<Coordinates> {

  let result:Response | null = null;

  try {
    result = await fetch(IP_API_URL);
    if (result.status !== 200) {
      log(result.statusText, 'Error');
      process.exit(1);
    }
  } catch(e) {
    log(`${e}`, 'Error');
    process.exit(1);
  }

  const { lat, lon } = (await result.json()) as Coordinates;
  return { lat, lon }

}

async function getWeatherFromCoords(queryParams: WeatherQueryOptions):Promise<WeatherResponse> {

  const qp = buildSearchParamString(queryParams);
  const weatherEndpoint = `${OWM_API_BASE}?${qp}`
  let response;

  try {
    response = await fetch(weatherEndpoint);
    if (response.status !== 200) {
      log(response.statusText, 'Error');
      process.exit(1);
    }
  } catch(e) {
    log(`${e}`, 'Error');
    process.exit(1);
  }

  //note on use of 'as' below: https://github.com/node-fetch/node-fetch/issues/1262#issuecomment-913597816
  const weather = (await response.json()) as WeatherResponse;

  return weather

}

const makeWeatherFormatter = ({ formatString, units, emojiMap }:FormatData) => (weatherData: DailyWeatherResponse):string => {

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
    'l': `${lo}`, 
    'h': `${hi}`,
    'w': weekdayShort,
    'u': `°${units}`,
  };

  let formattedString = '';

  for (let c of formatString) {
    formattedString += (c in valueMap ? valueMap[c] : c);
  }
  
  return formattedString;

}

export default async function getWeather(config:IConfig) {

  const APPID = config.get('APPID');
  const FORMAT = config.get('FORMAT');
  const UNITS = config.get('UNITS').toLowerCase();
  const DAYS = config.get('DAYS');

  const { lat, lon }:Coordinates = await getLocationFromIpAddress();
  const days = parseInt(DAYS);

  const unitMapForApi:Map<string,TEMP_UNIT> = new Map([
    ['k','standard'],
    ['f','imperial'],
    ['c','metric']
  ]);

  const queryParams = {
    appid: APPID,
    exclude: 'minutely,hourly',
    lat,
    lon,
    units: unitMapForApi.get(UNITS) || 'imperial'
  };

  const { daily } = await getWeatherFromCoords(queryParams);

  const formatData = {
    emojiMap,
    formatString: FORMAT,
    units: UNITS,
    multiple: days > 1
  };

  const weatherFormatter = makeWeatherFormatter(formatData);
  return daily.slice(0, days).map(weatherFormatter).join('');

}
