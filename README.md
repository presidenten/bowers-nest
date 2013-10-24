## Bowers-nest is a Bower registry written for node and express

Written specifically to be able to host private Bower packages

## Getting started

    npm install

    bower install

# Run tests:

Unit tests with Jasmine

    grunt test

Or Manually:

    curl http://localhost:9000/packages/
    curl http://localhost:9000/packages/ -v -F 'name=package1' -F 'url=http://repo1.git'
    curl http://localhost:9000/packages/ -v -F 'name=package2' -F 'url=http://repo2.git'
    curl http://localhost:9000/packages/package1
    http://localhost:9000/packages/search/1
    curl -v -X DELETE localhost:9000/packages/package1
    curl http://localhost:9000/packages/


# Run server

    node bowers-nest.js