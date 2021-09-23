#!/usr/bin/env node

/*
 * A lazy-loading approach. Check if cache is expired before importing cli.
 * Reason: rapid re-rendering in terminal when using cached value.
 */

const { readFile } = require('fs');
const { homedir } = require('os')

const configFile = homedir() + '/.twconfig'
const MS_PER_MINUTE = 1000 * 60;
const CACHE_INTERVAL_MINUTES = 10

// only allow: terminal-weather [-p] [-n]
// args are prechopped, i.e., process.argv.slice(2)
function inPromptMode(args) {

  const allowed = [ '-p', '--prompt' ];
  return args.every(arg => allowed.includes(arg));

}

/* 
  * The only invocation that is optimized is the -p, --prompt flag. 
  * Everything else is a regular call to the cli.
  */
function tryCacheThenRun() {

  if (!inPromptMode(process.argv.slice(2))) {
    //console.log('[regular invocation]');
    const { default: run } = require('../dist/index.js');
    return run(process.argv)
        .then(weatherString => {

          const lineEnding = inPromptMode(process.argv.slice(2)) ? '' : '\n';
          process.stdout.write(`${weatherString}${lineEnding}`);

        }).catch(e => {
          console.error(e);
        });
  }

  // if we're in prompt mode, skip other code, try to output weather as efficiently as possible.
  readFile(configFile, 'utf-8', function(e, data) {

    if (e) {
      console.log("Error: No config file exists at ~/.twconfig");
      process.exit(1)
    }

    const config = data.split('\n').map(line => line.split('='))
    let now = new Date().getTime()
    let cachedAt;
    let cachedWeather;

    for (let [k,v] of config) {
      if (k === 'CACHED_AT') {
        cachedAt = new Date(parseInt(v)).getTime();
      }
      if (k === 'CACHED_WEATHER') {
        cachedWeather = v;
      }
    }

    if (cachedAt && (now - cachedAt)/MS_PER_MINUTE < CACHE_INTERVAL_MINUTES) {

      //console.log('[cache exists, not expired]');
      const promptFlag = inPromptMode(process.argv.slice(2));
      process.stdout.write(promptFlag ? cachedWeather : cachedWeather + '\n');

    } else {

      //console.log('[no cache entry ... fetch from source]');

      const { default: run } = require('../dist/index.js');

      return run(process.argv)
        .then(weatherString => {

          const lineEnding = inPromptMode(process.argv.slice(2)) ? '' : '\n';
          process.stdout.write(`${weatherString}${lineEnding}`);

        }).catch(e => {
          console.error(e);
        });

    }

  });

}

tryCacheThenRun();
