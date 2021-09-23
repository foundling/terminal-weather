export default function help() {

  const msg = `
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
  `
  console.log(msg);
}

