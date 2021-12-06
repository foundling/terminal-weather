"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var colorFns = {
    'Info': chalk_1.default.blue,
    'Warn': chalk_1.default.keyword('orange'),
    'Error': chalk_1.default.keyword('orange')
};
function log(message, logLevel) {
    if (logLevel === void 0) { logLevel = 'Info'; }
    var colorFn = colorFns[logLevel];
    var colorizedErrorLevel = colorFn("[".concat(logLevel, "]"));
    console.log("".concat(colorizedErrorLevel, " ").concat(message));
}
exports.default = log;
