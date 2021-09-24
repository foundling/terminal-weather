export declare type ParsedArgs = {
    'invalidateCache': boolean;
    'showHelp': boolean;
    'showInfo': boolean;
    'promptMode': boolean;
    'configureApp': boolean;
};
export declare function inArgs(tokens: string[], args: string[]): boolean;
export default function parseArgs(args: string[]): ParsedArgs;
