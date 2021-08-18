import fetch, { Response } from 'node-fetch';
import { readFile } from 'fs';
import { homedir } from 'os';
import path from 'path';
import { promisify }  from 'util';

import emojiMap, { EmojiMap, FormatData } from './emojis';

const readFilePromise = promisify(readFile)
const CONFIG_PATH = path.join(homedir(), '.twconfig'); // TODO: make this a command-line flag

type WeatherQueryOptions = {
  appid: string;
  lat: number;
  lon: number;
  exclude: string;
  units: 'standard' | 'metric' | 'imperial';
}

type WeatherDescription = {
  main: string;
  description: string;
};

type TemperatureData = {
  min: number;
  max: number;
};

type DailyWeatherResponse = {
  dt: Date;
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

async function readConfig() {

  try {

    const serialized = await readFilePromise(CONFIG_PATH, 'utf-8');
    const lines = serialized.split('\n').filter(Boolean);
    const config = lines.reduce((config, line:string) => {
      const [name, value] = line.split('=').map(nameOrValue => nameOrValue.trim())
      config.set(name, value);
      return config;
   }, new Map());

   return config;

  } catch(e) {

    console.error('Error: could not read your config file with your API KEY.')
    console.error(e);

    // TODO: run a cli --help command here

    process.exit(1);

  }

}

async function getLocationFromIpAddress():Promise<Coordinates> {

    const result:Response = await fetch('http://ip-api.com/json');
    console.log(result.status)
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
  console.log(response.status)
  const weather:WeatherResponse = await response.json();

  return weather

}

function formatWeatherData(data: DailyWeatherResponse) {

  let result = '';

  const { min, max } = data.temp;
  const [ hi, lo ] = [ Math.round(max), Math.round(min) ];
  const { description, main } = data.weather[0];
  const weather = emojiMap[main].icon ? emojiMap[main].icon : emojiMap[main].text;
  result += `${weather}  ${hi}/${lo} |`;

  return result;

}

async function main() {

  const config = await readConfig();
  console.log(config)
  const temp_unit = config.get('temp_unit');
  const API_KEY = config.get('API_KEY');
  const { lat, lon }:Coordinates = await getLocationFromIpAddress();

  const queryParams = {
    units: temp_unit || 'imperial',
    exclude: 'minutely,hourly',
    appid: API_KEY,
    lat,
    lon,
  };

  const { daily } = await getWeatherFromCoords(queryParams);
  return daily.map(formatWeatherData).join(' ');

}

main().then(console.log).catch(console.error)
