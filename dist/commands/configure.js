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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var readline_sync_1 = __importDefault(require("readline-sync"));
function configure() {
    var e_1, _a;
    // this should be a partial of Config type
    var configValues = {
        'APPID': '',
        'FORMAT': 't ',
        'UNITS': 'f',
        'DAYS': '1',
    };
    var questions = [
        {
            text: 'API KEY',
            field: 'APPID',
            note: 'generated at https://home.openweathermap.org/api_keys',
            default: '',
        },
        {
            text: 'FORMAT',
            field: 'FORMAT',
            note: 'options [i=icon,t=text][l=lo temp][h=high temp][w=weekday][u=temp unit]',
            default: 't ',
        },
        {
            text: 'UNITS',
            field: 'UNITS',
            note: '[f=farenheit...]',
            default: 'f',
        },
        {
            text: 'DAYS',
            field: 'DAYS',
            note: 'range [1,7]',
            default: '1',
        }
    ];
    try {
        for (var _b = __values(Object.values(questions)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var q = _c.value;
            var formatted = q.text + " [" + q.note + "] (default: " + q.default + "): ";
            var answer = readline_sync_1.default.question(formatted).trim() || q.default;
            configValues[q.field] = answer;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return configValues;
}
exports.default = configure;
