import { homedir } from 'os';
import path from 'path';
import getWeather from './weather';
import Config, { configure, getConfig } from './config';

const CACHE_EXPIRATION_MIN = 10;
const DEBUG:boolean = 'TW_DEBUG' in process.env;
const CONFIG_PATH = path.join(homedir(),'.twconfig');

type WeatherOptions = {
  config: Config;
  currentTimeMs?: number;
  invalidateCache?: boolean;
};

function usage() {

  const msg = `
    tw                           gets weather, maybe from cache, maybe from owm
    tw -n, --invalidate-cache    invalidates cache, gets weather
    tw -p, --prompt              gets weather, prints w/ no newline
    tw --help, -h                prints help
    tw info                      prints config values
    tw configure                 configure tw 
    tw set config                lets you enter api key and format
    tw get config                lets you enter api key and format
    tw set format <fmt string>   updates your config w/ new format               
    tw get format                prints your format string
    tw set days <int>            sets days in config to int, must be [1,7] 
  `
  console.log(msg);
}

function info(config: Config): void {
  
  console.log(config._config);

}

function inArgs(tokens: string[], args: string[]) {
  return tokens.some(t => args.includes(t)); 
};

async function run() {

  const args = process.argv.slice(2);
  const invalidateCache = inArgs(['-n','--invalidate-cache'], args);
  const showHelp = inArgs(['-h', '--help'], args);
  const showInfo = inArgs(['info'], args);
  const promptMode = inArgs(['-p','--prompt'], args);
  const configureCommand = inArgs(['configure'], args);
  let config:Config;


  if (showInfo) {
    config = await getConfig(CONFIG_PATH);
    info(config);
    process.exit(0);
  }

  if (showHelp) {
    usage();
    process.exit(0);
  }

  if (configureCommand) {
    const configValues = configure();
    config = new Config(CONFIG_PATH, configValues)
    console.log(config);
    await config.save();
    process.exit(0);
  }

  config = await getConfig(CONFIG_PATH);
  const weatherString = await fetchWeather({ config, invalidateCache });
  return promptMode ? weatherString : weatherString + '\n';

}

async function fetchWeather(options: WeatherOptions) {
  
  const { config, invalidateCache=false, currentTimeMs=new Date().getTime() } = options;

  const existingCache = config.get('CACHED_AT');
  const cachedWeather = config.get('CACHED_WEATHER');
  const appId = config.get('APPID');

  if (!appId) {
    console.log("Error: Missing APPID from your config. Please run 'configure'");
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

    if (deltaMinutes > CACHE_EXPIRATION_MIN) {

      const weatherString = await getWeather(config)
      config.set('CACHED_AT', currentTimeMs.toString());
      config.set('CACHED_WEATHER', weatherString);

      await config.save();
      return weatherString;

    }

    return cachedWeather;

  }

}

run().then(weatherString => {

  process.stdout.write(weatherString); 
  process.exit(0);

}).catch(e => {

  console.error(e);
  process.exit(1);

});
