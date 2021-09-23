declare type TEMP_UNIT = 'f' | 'k' | 'c';
export interface IConfig {
    [key: string]: string | TEMP_UNIT;
    APPID: string;
    UNITS: TEMP_UNIT;
    DAYS: string;
    FORMAT: string;
    CACHED_AT: string;
    CACHED_WEATHER: string;
    VERSION: string;
}
declare type ConfigProp = keyof IConfig;
declare type ValidationErrors = string[];
export default class Config {
    path: string;
    version: string;
    _config: IConfig;
    _rawConfig: string;
    constructor(filepath: string, version: string);
    validate(): ValidationErrors;
    _serialize(config?: IConfig): string;
    get(key: ConfigProp): string;
    set(key: ConfigProp, value: string): void;
    fromObject(configValues: Partial<IConfig>): void;
    fromFile(filepath?: string): Promise<void>;
    save(): Promise<void>;
}
export {};
