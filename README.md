# Terminal Weather

A minimal, configurable command-line tool for displaying the current weather in your location, optimized for re-rendering in your terminal prompt.

## Requirements

+ An [openweathermap.org](http://openweathermap.org) API key
+ NodeJS v7.0 and npm

## Installation

+ Run `npm install -g terminal-weather`
+ Run `terminal-weather configure` to set it up. You will be prompted for your open weathermap.org API key as well the default temperature unit.

## Which Services It Uses

`Terminal-weather` uses the following APIs:

+ [ip-api.com](http://ip-api.com) to map your ip to a location.
+ [openweathermap.org](http://openweathermap.org) to retrieve the current weather for your location.

## Caching and Module loading

+ `terminal-weather` adheres to [openweathermap.org](http://openweathermap.org)'s requested limit of 1 http call per ten-minute interval. The rest of the time it prints a cached value. 
+ `terminal-weather` loads in a progressive way. Because the most frequent case is retrieving cached data, only the modules required for that are loaded.  In case of a cache expiration, the additional modules required to retreive new weather data are loaded. The point is to maintain a seamless terminal experience when embedding terminal-weather in your prompt (see below). 

## Usage

````bash

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

````
## Configuration

+ Run `terminal-weather configure` and give `terminal-weather` the values it needs to store so it can continually query the api.
+ This configuration file is stored in the application's root directory (run `terminal-weather show config` to see the location of this file).

### Getting `terminal-weather` into your terminal prompt

If you want to include terminal-weather in your bash prompt, there are a couple things you need to do:

1. Make sure that /usr/local/bin is in your $PATH so that your shell can locate it. If after installing terminal weather, you can't run `terminal-weather` from your terminal, you may have not installed it globally (using the `-g` flag). 

2. Add the following lines to your ~/.bashrc file:

        # a function to insert the terminal-weather bash fn inside the PS1 variable
        set_bash_prompt() {
            PS1="$(terminal-weather -p)\u@[\h]$ $(history -n)"
        }

        # include above fn in prompt command variable so the prompt is reset each time it is rendered
        PROMPT_COMMAND="set_bash_prompt; $PROMPT_COMMAND"

## Tips

If you update your display, units and/or format string, the update will not be visible until the cache expires. To make the effects immediately visible, pass the `-n` flag to explicitly invalidate the cache at the same time. E.g.: 

    terminal-weather -n --display=icon
    terminal-weather -nd=icon 

### Known Issues

Terminal weather's responsiveness seems to degrade if you source your ~/.bashrc multiple times from within a shell. Try running `exec $SHELL -l`. 

### Removing `terminal-weather` 

+ First (definitely do this first!!!), remove terminal weather call from the bash prompt in your `~/.bashrc` file 
+ run `terminal-weather uninstall`.  This is equivalent to running `npm uninstall -g terminal-weather`.
