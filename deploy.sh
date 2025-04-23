echo "Switching to branch master"
git checkout master


echo "Building app.."
npm run build

echo "Deploying files to server..."
scp -r build/* andrei@217.154.63.245:/var/www/217.154.63.245/

echo "Done!"

