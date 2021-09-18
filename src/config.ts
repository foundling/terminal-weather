import { readFile, writeFile } from 'fs';
import { promisify } from 'util';

import rls from 'readline-sync';

const readFilePromise = promisify(readFile);
const writeFilePromise = promisify(writeFile);

type TEMP_UNIT = 'f' | 'k' | 'c';

type Question = {
  text: string;
  note: string;
  field: string;
  default: string;
};


export function configure(): IConfigurationValues {

  // prompt for api key
  // prompt for weather format
  // prompt for days
  // prompt for temp unit type
  // open ~/.twconfig


  const configValues: IConfigurationValues = {
    'APPID': '',
    'FORMAT': 't ',
    'UNITS': 'f',
    'DAYS': '1',
  };
  const questions: Question[] = [
    {
      text: 'API KEY',
      field: 'APPID',
      note: 'generated at https://home.openweathermap.org/api_keys', 
      default: '',
    },
    {
      text: 'FORMAT',
      field: 'FORMAT',
      note: 'options [i=icon,t=text][l=lo temp][h=high temp][w=weekday][u=temp unit]',
      default: 't ',
    },
    {
      text: 'UNITS',
      field: 'UNITS',
      note: '[f=farenheit...]',
      default: 'f',
    }
  ,
    {
      text: 'DAYS',
      field: 'DAYS',
      note: 'range [1,7]',
      default: '1',
    }
  ];



  for (const q of Object.values(questions)) {

    const formatted = `${q.text} [${q.note}] (default: ${q.default}): `;
    const answer = rls.question(formatted).trim() || q.default;

    configValues[q.field] = answer;

  }

  return configValues;

}


export async function getConfig(configPath:string): Promise<Config> {

  const config = new Config(configPath);
   
  await config.read();

  const errors = config.validate();

  if (errors.length) {
    errors.forEach(error => console.error(error));
    process.exit(1);
  }

  return config;

}

export interface IConfig {

  [key: string]: string | TEMP_UNIT;
  // this line resolves error: No index signature with a parameter of type 'string' was found on type 'Config'. 

  APPID: string;
  UNITS: TEMP_UNIT;
  DAYS: string;
  FORMAT: string;
  CACHED_AT: string;
  CACHED_WEATHER: string;
  VERSION: string;

};

export interface IConfigurationValues {

  [key: string]: string;
  APPID: string;
  UNITS: TEMP_UNIT;
  DAYS: string;
  FORMAT: string;

};

type ConfigProp = keyof IConfig;

type ValidationErrors = string[];

export default class Config {

  path:string;
  _config:IConfig;
  _rawConfig:string;

  constructor(path:string, configValues:IConfigurationValues = { 'APPID': '', 'DAYS': '1', 'FORMAT': 't ', 'UNITS': 'f' }) {

    this.path = path;

    if (configValues) {
    }

  }

  validate():ValidationErrors {

    const errors = [];
    const days = parseInt(this._config['DAYS']);
    const units = this._config['UNITS'];
    const containsExtraEqualSigns = this._rawConfig.split('\n').some(line => line.split('=').length > 2);

    if (containsExtraEqualSigns) {
      errors.push("Config File Invalid. Each line should have NAME = VALUE format.  Found more than one '=' on a line.");
    }

    if (!isNaN(days) && days < 1 || days > 8) {
      errors.push(`Config Error: 'DAYS' must be a number between 1 and 8, inclusive. Got ${days}.`);
    }

    if (!['f','c','k'].includes(units.trim().toLowerCase())) {
      errors.push(`Config Error: Units must be 'f', 'c' or 'k'. Got ${units}.`);
    }

    return errors;

  }

  _serialize():string {

    return Object.entries(this._config).reduce((prev:string, cur:[string, string]) => {
      const [key, value] = cur;
      return prev += `${key}=${value}\n`; 
    }, '');

  }

  get(key: ConfigProp): string  {
    return this._config[key];
  }

  set(key:ConfigProp, value:string):void {
    this._config[key] = value;
  }

  async read():Promise<void> {

    let serializedConfig = '';
    try {
      serializedConfig = await readFilePromise(this.path, 'utf8');
      this._rawConfig = serializedConfig;
    } catch(e) {
      if (e.code === 'ENOENT') {
        console.error('Error: failed to locate a ~/.twconfig file containing an Open Weather Map API Key (required for weather queries).');
        console.error('Run terminal-weather --help for information on configuration.');
        process.exit(1);
      }
    }
    const lines = serializedConfig.split('\n').filter(Boolean);
    const defaultConfig:IConfig = {
      APPID: '',
      UNITS: 'f',
      FORMAT: 'i M/mu', 
      DAYS: '1',
      CACHED_AT: '',
      CACHED_WEATHER:'',
      VERSION: JSON.parse(await readFilePromise('../package.json', 'utf8')).version
    };

    const config:IConfig = lines.reduce((config:IConfig, line:string) => {

      // if a config line has multiple '=', you should throw an config Parsing error.
      // case: user uses '=' in their format string.
      // make them escape it? and split the line on [^\]= ?
      const [name, value] = line.split('=').map(nameOrValue => nameOrValue.trim())

      if (value !== '') {
        config[name] = value;
      }

      return config;

    }, defaultConfig);

    this._config = config;

  }

  async save():Promise<void> {
    const serializedConfig = this._serialize();
    await writeFilePromise(this.path, serializedConfig,'utf8');
  }

}
