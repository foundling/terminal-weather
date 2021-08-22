import fetch, { Response } from 'node-fetch';
import { readFile } from 'fs';
import { homedir } from 'os';
import path from 'path';
import { promisify }  from 'util';

import emojiMap, { EmojiMap, Description } from './emojis';

const readFilePromise = promisify(readFile)
const CONFIG_PATH = path.join(homedir(), '.twconfig'); // TODO: make this a command-line flag


type UNIT_OPTION = 'imperial' | 'standard' | 'metric';
type DISPLAY_OPTION = 'emoji' | 'text';
type Config = {
  [key: string]: string | number | UNIT_OPTION | DISPLAY_OPTION;
  // resolves error: No index signature with a parameter of type 'string' was found on type 'Config'. 
  APPID: string;
  UNITS: UNIT_OPTION;
  DISPLAY: DISPLAY_OPTION;
  DAYS: string;
  FORMAT: string;
  CACHED_AT: string;
  CACHED_WEATHER: string;
};

const DEFAULT_CONFIG:Config = {
  APPID: '',
  UNITS: 'imperial',
  DISPLAY: 'emoji',
  FORMAT: 'd:i', 
  DAYS: '1',
  CACHED_AT: '',
  CACHED_WEATHER:'',
  // notes on format: d = day, i = icon, t = text, T = TEXT. rest is literal
  // format is for each day, so if you have days = 4, then 'd:i' is repeated for each day
};

type FormatData = {
  format: string;
  units: string;
  multiple: Boolean;
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

  const appId = config['APPID'];
  const days = parseInt(config['DAYS']) || 0;

  if (!config['APPID']) {
    console.error('Config File Missing value: APPID');
    process.exit(1);
  }

  if (days < 1 || days > 8) {
    console.error(`Config Error: 'DAYS' must be a number between 1 and 8, inclusive.`);
    process.exit(1);
  }

}

async function getConfig(configPath:string, defaultConfig:Config):Promise<Config> {

  const serialized = await readFilePromise(configPath, 'utf-8');
  const lines = serialized.split('\n').filter(Boolean);

  const config:Config = lines.reduce((config:Config, line:string) => {

    // if a config line has multiple '=', you should throw an config Parsing error.
    // case: user uses '=' in their format string.
    // make them escape it? and split the line on [^\]= ?
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

const makeWeatherFormatter = (formatData:FormatData) => (weatherData: DailyWeatherResponse):string => {


  const secondsSinceUnixEpoch = weatherData.dt * 1000; 
  const day = new Date(secondsSinceUnixEpoch).toLocaleDateString('en-US', { weekday: 'short' });
  const { min, max } = weatherData.temp;
  const [ hi, lo ] = [ Math.round(max), Math.round(min) ];
  const { description, main } = weatherData.weather[0];
  const weather = emojiMap[main].icon ? emojiMap[main].icon : emojiMap[main].text;
  const howShort = ['S','T'].includes(day[0]) ? 2 : 1; 
  const dayShort = day.substr(0,howShort); 

  return formatData.multiple ? `${dayShort}: ${hi}/${lo} ${weather}  ` : `${hi}/${lo} ${weather}`;

}

async function main() {

  const config = await getConfig(CONFIG_PATH, DEFAULT_CONFIG);

  validateConfig(config);

  const { UNITS, APPID, FORMAT, DAYS } = config;
  const { lat, lon }:Coordinates = await getLocationFromIpAddress();
  const units = UNITS || 'imperial';
  const days = parseInt(DAYS);
  const unitMap:Map<string,string> = new Map([
    ['standard', 'k'],
    ['imperial', 'f'],
    ['metric', 'celcius']
  ]);

  const queryParams = {
    appid: APPID,
    exclude: 'minutely,hourly',
    lat,
    lon,
    units,
  };

  const { daily } = await getWeatherFromCoords(queryParams);

  const weatherFormatter = makeWeatherFormatter({
    format: config.FORMAT,
    units: unitMap.get(units) || 'standard',
    multiple: days > 1
  });

  return daily.slice(0, days).map(weatherFormatter).join(' ');

}

main().then(console.log).catch(console.error)
