## Install, Build and Release for Linux and Windows.
## Don't run on mac. 

## Using Docker Images. 
## Host to AWS/Heroku Later on Production Level CD/CI.

sudo rm -rf ./node_modules ./build ./dist
npm install
npm run build

## git push origin :refs/tags/v1.0.0
## git tag -d v1.0.0

docker run --rm \
    --env GH_TOKEN="5400f5b75df37dfde7d3c5dd1dced206ede00bdd" \
    --env GITHUB_TOKEN="5400f5b75df37dfde7d3c5dd1dced206ede00bdd" \
    --env ELECTRON_CACHE="/root/.cache/electron" \
    --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
    -v ${PWD}:/project \
    -v ~/.cache/electron:/root/.cache/electron \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    electronuserland/builder:wine \
    /bin/bash -c "npm run win"

docker run --rm \
    --env GH_TOKEN="5400f5b75df37dfde7d3c5dd1dced206ede00bdd" \
    --env GITHUB_TOKEN="5400f5b75df37dfde7d3c5dd1dced206ede00bdd" \
    --env ELECTRON_CACHE="/root/.cache/electron" \
    --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
    -v ${PWD}:/project \
    -v ~/.cache/electron:/root/.cache/electron \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    electronuserland/builder \
    /bin/bash -c "npm run linux"
