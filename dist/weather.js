"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var node_fetch_1 = __importDefault(require("node-fetch"));
var emojis_1 = __importDefault(require("./emojis"));
var IP_API_URL = 'http://ip-api.com/json';
var OWM_API_BASE = 'https://api.openweathermap.org/data/2.5/onecall';
/* End Open Weather Map JSON Response Types */
function buildSearchParamString(options) {
    return Object.entries(options).reduce(function (qs, entry) {
        var _a = __read(entry, 2), key = _a[0], value = _a[1];
        var segment = "&" + key + "=" + value;
        return qs + segment;
    }, '');
}
function getLocationFromIpAddress() {
    return __awaiter(this, void 0, void 0, function () {
        var result, _a, lat, lon;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, node_fetch_1.default)(IP_API_URL)];
                case 1:
                    result = _b.sent();
                    return [4 /*yield*/, result.json()];
                case 2:
                    _a = (_b.sent()), lat = _a.lat, lon = _a.lon;
                    return [2 /*return*/, { lat: lat, lon: lon }];
            }
        });
    });
}
function getWeatherFromCoords(queryParams) {
    return __awaiter(this, void 0, void 0, function () {
        var qp, weatherEndpoint, response, weather;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qp = buildSearchParamString(queryParams);
                    weatherEndpoint = OWM_API_BASE + "?" + qp;
                    return [4 /*yield*/, (0, node_fetch_1.default)(weatherEndpoint)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    weather = (_a.sent());
                    //note: https://github.com/node-fetch/node-fetch/issues/1262#issuecomment-913597816
                    return [2 /*return*/, weather];
            }
        });
    });
}
var formatWeather = function (_a) {
    var formatString = _a.formatString, units = _a.units, emojiMap = _a.emojiMap;
    return function (weatherData) {
        var e_1, _a;
        var main = weatherData.weather[0].main;
        var _b = emojiMap[main], icon = _b.icon, text = _b.text;
        var _c = weatherData.temp, min = _c.min, max = _c.max;
        var _d = __read([Math.round(max), Math.round(min)], 2), hi = _d[0], lo = _d[1];
        var secondsSinceUnixEpoch = weatherData.dt * 1000;
        var weekday = new Date(secondsSinceUnixEpoch).toLocaleDateString('en-US', { weekday: 'short' });
        var howShort = ['S', 'T'].includes(weekday[0]) ? 2 : 1;
        var weekdayShort = weekday.substr(0, howShort);
        var valueMap = {
            'i': icon + " ",
            't': text || '',
            'l': "" + lo,
            'h': "" + hi,
            'w': weekdayShort,
            'u': "\u00B0" + units,
        };
        var formattedString = '';
        try {
            for (var formatString_1 = __values(formatString), formatString_1_1 = formatString_1.next(); !formatString_1_1.done; formatString_1_1 = formatString_1.next()) {
                var c = formatString_1_1.value;
                formattedString += (c in valueMap ? valueMap[c] : c);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (formatString_1_1 && !formatString_1_1.done && (_a = formatString_1.return)) _a.call(formatString_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return formattedString;
    };
};
function getWeather(config) {
    return __awaiter(this, void 0, void 0, function () {
        var APPID, FORMAT, UNITS, DAYS, _a, lat, lon, days, unitMap, queryParams, daily, formatData;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    APPID = config.get('APPID');
                    FORMAT = config.get('FORMAT');
                    UNITS = config.get('UNITS').toLowerCase();
                    DAYS = config.get('DAYS');
                    return [4 /*yield*/, getLocationFromIpAddress()];
                case 1:
                    _a = _b.sent(), lat = _a.lat, lon = _a.lon;
                    days = parseInt(DAYS);
                    unitMap = new Map([
                        ['k', 'standard'],
                        ['f', 'imperial'],
                        ['c', 'celcius']
                    ]);
                    queryParams = {
                        appid: APPID,
                        exclude: 'minutely,hourly',
                        lat: lat,
                        lon: lon,
                        units: unitMap.get(UNITS)
                    };
                    return [4 /*yield*/, getWeatherFromCoords(queryParams)];
                case 2:
                    daily = (_b.sent()).daily;
                    formatData = {
                        emojiMap: emojis_1.default,
                        formatString: FORMAT,
                        units: UNITS,
                        multiple: days > 1
                    };
                    return [2 /*return*/, daily.slice(0, days).map(formatWeather(formatData)).join(' ')];
            }
        });
    });
}
exports.default = getWeather;
