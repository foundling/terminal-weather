export default function help() {

  const msg = `
    tw                           gets weather, maybe from cache, maybe from owm
    tw -n, --invalidate-cache    invalidates cache, gets weather
    tw -p, --prompt              gets weather, prints w/ no newline
    tw --help, -h                prints help
    tw info                      prints config values
    tw configure                 configure tw 
    tw set config                lets you enter api key and format
    tw get config                lets you enter api key and format
    tw set format <fmt string>   updates your config w/ new format               
    tw get format                prints your format string
    tw set days <int>            sets days in config to int, must be [1,7] 

    format values:
      i: icon
      t: text
      l: low 
      h: high
      w: weekday
      u: temp units

    example format string: "i l/h u"
  `
  console.log(msg);
}

