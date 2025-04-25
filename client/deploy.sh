#!/bin/bash

echo "Switching to branch master"
git checkout master


echo "Building app.."
npm run build

echo "Deploying files to server..."
scp -r build/* andrei@13.41.184.180:/var/www/13.41.184.180/

echo "Done!"

