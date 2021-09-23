#!/usr/bin/env node

/*
 * To support rapid re-rendering in the terminal prompt (the whole point of this little cli),
 * we need to check the cache for missing or expired timestamp before running the main program.
 *
 * That is triggered when the -p, --prompt flag is thrown.  It is possible, however, that the
 * user hasn't configured the app, so if the twconfig file is missing, we want to handle that case.
 * 
 */

const { readFile } = require('fs');
const { homedir } = require('os');
const ARGV = process.argv.slice(2);
const CONFIG_FILE = homedir() + '/.twconfig';
const MS_PER_MINUTE = 1000 * 60;
const CACHE_INTERVAL_MINUTES = 10;
const PROMPT_MODE = inPromptMode(ARGV);

function inPromptMode(args) {

  const allowed = [ '-p', '--prompt' ];
  return args.length > 0 && args.every(arg => allowed.includes(arg));

}

function run(tw) {
  // regular cli invocation
  tw(ARGV).then(weatherString => {
    const lineEnding = PROMPT_MODE ? '' : '\n';
    process.stdout.write(`${weatherString}${lineEnding}`);
  }).catch(e => { console.error(e); });
}

function tryCacheThenRun() {

  // not in prompt mode, run in regular mode.
  if (!PROMPT_MODE) {
    const { default: prog } = require('../dist/index.js');
    return run(prog);
  }

  // if in prompt mode: emit weather string as efficiently as possible.
  readFile(CONFIG_FILE, 'utf-8', function(e, data) {

    // issue reading config file
    if (e) {
      if (e.code === 'ENOENT') {
        process.stdout.write('no ~/.twconfig! ');
        process.exit(1);
      } else {
        process.stdout.write('error! ');
        process.exit(1);
      }
    }

    // config available, check for api key and cache time stamp
    let now = new Date().getTime();
    let cachedAt;
    let cachedWeather;
    let apiKey;

    const config = data.split('\n').map(line => line.split('='));
    for (let [k,v] of config) {
      if (k === 'APPID') {
        apiKey = v;
      }
      if (k === 'CACHED_AT') {
        cachedAt = new Date(parseInt(v)).getTime();
      }
      if (k === 'CACHED_WEATHER') {
        cachedWeather = v;
      }
    }

    if (!apiKey) {
      process.stdout.write('api key missing! ');
      process.exit(1);
    }

    // cache exists and hasn't expired
    if (cachedAt && (now - cachedAt)/MS_PER_MINUTE < CACHE_INTERVAL_MINUTES) {
      process.stdout.write(PROMPT_MODE ? cachedWeather : cachedWeather + '\n');
    } else {
      // cache expired, run in regular cli mode.
      const { default: prog } = require('../dist/index.js');
      return run(prog)
    }

  });

}

tryCacheThenRun();
