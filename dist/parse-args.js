"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inArgs = void 0;
function inArgs(tokens, args) {
    return tokens.some(function (t) { return args.includes(t); });
}
exports.inArgs = inArgs;
;
function parseArgs(args) {
    var invalidateCache = inArgs(['-n', '--invalidate-cache'], args);
    var showHelp = inArgs(['-h', '--help'], args);
    var showInfo = inArgs(['info'], args);
    var promptMode = inArgs(['-p', '--prompt'], args);
    var configureApp = inArgs(['configure'], args);
    return {
        invalidateCache: invalidateCache,
        showHelp: showHelp,
        showInfo: showInfo,
        promptMode: promptMode,
        configureApp: configureApp,
    };
}
exports.default = parseArgs;
