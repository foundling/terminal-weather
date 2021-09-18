import { homedir } from 'os';
import path from 'path';
import getWeather from './weather';
import Config from './config';
import rls from 'readline-sync';

const CACHE_EXPIRATION_MIN = 10;
const DEBUG:boolean = 'TW_DEBUG' in process.env;

const inArgs = (tokens: string[], args: string[]) => tokens.some(t => args.includes(t)); 

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

type Question = {
  text: string;
  note: string;
  field: string;
  default: string;
  answer: string;
};

async function configure(config:Config) {

  // prompt for api key
  // prompt for weather format
  // prompt for days
  // prompt for temp unit type
  // open ~/.twconfig


  const questions: Question[] = [
    {
      text: 'API KEY',
      field: 'APPID',
      note: 'generated at https://home.openweathermap.org/api_keys', 
      default: '',
      answer: '',
    },
    {
      text: 'FORMAT',
      field: 'FORMAT',
      note: 'options [i=icon,t=text][l=lo temp][h=high temp][w=weekday][u=temp unit]',
      default: 't ',
      answer: '',
    },
    {
      text: 'UNITS',
      field: 'UNITS',
      note: '[f=farenheit...]',
      default: 'f',
      answer: '',
    }
,
    {
      text: 'DAYS',
      field: 'DAYS',
      note: 'range [1,7]',
      default: '1',
      answer: '',
    }
  ];


    
  for (const q of Object.values(questions)) {

    const formatted = `${q.text} [${q.note}] (default: ${q.default}): `;
    const answer = rls.question(formatted);

    q.answer = answer.trim() || q.answer;

    config.set(q.field, q.answer);

  }

  console.log(config._config);
  await config.save();


}


async function getConfig(configPath:string): Promise<Config> {

  const config = new Config(configPath);
   
  await config.read();

  const errors = config.validate();

  if (errors.length) {
    errors.forEach(error => console.error(error));
    process.exit(1);
  }

  return config;

}

type WeatherOptions = {
  config: Config;
  currentTimeMs?: number;
  invalidateCache?: boolean;
};

async function run() {

  const args = process.argv.slice(2);
  const invalidateCache = inArgs(['-n','--invalidate-cache'], args);
  const showHelp = inArgs(['-h', '--help'], args);
  const showInfo = inArgs(['info'], args);
  const promptMode = inArgs(['-p','--prompt'], args);
  const configureCommand = inArgs(['configure'], args);

  const configPath = path.join(homedir(),'.twconfig');
  const config:Config = await getConfig(configPath);

  if (showInfo) {
    info(config);
    process.exit(0);
  }

  if (showHelp) {
    usage();
    process.exit(0);
  }

  if (configureCommand) {
    configure(config);
    process.exit(0);
  }

  const options: WeatherOptions = {
    config,
    invalidateCache,
  };

  const weatherString = await tryCacheOrFetchWeather(options);
  return promptMode ? weatherString : weatherString + '\n';

}

async function tryCacheOrFetchWeather({ config, invalidateCache=false, currentTimeMs=new Date().getTime() }: WeatherOptions) {
  
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
