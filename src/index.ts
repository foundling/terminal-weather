import { readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import weather from './weather';
import Config from './config';

const CACHE_EXPIRATION_MIN = 10;

async function tryCacheOrFetchWeather(currentTimeMs=new Date().getTime()) {

  const CONFIG_PATH = path.join(homedir(),'.twconfig');
  const config = new Config(CONFIG_PATH);

  await config.read();

  const errors = config.validate();

  if (errors.length) {
    errors.forEach(error => console.error(error));
    process.exit(1);
  }

  const existingCache = config.get('CACHED_AT');
  const cachedWeather = config.get('CACHED_WEATHER');
  const msSinceEpochFromNow = currentTimeMs;

  if (existingCache === '') {

    const weatherString = await weather(config)
    config.set('CACHED_AT', currentTimeMs.toString());
    config.set('CACHED_WEATHER', weatherString);

    await config.write();

    return weatherString;

  } else {

    const msSinceEpochFromCached = new Date(parseInt(existingCache as string)).getTime();
    const deltaMinutes = (currentTimeMs - msSinceEpochFromCached) / (1000 * 60);

    if (deltaMinutes > CACHE_EXPIRATION_MIN) {

      const weatherString = await weather(config)
      config.set('CACHED_AT', currentTimeMs.toString());
      config.set('CACHED_WEATHER', weatherString);

      await config.write();

      return weatherString;

    }

    return cachedWeather;

  }

}

tryCacheOrFetchWeather().then(console.log).catch(console.error);
