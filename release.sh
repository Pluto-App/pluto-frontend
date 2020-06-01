cp .prod .env
git add .
rm -rf ./node_modules ./build ./dist
npm install
npm run build

docker run --rm \
    --env ELECTRON_CACHE="/root/.cache/electron" \
    --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
    --env GH_TOKEN="d10414f80a2c6f26b471a4c7a2de6d18f8f578b0" \
    -v ${PWD}:/project \
    -v ~/.cache/electron:/root/.cache/electron \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    electronuserland/builder:wine \
    /bin/bash -c "npm run win-release"

docker run --rm -it \
    --env ELECTRON_CACHE="/root/.cache/electron" \
    --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
    --env GH_TOKEN="d10414f80a2c6f26b471a4c7a2de6d18f8f578b0" \
    -v ${PWD}:/project \
    -v ~/.cache/electron:/root/.cache/electron \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    electronuserland/builder \
    /bin/bash -c "npm run mac-release"

docker run --rm \
    --env ELECTRON_CACHE="/root/.cache/electron" \
    --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
    --env GH_TOKEN="d10414f80a2c6f26b471a4c7a2de6d18f8f578b0" \
    -v ${PWD}:/project \
    -v ~/.cache/electron:/root/.cache/electron \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    electronuserland/builder \
    /bin/bash -c "npm run linux-release"
