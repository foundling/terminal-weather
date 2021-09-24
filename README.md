# Terminal Weather

A minimal and configurable command-line tool for displaying the weather in your location, optimized for re-rendering in your terminal prompt. If you hit enter a bunch of times in your terminal, if you have `terminal-weather` embedded in your prompt, you will get accurate weather with the occasional micro-delay or error message.

🌥 🌧 🌞 🌥
[![asciicast](https://asciinema.org/a/437855.svg)](https://asciinema.org/a/437855)


## Requirements

+ An [openweathermap.org](http://openweathermap.org) API key. You can generate one [here](https://home.openweathermap.org/api_keys), but you will need to register with OpenWeather first.
+ Node 8 and up

## Installation

+ Run `npm install -g terminal-weather`
+ Run `terminal-weather configure` to set it up. You will be prompted for your open weathermap.org API key as well the default temperature unit.

## Which Services It Uses

`Terminal-weather` uses the following APIs:

+ [ip-api.com](http://ip-api.com) to map your ip to a location.
+ [openweathermap.org](http://openweathermap.org) to retrieve the current weather for your location.

## Caching and Module loading

+ `terminal-weather` sets the default `CACHE_INTERVAL` to 10 minutes for regular use because this is the update frequency of Open Weather's API. The rest of the time, `terminal-weather` prints a cached value.  Unless you pass an `-n` or `--invalidate-cache` flag. This is especially useful if you want the weather in your terminal prompt. 

+ Speaking of weather in your terminal prompt, `terminal-weather` loads in a minimal and progressive way. Because the creator wants the weather in his terminal, but doesn't want a janky experience, there are `-p` and `--prompt` flags that circumvent the standard module loading procedure and fetched cached data. Only the modules required for that use-case are loaded.  In case of a cache expiration, the additional modules required to retreive new weather data are loaded. This provides a near-seamless terminal experience when embedding terminal-weather in your prompt (see below). 

## Usage

````bash

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
      CACHED_WEATHER=🌥  🌧  🌞  🌥
      VERSION=1.0.0

````

Note: I haven't had the time to find a good arg parsing library for typescript, so currently the argument parsing isn't great.  For now, pass one argument or option at a time :(

## Configuration

+ Run `terminal-weather configure` and give `terminal-weather` the values it needs to store so it can continually query the api.

### Getting `terminal-weather` into your terminal prompt

If you want to include terminal-weather in your bash prompt, there are a couple things you need to do:

1. Add the following lines to your `~/.bashrc` file:

        # a function to insert the terminal-weather bash fn inside the PS1 variable
        set_bash_prompt() {
            PS1="$(terminal-weather -p)\u@[\h]$ $(history -n)"
        }

        # include above fn in prompt command variable so the prompt is reset each time it is rendered
        PROMPT_COMMAND="set_bash_prompt; $PROMPT_COMMAND"

## Tips

If you update your display, units and/or format string, the update will not be visible until the cache expires. To make the effects immediately visible, pass the `-n` flag to explicitly invalidate the cache at the same time. E.g.: 

    terminal-weather -n
    terminal-weather --invalidate-cache

### Removing `terminal-weather` 

+ First (definitely do this first!!!), remove terminal weather call from the bash prompt in your `~/.bashrc` file 
+ Then run `npm uninstall -g terminal-weather`.
