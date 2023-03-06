"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var readFile = require('fs').readFile;
var homedir = require('os').homedir;
var path = require('path');
var terminalWeather = require('./run').default;
var ARGV = process.argv.slice(2);
var CONFIG_FILE = homedir() + '/.twconfig';
var MS_PER_MINUTE = 1000 * 60;
var DEFAULT_CACHE_INTERVAL_MINUTES = 10;
var PROMPT_MODE = inPromptMode(ARGV);
var VERSION = require('../package.json').version;
var CONFIG_PATH = path.join(homedir(), '.twconfig');
function tryCacheThenRun() {
    // no -p flag passed, run in regular mode.
    if (!PROMPT_MODE) {
        return runCli(terminalWeather);
    }
    // if in prompt mode: emit weather string as efficiently as possible.
    readFile(CONFIG_FILE, 'utf-8', function (e, data) {
        var e_1, _a;
        // issue reading config file
        if (e) {
            if (e.code === 'ENOENT') {
                process.stdout.write('no ~/.twconfig! ');
                process.exit(1);
            }
            else {
                process.stdout.write('error! ');
                process.exit(1);
            }
        }
        // config available, check for api key and cache time stamp
        var now = new Date().getTime();
        var cachedAt;
        var cachedWeather;
        var cacheIntervalMinutes;
        var apiKey;
        var config = data.split('\n').map(function (line) { return line.split('='); });
        try {
            for (var config_1 = __values(config), config_1_1 = config_1.next(); !config_1_1.done; config_1_1 = config_1.next()) {
                var _b = __read(config_1_1.value, 2), k = _b[0], v = _b[1];
                if (k === 'APPID') {
                    apiKey = v;
                }
                if (k === 'CACHED_AT') {
                    cachedAt = new Date(parseInt(v)).getTime();
                }
                if (k === 'CACHED_WEATHER') {
                    cachedWeather = v;
                }
                if (k === 'CACHE_INTERVAL_MINUTES') {
                    cacheIntervalMinutes = v;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (config_1_1 && !config_1_1.done && (_a = config_1.return)) _a.call(config_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (!apiKey) {
            process.stdout.write('api key missing! ');
            process.exit(1);
        }
        // cache exists and hasn't expired
        var cacheIntervalToUse = Math.max(parseInt(cacheIntervalMinutes) || DEFAULT_CACHE_INTERVAL_MINUTES, DEFAULT_CACHE_INTERVAL_MINUTES);
        if (cachedAt && (now - cachedAt) / MS_PER_MINUTE < cacheIntervalToUse) {
            process.stdout.write(PROMPT_MODE ? cachedWeather : cachedWeather + '\n');
        }
        else {
            // cache expired, run in regular cli mode.
            return runCli(terminalWeather);
        }
    });
}
exports.default = tryCacheThenRun;
function runCli(terminalWeather) {
    terminalWeather(ARGV, VERSION, CONFIG_PATH).then(function (weatherString) {
        var lineEnding = PROMPT_MODE ? '' : '\n';
        process.stdout.write("".concat(weatherString).concat(lineEnding));
    }).catch(function (e) { console.error(e); });
}
function inPromptMode(args) {
    var allowed = ['-p', '--prompt'];
    return args.length > 0 && args.every(function (arg) { return allowed.includes(arg); });
}
