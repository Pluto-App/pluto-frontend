cp .prod .env
git add .
npm install 
npm run build 
        docker run --rm \
            --env-file <(env | grep -vE '\r|\n' | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
            -v $(pwd):/project/ \
            -v ~/.cache/electron:/root/.cache/electron \
            -v ~/.cache/electron-builder:/root/.cache/electron-builder \
            electronuserland/builder:wine \
            /bin/bash -c "npm run win-release"
rm -rf ./build ./dist 
npm run build
npm run release