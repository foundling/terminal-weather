// notes on dynamic, type-safe module loading in ts:
// https://www.typescriptlang.org/docs/handbook/modules.html#dynamic-module-loading-in-nodejs
// http://ideasintosoftware.com/typescript-conditional-imports

const cacheExpired = true;

if (cacheExpired) {
  console.log('invalidating cache, fetching weather data')
  const main = require('./weather');
  main().then(console.log).catch(console.error)
} else {
  console.log('using cache')
}
