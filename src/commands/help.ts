export default function help() {
  const msg = `
    usage: terminal-weather [ option | command ]

    terminal-weather                           gets weather, maybe from cache, maybe from owm
    terminal-weather -n, --invalidate-cache    invalidates cache, gets weather
    terminal-weather -p, --prompt              gets weather, prints w/ no newline
    terminal-weather --help, -h                prints help
    terminal-weather info                      prints config values
    terminal-weather configure                 configure tw

    format values:
      i: icon
      t: text
      l: low 
      h: high
      w: weekday
      u: temp units

    example format string: "i l/h u "

    Configuration:

    Your configuration file can be found at ~/.twconfig. It looks like this:

      APPID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
      UNITS=f
      FORMAT=i
      DAYS=4
      CACHE_INTERVAL_MINUTES=10
      VERSION=1.0.0
  `
  console.log(msg);
}
