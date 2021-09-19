import { homedir } from 'os';
import path from 'path';
import Config from './config';
import { configure, help, info, fetchWeather } from './commands';
import parseArgs, { RunArgs, ParsedArgs } from './parse-args'; 

const CONFIG_PATH = path.join(homedir(),'.twconfig');

const args: ParsedArgs = parseArgs(process.argv);
const runArgs = {...args, ...{ configPath: CONFIG_PATH }};

async function run(runArgs:RunArgs) {

  const { 
    configPath, 
    invalidateCache,
    showHelp,
    showInfo,
    promptMode,
    configureApp
  } = runArgs; 

  let config = new Config(configPath);

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
  const weatherString = await fetchWeather({ config, invalidateCache });
  return promptMode ? weatherString : weatherString + '\n';

}

run(runArgs).then(weatherString => {

  process.stdout.write(weatherString); 
  process.exit(0);

}).catch(e => {

  console.error(e);
  process.exit(1);

});
