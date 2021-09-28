#!/bin/bash

cp ~/.twconfig ~/.twconfig-bak
rm ~/.twconfig

npm uninstall -g terminal-weather
npm install -g foundling/terminal-weather

terminal-weather configure
terminal-weather -n
terminal-weather --invalidate-cache
terminal-weather
terminal-weather -h
terminal-weather --help
terminal-weather info

# remove appid see what happens
tail -n +2 ~/.twconfig > ~/.twconfig.save
mv ~/.twconfig.save ~/.twconfig
terminal-weather -n
