echo "Running database"
docker compose up -d
echo "Installing dependencies"
yarn

sleep 5

echo "dependencies installed"

echo "Starting dev server"
yarn start