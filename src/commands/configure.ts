import { IConfig } from '../config';
import rls from 'readline-sync';
import chalk from 'chalk';
import help from './help';

type Question = {
  text: string;
  note: string;
  field: string;
  default: string;
};

export default function configure(): Partial<IConfig> {

  const configValues:Partial<IConfig> = {
    'APPID': '',
    'FORMAT': 't ',
    'UNITS': 'f',
    'DAYS': '1',
    'CACHE_INTERVAL_MINUTES': '10',
  };

  const questions: Question[] = [
    {
      text: 'API KEY',
      field: 'APPID',
      note: '', 
      default: '',
    },
    {
      text: 'FORMAT',
      field: 'FORMAT',
      note: 'i=icon, t=text, l=lo temp, h=high temp, w=weekday, u=temp unit (f,c,m)',
      default: 't ',
    },
    {
      text: 'UNITS',
      field: 'UNITS',
      note: '[f=farenheit...]',
      default: 'f',
    }
  ,
    {
      text: 'DAYS',
      field: 'DAYS',
      note: 'range [1,7]',
      default: '1',
    }
  ];


  const configureMsg = `
  Let's add an API key and configure terminal-weather's appearance.
  Run terminal-weather --help for more information...
  `
  console.log(chalk.blue(configureMsg));
  help();

  for (const q of Object.values(questions)) {

    const formatted = `${chalk.underline.white(q.text)} ${q.note ? '[ ' + q.note + ' ]' : ''} (${chalk.blue('default')}: ${q.default || 'N/A'}): `;
    const answer = rls.question(formatted).trim() || q.default;

    configValues[q.field] = answer;

  }

  return configValues;

}
