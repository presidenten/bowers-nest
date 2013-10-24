## Bowers-nest is a Bower registry written for node and express

Written specifically to be able to host private Bower packages

## Getting started
# Install node dependencies

    npm install -g bower grunt-cli
    npm install

# Install bower dependencies

    bower install

# Run tests

    grunt test

# Sync database with official bower repository

    grunt sync

# Run server

    node bowers-nest.js

# Register package with name=unicorn and url=ssh://localhost:9000

    grunt register:'packageName':

# Run tests manually:

    curl http://localhost:9000/packages/
    curl http://localhost:9000/packages/ -v -F 'name=package1' -F 'url=http://repo1.git'
    curl http://localhost:9000/packages/ -v -F 'name=package2' -F 'url=http://repo2.git'
    curl http://localhost:9000/packages/package1
    http://localhost:9000/packages/search/1
    curl -v -X DELETE localhost:9000/packages/package1
    curl http://localhost:9000/packages/
