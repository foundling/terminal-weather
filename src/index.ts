import { readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import weather from './weather';

import Config from './config';

async function tryCacheOrFetchWeather() {

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
  const secondsSinceEpochFromNow = new Date().getTime();

  if (existingCache === '') {

    const weatherString = await weather(config)
    config.set('CACHED_AT', secondsSinceEpochFromNow.toString());
    config.set('CACHED_WEATHER', weatherString);

    await config.write();

    return weatherString;

  } else {

    const secondsSinceEpochFromCached = new Date(parseInt(existingCache as string)).getTime();
    const deltaMinutes = (secondsSinceEpochFromNow - secondsSinceEpochFromCached) / (60 * 1000); 

    if (deltaMinutes > 10) {

      const weatherString = await weather(config)
      config.set('CACHED_AT', secondsSinceEpochFromNow.toString());
      config.set('CACHED_WEATHER', weatherString);

      await config.write();

      return weatherString;

    }

    return cachedWeather 

  }

}

tryCacheOrFetchWeather().then(console.log).catch(console.error);
