# Terminal Weather 🌥 🌧 🌞 ❄️

A Node.js CLI for embedding the weather in your terminal prompt.

## Requirements

+ An [openweathermap.org](http://openweathermap.org) API key. You can generate one [here](https://home.openweathermap.org/api_keys), but you will need to register with OpenWeather first.

## Installation

+ Run `npm install -g terminal-weather`
+ Run `terminal-weather configure` prompts you for an open weathermap.org API and a temperature unit.

## Configuration

+ Run `terminal-weather configure` to connect your API key, set the temperature unit and display formatting.

## Usage

````bash

$ terminal-weather -h

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

````

### Getting `terminal-weather` into your terminal prompt

If you want to include terminal-weather in your bash prompt, here is what you need to add to your ~/.bashrc:

        # a function to insert the terminal-weather command into your PS1 variable
        set_bash_prompt() {
            PS1="$(terminal-weather -p)\u@[\h]$ $(history -n)"
        }

        # include above fn in prompt command variable so the prompt is reset each time it is rendered
        PROMPT_COMMAND="set_bash_prompt; $PROMPT_COMMAND"

## 3rd Party Services

`Terminal-weather` uses the following APIs:

+ [ip-api.com](http://ip-api.com) to map your ip to a location.
+ [openweathermap.org](http://openweathermap.org) to retrieve the current weather for your location.

## Caching Behavior

 `terminal-weather` sets the default `CACHE_INTERVAL_MINUTES` to 10 minutes for regular use because this is the update frequency of Open Weather's API. The rest of the time, `terminal-weather` prints a cached value. This is especially useful if you want the weather in your terminal prompt. 

If you update your display, units and/or format string, the update will not be visible until the cache expires. To make the effects immediately visible, pass the `-n` flag to explicitly invalidate the cache at the same time. E.g.: 

    terminal-weather -n
    terminal-weather --invalidate-cache

### Removing `terminal-weather` 

+ First (definitely do this first!!!), remove terminal weather call from the bash prompt in your `~/.bashrc` file 
+ Then run `npm uninstall -g terminal-weather`.
