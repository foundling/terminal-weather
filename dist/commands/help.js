"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function help() {
    var msg = "\n    usage: terminal-weather [ option | command ]\n\n    terminal-weather                           gets weather, maybe from cache, maybe from owm\n    terminal-weather -n, --invalidate-cache    invalidates cache, gets weather\n    terminal-weather -p, --prompt              gets weather, prints w/ no newline\n    terminal-weather --help, -h                prints help\n    terminal-weather info                      prints config values\n    terminal-weather configure                 configure tw\n\n    format values:\n      i: icon\n      t: text\n      l: low \n      h: high\n      w: weekday\n      u: temp units\n\n    example format string: \"i l/h u \"\n\n    Configuration:\n\n    Your configuration file can be found at ~/.twconfig. It looks like this:\n\n      APPID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n      UNITS=f\n      FORMAT=i\n      DAYS=4\n      CACHE_INTERVAL_MINUTES=10\n      VERSION=1.0.0\n  ";
    console.log(msg);
}
exports.default = help;
