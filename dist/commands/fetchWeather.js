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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var weather_1 = __importDefault(require("../weather"));
var log_1 = __importDefault(require("../log"));
function fetchWeather(options) {
    return __awaiter(this, void 0, void 0, function () {
        var config, _a, invalidateCache, _b, currentTimeMs, existingCache, cachedWeather, cacheInterval, appId, weatherString, msSinceEpochFromCached, deltaMinutes, cacheExpirationDuration, weatherString;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    config = options.config, _a = options.invalidateCache, invalidateCache = _a === void 0 ? false : _a, _b = options.currentTimeMs, currentTimeMs = _b === void 0 ? new Date().getTime() : _b;
                    existingCache = config.get('CACHED_AT');
                    cachedWeather = config.get('CACHED_WEATHER');
                    cacheInterval = config.get('CACHE_INTERVAL_MINUTES');
                    appId = config.get('APPID');
                    if (!appId) {
                        (0, log_1.default)("Missing APPID from your config. Please run 'terminal-weather configure'", 'Error');
                        process.exit(1);
                    }
                    if (!(invalidateCache || existingCache === '')) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, weather_1.default)(config)];
                case 1:
                    weatherString = _c.sent();
                    config.set('CACHED_AT', currentTimeMs.toString());
                    config.set('CACHED_WEATHER', weatherString);
                    return [4 /*yield*/, config.save()];
                case 2:
                    _c.sent();
                    return [2 /*return*/, weatherString];
                case 3:
                    msSinceEpochFromCached = new Date(parseInt(existingCache)).getTime();
                    deltaMinutes = (currentTimeMs - msSinceEpochFromCached) / (1000 * 60);
                    cacheExpirationDuration = Math.max(parseInt(cacheInterval || config.defaults.CACHE_INTERVAL_MINUTES), parseInt(config.defaults.CACHE_INTERVAL_MINUTES));
                    if (!(deltaMinutes > cacheExpirationDuration)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, weather_1.default)(config)];
                case 4:
                    weatherString = _c.sent();
                    config.set('CACHED_AT', currentTimeMs.toString());
                    config.set('CACHED_WEATHER', weatherString);
                    return [4 /*yield*/, config.save()];
                case 5:
                    _c.sent();
                    return [2 /*return*/, weatherString];
                case 6: 
                // cache not expired
                return [2 /*return*/, cachedWeather];
            }
        });
    });
}
exports.default = fetchWeather;
