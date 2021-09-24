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
var fs_1 = require("fs");
var util_1 = require("util");
var log_1 = __importDefault(require("./log"));
var readFilePromise = (0, util_1.promisify)(fs_1.readFile);
var writeFilePromise = (0, util_1.promisify)(fs_1.writeFile);
;
var Config = /** @class */ (function () {
    function Config(filepath, version) {
        this.path = filepath;
        this.version = version;
        this._rawConfig = '';
        this._config = {
            APPID: '',
            UNITS: 'f',
            DAYS: '1',
            FORMAT: 't ',
            CACHED_AT: '',
            CACHED_WEATHER: '',
            VERSION: this.version,
        };
    }
    Config.prototype.validate = function () {
        var errors = [];
        var days = parseInt(this._config['DAYS']);
        var units = this._config['UNITS'];
        var containsExtraEqualSigns = this._rawConfig.split('\n').some(function (line) { return line.split('=').length > 2; });
        if (containsExtraEqualSigns) {
            errors.push("Config file ~/.twconfig Invalid: Each line should have NAME=VALUE format.  Found more than one '=' on a single line.");
        }
        if (!isNaN(days) && days < 1 || days > 8) {
            errors.push("Config value 'DAYS' must be a number between 1 and 8, inclusive. Got " + days + ".");
        }
        if (!['f', 'c', 'k'].includes(units.trim().toLowerCase())) {
            errors.push("Config value 'UNITS' must be 'f', 'c' or 'k'. Got " + units + ".");
        }
        return errors;
    };
    Config.prototype._serialize = function (config) {
        if (config === void 0) { config = this._config; }
        return Object.entries(config).reduce(function (prev, cur) {
            var _a = __read(cur, 2), key = _a[0], value = _a[1];
            return prev += key + "=" + value + "\n";
        }, '');
    };
    Config.prototype.get = function (key) {
        return this._config[key];
    };
    Config.prototype.set = function (key, value) {
        this._config[key] = value;
    };
    Config.prototype.fromObject = function (configValues) {
        var e_1, _a;
        try {
            for (var _b = __values(Object.entries(configValues)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                if (value)
                    this.set(key, value);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // FIXME: missing version here. make async?
    };
    Config.prototype.fromFile = function (filepath) {
        if (filepath === void 0) { filepath = this.path; }
        return __awaiter(this, void 0, void 0, function () {
            var serializedConfig, e_2, lines, defaultConfig, config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serializedConfig = '';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, readFilePromise(filepath, 'utf8')];
                    case 2:
                        serializedConfig = _a.sent();
                        this._rawConfig = serializedConfig;
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        if (e_2.code === 'ENOENT') {
                            (0, log_1.default)('No ~/.twconfig file found. see terminal-weather --help for usage.', 'Error');
                            process.exit(1);
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        lines = serializedConfig.split('\n').filter(Boolean);
                        defaultConfig = {
                            APPID: '',
                            UNITS: 'f',
                            FORMAT: 'i l/hu ',
                            DAYS: '1',
                            CACHED_AT: '',
                            CACHED_WEATHER: '',
                            VERSION: this.version,
                        };
                        config = lines.reduce(function (config, line) {
                            // if a config line has multiple '=', you should throw an config Parsing error.
                            // case: user uses '=' in their format string.
                            // make them escape it? and split the line on [^\]= ?
                            var _a = __read(line.split('='), 2), name = _a[0], value = _a[1];
                            config[name.trim()] = value; // don't trim so user can adjust formatting space via config FORMAT val.
                            return config;
                        }, defaultConfig);
                        this._config = config;
                        return [2 /*return*/];
                }
            });
        });
    };
    Config.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var serializedConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serializedConfig = this._serialize();
                        return [4 /*yield*/, writeFilePromise(this.path, serializedConfig, 'utf8')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Config;
}());
exports.default = Config;
