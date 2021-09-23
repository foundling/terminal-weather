import Config from '../config';
export declare type WeatherOptions = {
    config: Config;
    currentTimeMs?: number;
    invalidateCache?: boolean;
};
export default function fetchWeather(options: WeatherOptions): Promise<string>;
