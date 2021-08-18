import fetch, { Response } from 'node-fetch';
import { readFile } from 'fs';
import { homedir } from 'os';
import path from 'path';
import { promisify }  from 'util';

import emojiMap, { EmojiMap, FormatData } from './emojis';

const readFilePromise = promisify(readFile)
const CONFIG_PATH = path.join(homedir(), '.tw-config.json');

type WeatherQueryOptions = {
  units: 'standard' | 'metric' | 'imperial';
  exclude: string;
  appid: string;
}

type WeatherDescription = {
  main: string;
  description: string;
};

type TempResponse = {
  min: number;
  max: number;
};

type DailyWeatherResponse = {
  dt: Date;
  temp: TempResponse;
  weather: WeatherDescription[];
};

type WeatherResponse = {
  lat: number;
  lon: number;
  daily: DailyWeatherResponse[];
};

type Coordinates = {
  lat: number;
  lon: number;
}

async function readConfig() {
  try {
    const json = await readFilePromise(CONFIG_PATH, 'utf-8');
    return JSON.parse(json);
  } catch(e) {
    console.error('Error: could not read your config file with your API KEY.')
    // TODO: run a cli --help command here 
    process.exit(1);
  }
}

async function getLocationFromIpAddress():Promise<Coordinates> {

    const result:Response = await fetch('http://ip-api.com/json');
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

async function getWeatherFromCoords(coordinates: Coordinates, options: WeatherQueryOptions):Promise<WeatherResponse> {

  const { lat, lon } = coordinates;

  const qp = buildSearchParamString({ ...coordinates, ...options });
  const owmEndpoint = `https://api.openweathermap.org/data/2.5/onecall?${qp}`
  const response:Response = await fetch(owmEndpoint);
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

  const { API_KEY, temp_unit } = await readConfig(); 
  const weatherQueryOptions = {
    units: temp_unit || 'imperial',
    exclude: 'minutely,hourly',
    appid: API_KEY,
  };

  const coords:Coordinates = await getLocationFromIpAddress();  
  const { daily } = await getWeatherFromCoords(coords, weatherQueryOptions);

  const formatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  let result = '';

  return daily.map(formatWeatherData).join(' ');

}

main().then(console.log).catch(console.error)
