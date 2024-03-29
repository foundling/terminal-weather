import { readFile, writeFile } from 'fs';
import { promisify } from 'util';
import log from './log';

const readFilePromise = promisify(readFile);
const writeFilePromise = promisify(writeFile);

type TEMP_UNIT = 'f' | 'k' | 'c';

export interface IConfig {

  [key: string]: string | TEMP_UNIT;

  APPID: string;
  UNITS: TEMP_UNIT;
  DAYS: string;
  FORMAT: string;
  CACHED_AT: string;
  CACHED_WEATHER: string;
  CACHE_INTERVAL_MINUTES: string;
  VERSION: string;

};

type ConfigProp = keyof IConfig;

type ValidationErrors = string[];

export default class Config {

  path:string;
  version:string;
  _defaults:IConfig;
  _config:IConfig;
  _rawConfig:string;

  constructor(filepath:string, version: string) {


    this.path = filepath;
    this.version = version;
    this._rawConfig = '';
    this._config = {
      APPID: '',
      UNITS: 'f',
      DAYS: '4',
      FORMAT: 't ',
      CACHED_AT: '',
      CACHED_WEATHER: '',
      CACHE_INTERVAL_MINUTES: '10',
      VERSION: this.version,
    };

    this._defaults = Object.freeze({...this._config});

  }

  validate():ValidationErrors {

    const errors = [];
    const days = parseInt(this._config['DAYS']);
    const units = this._config['UNITS'];
    const containsExtraEqualSigns = this._rawConfig.split('\n').some(line => line.split('=').length > 2);

    if (containsExtraEqualSigns) {
      errors.push("Config file ~/.twconfig Invalid: Each line should have NAME=VALUE format.  Found more than one '=' on a single line.");
    }

    if (!isNaN(days) && days < 1 || days > 8) {
      errors.push(`Config value 'DAYS' must be a number between 1 and 8, inclusive. Got ${days}.`);
    }

    if (!['f','c','k'].includes(units.trim().toLowerCase())) {
      errors.push(`Config value 'UNITS' must be 'f', 'c' or 'k'. Got ${units}.`);
    }

    return errors;

  }

  _serialize(config=this._config):string {

    return Object.entries(config).reduce((prev:string, cur:[string, string]) => {
      const [key, value] = cur;
      return prev += `${key}=${value}\n`; 
    }, '');

  }

  get defaults() {
    return  this._defaults;
  }

  get(key: ConfigProp): string  {
    return this._config[key];
  }

  set(key:ConfigProp, value:string):void {
    this._config[key] = value;
  }

  fromObject(configValues: Partial<IConfig>):void {
    for (let [key, value] of Object.entries(configValues)) {
      if (value) {
        this.set(key, value);
      }
    }
  }

  async fromFile(filepath: string = this.path):Promise<void> {

    let serializedConfig = '';

    try {

      serializedConfig = await readFilePromise(filepath, 'utf8');
      this._rawConfig = serializedConfig;

    } catch(e:any) { // FIXME: any

      if (e.code === 'ENOENT') {
        log('No ~/.twconfig file found. see terminal-weather --help for usage.', 'Error');
        process.exit(1);
      }

    }

    const lines = serializedConfig.split('\n').filter(Boolean);
    const updatedConfig:IConfig = lines.reduce((config:IConfig, line:string) => {

      const [name, value] = line.split('=')
      config[name.trim()] = name.trim() === 'FORMAT' ? value : value.trim(); 

      return config;

    }, { ...this._config });

    this._config = updatedConfig;

  }

  async save():Promise<void> {
    const serializedConfig = this._serialize();
    await writeFilePromise(this.path, serializedConfig,'utf8');
  }

}
