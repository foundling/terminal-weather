import { readFile, writeFile } from 'fs';
import { promisify } from 'util';

const readFilePromise = promisify(readFile);
const writeFilePromise = promisify(writeFile);

type TEMP_UNIT = 'imperial' | 'standard' | 'metric';
type DISPLAY_OPTION = 'emoji' | 'text';

export type ConfigProps = {

  [key: string]: string | TEMP_UNIT | DISPLAY_OPTION;
  // resolves error: No index signature with a parameter of type 'string' was found on type 'Config'. 

  APPID: string;
  UNITS: TEMP_UNIT;
  DISPLAY: DISPLAY_OPTION;
  DAYS: string;
  FORMAT: string;
  CACHED_AT: string;
  CACHED_WEATHER: string;

};

type ValidationErrors = string[];

export default class Config {

  path:string;
  _config:ConfigProps;

  constructor(path:string) {

    this.path = path;

  }

  validate():ValidationErrors {

    const errors = [];
    const days = parseInt(this._config['DAYS']);

    if (!this._config['APPID']) {
      errors.push('Config File Missing value: APPID');
    }

    if (!isNaN(days) && days < 1 || days > 8) {
      errors.push("Config Error: 'DAYS' must be a number between 1 and 8, inclusive.");
    }

    return errors;

  }

  _serialize():string {

    return Object.entries(this._config).reduce((prev:string, cur:[string, string]) => {
      const [key, value] = cur;
      return prev += `${key}=${value}\n`; 
    }, '');

  }

  get(keyOrKeys: string | string[]): string | string[]  {

    const keys:string[] = ([] as string[]) .concat(keyOrKeys);

    return keys.length === 1 ? this._config[keys[0]] : keys.map(key => this._config[key]);
    
  }

  set(key:string, value:string):void {
    this._config[key] = value;
  }

  async read():Promise<void> {

    let serializedConfig = '';
    try {
      serializedConfig = await readFilePromise(this.path, 'utf8');
    } catch(e) {
      if (e.code === 'ENOENT') {
        console.error('Error: failed to locate a ~/.twconfig file containing an Open Weather Map API Key (required for weather queries).');
        console.error('See Run terminal-weather --help for information on configuring the API key.');
        process.exit(1);
      }
    }
    const lines = serializedConfig.split('\n').filter(Boolean);
    const defaultConfig:ConfigProps = {
      APPID: '',
      UNITS: 'imperial',
      DISPLAY: 'emoji',
      FORMAT: 'd:i', 
      DAYS: '1',
      CACHED_AT: '',
      CACHED_WEATHER:'',
      // notes on format: d = day, i = icon, t = text, T = TEXT. rest is literal
      // format is for each day, so if you have days = 4, then 'd:i' is repeated for each day
    };

    const config:ConfigProps = lines.reduce((config:ConfigProps, line:string) => {

      // if a config line has multiple '=', you should throw an config Parsing error.
      // case: user uses '=' in their format string.
      // make them escape it? and split the line on [^\]= ?
      const [name, value] = line.split('=').map(nameOrValue => nameOrValue.trim())
      config[name] = value;

      return config;

    }, defaultConfig);

    this._config = config;

  }

  async write():Promise<void> {
    const serializedConfig = this._serialize();
    await writeFilePromise(this.path, serializedConfig, 'utf8');
  }

}
