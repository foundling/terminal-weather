#!/usr/bin/env node

import { homedir } from 'os';
import path from 'path';
import Config from './config';
import { configure, help, info, fetchWeather } from './commands';
import parseArgs, { RunArgs, ParsedArgs } from './parse-args'; 
import log from './log';
import { version as VERSION } from './version.json';



export default async function run(argv: string[]) {

  const parsedArgs: ParsedArgs = parseArgs(argv);
  const configPath = path.join(homedir(),'.twconfig');
  const runArgs:RunArgs = {...parsedArgs, ...{configPath, version: VERSION }};

  const { 
    invalidateCache,
    showHelp,
    showInfo,
    promptMode,
    configureApp,
    version
  } = runArgs; 

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

if (require.main === module) { 

  // call run if we're being executed directly
  // https://nodejs.org/dist/latest-v16.x/docs/api/all.html#modules_accessing_the_main_module
  run(process.argv.slice(2)).then(weatherString => {

    process.stdout.write(weatherString); 
    process.exit(0);

  }).catch(e => {

    log(e, 'Error');
    process.exit(1);

  });

}
