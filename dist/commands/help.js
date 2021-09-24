"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function help() {
    var msg = "\n    usage: terminal-weather [ option | command ]\n\n    tw                           gets weather, maybe from cache, maybe from owm\n    tw -n, --invalidate-cache    invalidates cache, gets weather\n    tw -p, --prompt              gets weather, prints w/ no newline\n    tw --help, -h                prints help\n    tw info                      prints config values\n    tw configure                 configure tw \n\n    format values:\n      i: icon\n      t: text\n      l: low \n      h: high\n      w: weekday\n      u: temp units\n\n    example format string: \"i l/h u \"\n\n    Configuration:\n\n    Your configuration path is fixed at ~/.twconfig. It looks like this:\n\n      APPID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n      UNITS=f\n      FORMAT=i\n      DAYS=4\n      CACHED_AT=1632439018291\n      CACHED_WEATHER=\uD83C\uDF25 \uD83C\uDF27 \uD83C\uDF1E \uD83C\uDF25 \n      VERSION=1.0.0\n  ";
    console.log(msg);
}
exports.default = help;
