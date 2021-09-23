"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function help() {
    var msg = "\n    tw                           gets weather, maybe from cache, maybe from owm\n    tw -n, --invalidate-cache    invalidates cache, gets weather\n    tw -p, --prompt              gets weather, prints w/ no newline\n    tw --help, -h                prints help\n    tw info                      prints config values\n    tw configure                 configure tw \n\n    format values:\n      i: icon\n      t: text\n      l: low \n      h: high\n      w: weekday\n      u: temp units\n\n    example format string: \"i l/h u \"\n  ";
    console.log(msg);
}
exports.default = help;
