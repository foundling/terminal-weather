export type Description = {
  text: string;
  icon?: string;
};

export type EmojiMap = {
  [ k: string ]: Description;
};

// TODO: colorize text. rain=blue, snow=white
const emojiMap:EmojiMap = {
  Thunderstorm: { 
    text: 'tstorm',
    icon: '⛈'
  },
  Drizzle: {
    text: 'drizzle',
    icon: '🌧',
  },
  Rain: {
    text: 'rain',
    icon: '🌧' ,
  },
  Snow: { 
    text: 'snow',
    icon: '❄️'
  },
  Mist: {
    text: 'mist',
    icon: '🌫',
  },
  Smoke: {
    text: 'smoke'
  },
  Haze: {
    text: 'haze'
  },
  Dust: {
    text: 'dust',
  },
  Fog: {
    text: 'fog',
    icon: '🌫'
  },
  Sand: {
    text: 'sand'
  },
  Ash: {
    text: 'ash'
  },
  Squall: {
    icon: '🌬',
    text: 'squall',
  },
  Tornado: {
    icon:'🌪',
    text: 'tornado'
  },
  Clear: {
    icon: '🌞', 
    text: 'clear'
  },
  Clouds: {
    icon: '🌥' ,
    text: 'clouds'
  }
};

export default emojiMap;
