import chalk from 'chalk';

type LogLevel = 'Info' | 'Warn' | 'Error'; 

const colorFns = {
  'Info': chalk.blue,
  'Warn': chalk.keyword('orange'),
  'Error': chalk.keyword('orange')
};

export default function log(message:string, logLevel:LogLevel = 'Info') {

  const colorFn = colorFns[logLevel]; 
  const colorizedErrorLevel = colorFn(`[${logLevel}]`);

  console.log(`${colorizedErrorLevel} ${message}`);

}
