export type ParsedArgs = {
  'invalidateCache': boolean;
  'showHelp': boolean;
  'showInfo': boolean;
  'promptMode': boolean;
  'configureApp': boolean;
};

export function inArgs(tokens: string[], args: string[]):boolean {
  return tokens.some(t => args.includes(t)); 
};

export default function parseArgs(args: string[]):ParsedArgs {

  const invalidateCache = inArgs(['-n','--invalidate-cache'], args);
  const showHelp = inArgs(['-h', '--help'], args);
  const showInfo = inArgs(['info'], args);
  const promptMode = inArgs(['-p','--prompt'], args);
  const configureApp = inArgs(['configure'], args);

  return {
    invalidateCache,
    showHelp,
    showInfo,
    promptMode,
    configureApp,
  };

}
