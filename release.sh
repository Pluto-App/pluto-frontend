
## Install, Build and Release for Linux and Windows. 
## Don't run on mac. 

cp .prod .env
sudo rm -rf ./node_modules ./build ./dist
npm install
npm run build

docker run --rm \
    --env ELECTRON_CACHE="/root/.cache/electron" \
    --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
    --env GH_TOKEN="f85513d588f289a498b77d2b2f850cdad99e661f" \
    -v ${PWD}:/project \
    -v ~/.cache/electron:/root/.cache/electron \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    electronuserland/builder:wine \
    /bin/bash -c "npm run win-release"

docker run --rm \
    --env ELECTRON_CACHE="/root/.cache/electron" \
    --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
    --env GH_TOKEN="f85513d588f289a498b77d2b2f850cdad99e661f" \
    -v ${PWD}:/project \
    -v ~/.cache/electron:/root/.cache/electron \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    electronuserland/builder \
    /bin/bash -c "npm run linux-release"
