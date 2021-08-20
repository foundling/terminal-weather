import fetch, { Response } from 'node-fetch';
import { readFile } from 'fs';
import { homedir } from 'os';
import path from 'path';
import { promisify }  from 'util';

import emojiMap, { EmojiMap, FormatData } from './emojis';

const readFilePromise = promisify(readFile)
const CONFIG_PATH = path.join(homedir(), '.twconfig'); // TODO: make this a command-line flag


type UNIT_OPTION = 'imperial' | 'standard' | 'metric';
type DISPLAY_OPTION = 'emoji' | 'text';
type Config = {
  [key: string]: undefined | string | number | UNIT_OPTION | DISPLAY_OPTION;
  // resolves error: No index signature with a parameter of type 'string' was found on type 'Config'. 
  APPID?: string;
  UNITS?: UNIT_OPTION;
  DISPLAY?: DISPLAY_OPTION;
  DAYS?: number;
  FORMAT?: string;
  CACHED_AT?: number;
  CACHED_WEATHER?: string;
};

const DEFAULT_CONFIG:Config = {
  APPID: '',
  UNITS: 'imperial',
  DISPLAY: 'emoji',
  FORMAT: 'd:i', 
  // notes on format: d = day, i = icon, t = text, T = TEXT. rest is literal
  // format is for each day, so if you have days = 4, then 'd:i' is repeated for each day
  DAYS: 4,
};

type WeatherQueryOptions = {
  appid: string;
  lat: number;
  lon: number;
  exclude: string;
  units: 'standard' | 'metric' | 'imperial';
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
  lon: number;
  daily: DailyWeatherResponse[];
};

function validateConfig(config: Config):void {
  if (!config['APPID']) {
    console.error('Config File Missing value: APPID');
    process.exit(1);
  }
}

async function getConfig(configPath:string, defaultConfig:Config):Promise<Config> {

  const serialized = await readFilePromise(configPath, 'utf-8');
  const lines = serialized.split('\n').filter(Boolean);

  const config:Config = lines.reduce((config:Config, line:string) => {

    const [name, value] = line.split('=').map(nameOrValue => nameOrValue.trim())
    config[name] = value;

    return config;

  }, defaultConfig);

 return config;

}

async function getLocationFromIpAddress():Promise<Coordinates> {

    const result:Response = await fetch('http://ip-api.com/json');
    //console.log(result.status)
    const { lat, lon } = await result.json();
    return { lat, lon }

}

function buildSearchParamString(options: Coordinates & WeatherQueryOptions):string {

  return Object.entries(options).reduce((qs: string, entry: [string, string]) => {

    const [key, value] = entry;
    const segment = `&${key}=${value}`;
    return qs + segment;

  }, '');

}

async function getWeatherFromCoords(queryParams: WeatherQueryOptions):Promise<WeatherResponse> {

  const qp = buildSearchParamString(queryParams);
  const owmEndpoint = `https://api.openweathermap.org/data/2.5/onecall?${qp}`
  const response:Response = await fetch(owmEndpoint);
  //console.log(response.status)
  const weather:WeatherResponse = await response.json();

  return weather

}

function formatWeatherData(data: DailyWeatherResponse) {

  let result = '';

  const secondsSinceUnixEpoch = data.dt * 1000; 
  const day = new Date(secondsSinceUnixEpoch).toLocaleDateString('en-US', { weekday: 'short' });
  const { min, max } = data.temp;
  const [ hi, lo ] = [ Math.round(max), Math.round(min) ];
  const { description, main } = data.weather[0];
  const weather = emojiMap[main].icon ? emojiMap[main].icon : emojiMap[main].text;
  result += `${day.substr(0,2).toLowerCase()}${weather} `;

  return result;

}

async function main() {

  const config = await getConfig(CONFIG_PATH, DEFAULT_CONFIG);

  validateConfig(config);

  const { UNITS, APPID } = config;
  const { lat, lon }:Coordinates = await getLocationFromIpAddress();

  const queryParams = {
    appid: APPID as string,
    exclude: 'minutely,hourly',
    lat,
    lon,
    units: UNITS || 'imperial',
  };

  const { daily } = await getWeatherFromCoords(queryParams);

  return daily.map(formatWeatherData).join(' ');

}

main().then(console.log).catch(console.error)
