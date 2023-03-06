import Config from './config';
import { configure, help, info, fetchWeather } from './commands';
import parseArgs, { ParsedArgs } from './parse-args';

export default async function run(argv: string[], version:string, configPath:string) {

  const parsedArgs: ParsedArgs = parseArgs(argv);

  const {
    invalidateCache,
    showHelp,
    showInfo,
    promptMode,
    configureApp,
  } = parsedArgs;

  let config = new Config(configPath, version);

  if (showHelp) {
    help();
    process.exit(0);
  }

  if (showInfo) {
    await config.fromFile(configPath);
    info(config);
    process.exit(0);
  }

  if (configureApp) {
    config.fromObject(configure());
    await config.save();
    process.exit(0);
  }


  await config.fromFile(configPath);
  let weatherString = await fetchWeather({ config, invalidateCache });
  return promptMode ? weatherString : weatherString + '\n';

}
