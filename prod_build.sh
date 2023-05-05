#!/bin/bash

echo "Applying prod config references"
find ./src -type f -name '*.js*' -exec sed -i '' "s,'/public/config.js','/config.js'," {} \;

echo "Building the project"
npm run build

echo "Restoring dev config references"
find ./src -type f -name '*.js*' -exec sed -i '' "s,'/config.js','/public/config.js'," {} \;
