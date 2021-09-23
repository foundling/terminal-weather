#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var os_1 = require("os");
var path_1 = __importDefault(require("path"));
var config_1 = __importDefault(require("./config"));
var commands_1 = require("./commands");
var parse_args_1 = __importDefault(require("./parse-args"));
var log_1 = __importDefault(require("./log"));
var version_json_1 = require("./version.json");
function run(argv) {
    return __awaiter(this, void 0, void 0, function () {
        var parsedArgs, configPath, runArgs, invalidateCache, showHelp, showInfo, promptMode, configureApp, version, config, weatherString;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parsedArgs = (0, parse_args_1.default)(argv);
                    configPath = path_1.default.join((0, os_1.homedir)(), '.twconfig');
                    runArgs = __assign(__assign({}, parsedArgs), { configPath: configPath, version: version_json_1.version });
                    invalidateCache = runArgs.invalidateCache, showHelp = runArgs.showHelp, showInfo = runArgs.showInfo, promptMode = runArgs.promptMode, configureApp = runArgs.configureApp, version = runArgs.version;
                    config = new config_1.default(configPath, version);
                    if (showHelp) {
                        (0, commands_1.help)();
                        process.exit(0);
                    }
                    if (!showInfo) return [3 /*break*/, 2];
                    return [4 /*yield*/, config.fromFile(configPath)];
                case 1:
                    _a.sent();
                    (0, commands_1.info)(config);
                    process.exit(0);
                    _a.label = 2;
                case 2:
                    if (!configureApp) return [3 /*break*/, 4];
                    config.fromObject((0, commands_1.configure)());
                    return [4 /*yield*/, config.save()];
                case 3:
                    _a.sent();
                    process.exit(0);
                    _a.label = 4;
                case 4: return [4 /*yield*/, config.fromFile(configPath)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, (0, commands_1.fetchWeather)({ config: config, invalidateCache: invalidateCache })];
                case 6:
                    weatherString = _a.sent();
                    return [2 /*return*/, promptMode ? weatherString : weatherString + '\n'];
            }
        });
    });
}
exports.default = run;
if (require.main === module) {
    // call run if we're being executed directly
    // https://nodejs.org/dist/latest-v16.x/docs/api/all.html#modules_accessing_the_main_module
    run(process.argv.slice(2)).then(function (weatherString) {
        process.stdout.write(weatherString);
        process.exit(0);
    }).catch(function (e) {
        (0, log_1.default)(e, 'Error');
        process.exit(1);
    });
}
