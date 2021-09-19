import { IConfig } from '../config';
import rls from 'readline-sync';

type Question = {
  text: string;
  note: string;
  field: string;
  default: string;
};

export default function configure(): Partial<IConfig> {

  // this should be a partial of Config type
  const configValues:Partial<IConfig> = {
    'APPID': '',
    'FORMAT': 't ',
    'UNITS': 'f',
    'DAYS': '1',
  };

  const questions: Question[] = [
    {
      text: 'API KEY',
      field: 'APPID',
      note: 'generated at https://home.openweathermap.org/api_keys', 
      default: '',
    },
    {
      text: 'FORMAT',
      field: 'FORMAT',
      note: 'options [i=icon,t=text][l=lo temp][h=high temp][w=weekday][u=temp unit]',
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


  for (const q of Object.values(questions)) {

    const formatted = `${q.text} [${q.note}] (default: ${q.default}): `;
    const answer = rls.question(formatted).trim() || q.default;

    configValues[q.field] = answer;

  }

  return configValues;

}
