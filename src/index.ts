import fetch, { Response } from 'node-fetch';
import { readFile } from 'fs';
import { promisify }  from 'util';

import emojiMap, { EmojiMap, FormatData } from './emojis';

const readFilePromise = promisify(readFile)
const CONFIG_PATH = './tw-config.json';

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
  const json = await readFilePromise(CONFIG_PATH, 'utf-8');
  return JSON.parse(json);
}

async function getLocationFromIpAddress():Promise<Coordinates> {

  const result:Response = await fetch('http://ip-api.com/json');
  const { lat, lon } = await result.json(); 

  return { lat, lon }

}

async function getWeatherFromCoords(coordinates: Coordinates, options: WeatherQueryOptions):Promise<WeatherResponse> {

  const { lat, lon } = coordinates;

  const weatherSearchParams = new URLSearchParams();

  weatherSearchParams.append('lat', lat.toString());
  weatherSearchParams.append('lon', lon.toString());

  if (options.exclude)
    weatherSearchParams.append('exclude', options.exclude);

  if (options.units)
    weatherSearchParams.append('units', options.units);

  weatherSearchParams.append('appid', options.appid);

  const owmEndpoint = `https://api.openweathermap.org/data/2.5/onecall?${weatherSearchParams.toString()}`
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
