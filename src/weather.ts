import fetch, { Response } from 'node-fetch';

import emojiMap from './emojis';
import ConfigProps from './config';

const IP_API_URL = 'http://ip-api.com/json';
const OWM_API_BASE = 'https://api.openweathermap.org/data/2.5/onecall';

type FormatData = {
  format: string;
  units: string;
  multiple: boolean;
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
  lon: number;
  daily: DailyWeatherResponse[];
};

async function getLocationFromIpAddress():Promise<Coordinates> {

  const result:Response = await fetch(IP_API_URL);
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
  const weatherEndpoint = `${OWM_API_BASE}?${qp}`
  const response = await fetch(weatherEndpoint);
  const weather = await response.json();

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
  const dayShort = day.substr(0, howShort); 

  return formatData.multiple ? `${dayShort}: ${hi}/${lo} ${weather}  ` : `${hi}/${lo} ${weather}`;

}

export default async function weather(config:ConfigProps) {

  const [ UNITS, APPID, FORMAT, DAYS ] = config.get(['UNITS', 'APPID', 'FORMAT', 'DAYS']);
  const { lat, lon }:Coordinates = await getLocationFromIpAddress();
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
    units: UNITS
  } as WeatherQueryOptions; // is there a better way? 

  const { daily } = await getWeatherFromCoords(queryParams);

  const weatherFormatter = makeWeatherFormatter({
    format: FORMAT,
    units: unitMap.get(UNITS) || 'standard',
    multiple: days > 1
  });

  return daily.slice(0, days).map(weatherFormatter).join(' ');

}
