#!/bin/bash
cd "$(dirname "$0")"
git pull
npm i
npm run build:css
npm run start >pedia.log 2>&1 &
