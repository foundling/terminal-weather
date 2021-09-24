import Config from '../config';
import getWeather from '../weather';
import log from '../log';

const CACHE_EXPIRATION_MIN = 10;
const DEBUG:boolean = 'TW_DEBUG' in process.env;

export type WeatherOptions = {
  config: Config;
  currentTimeMs?: number;
  invalidateCache?: boolean;
};

export default async function fetchWeather(options: WeatherOptions) {
  
  const { config, invalidateCache=false, currentTimeMs=new Date().getTime() } = options;

  const existingCache = config.get('CACHED_AT');
  const cachedWeather = config.get('CACHED_WEATHER');
  const cacheInterval = config.get('CACHE_EXPIRATION_MIN');
  const appId = config.get('APPID');

  if (!appId) {
    log("Missing APPID from your config. Please run 'terminal-weather configure'", 'Error');
    process.exit(1);
  }

  if (invalidateCache || existingCache === '') {

    if (DEBUG && invalidateCache) { console.log('invalidating cache') }

    const weatherString = await getWeather(config)

    config.set('CACHED_AT', currentTimeMs.toString());
    config.set('CACHED_WEATHER', weatherString);

    await config.save();

    return weatherString;

  } else {

    const msSinceEpochFromCached = new Date(parseInt(existingCache as string)).getTime();
    const deltaMinutes = (currentTimeMs - msSinceEpochFromCached) / (1000 * 60);

    // take user interval if it exists and is greater than 10
    const cacheExpirationDuration = cacheInterval && parseInt(cacheInterval) >= CACHE_EXPIRATION_MIN ?
      cacheInterval : CACHE_EXPIRATION_MIN;

    if (deltaMinutes > cacheExpirationDuration) {

      const weatherString = await getWeather(config)
      config.set('CACHED_AT', currentTimeMs.toString());
      config.set('CACHED_WEATHER', weatherString);

      await config.save();
      return weatherString;

    }

    return cachedWeather;

  }

}


