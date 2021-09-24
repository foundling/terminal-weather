export default function help() {
  const msg = `
    usage: terminal-weather [ option | command ]

    tw                           gets weather, maybe from cache, maybe from owm
    tw -n, --invalidate-cache    invalidates cache, gets weather
    tw -p, --prompt              gets weather, prints w/ no newline
    tw --help, -h                prints help
    tw info                      prints config values
    tw configure                 configure tw 

    format values:
      i: icon
      t: text
      l: low 
      h: high
      w: weekday
      u: temp units

    example format string: "i l/h u "

    Configuration:

    Your configuration path is fixed at ~/.twconfig. It looks like this:

      APPID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
      UNITS=f
      FORMAT=i
      DAYS=4
      CACHED_AT=1632439018291
      CACHED_WEATHER=🌥 🌧 🌞 🌥 
      VERSION=1.0.0
  `
  console.log(msg);
}
