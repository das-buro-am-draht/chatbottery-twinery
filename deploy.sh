#!/bin/bash

rm -rf dist/web/*

npm run build:web

if [[ "$BRANCH" == "master" ]]; then
  mkdir -p dist/web/editor/
  mv -f dist/web/* dist/web/editor/
  cp -rf src/construction/* dist/web/ 
fi

node ftp.js