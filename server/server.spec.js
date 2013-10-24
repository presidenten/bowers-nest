var server = require('./');
var sqlite3 = require('../node_modules/sqlite3/lib/sqlite3').verbose();
var request = require('supertest');

var response = {};
var req = {};
var res = {};

describe('Package manager DB handling', function () {
    it('Opens a database connection and initializes with packages', function () {
        packageManager.openDB(':memory:');
        packageManager.initDB();
        var errorMsg = '';
        var result = '';
        db.serialize(function () {
            db.get('SELECT name FROM sqlite_master WHERE type = "table"', function (err, row) {
                errorMsg = err;
                result = row;
            });
        });
        expect(err).toBeFalsy();
        expect(result === 'packages');
    });
});
/*
describe('Bower Components rest API', function () {
    beforeEach(function () {
        packageManager.openDB(':memory:');
        db.run('DROP TABLE packages');
        packageManager.initDB();

        res = {
            statusCode: 200,
            send: function (msg) {
                response = msg
            }
        };
        req = {
            body: {
                name: ''
            },
            params: {
                name: ''
            }
        };
    });

    var executeWithTestData = function (callback) {
        for (var i = 0; i < 3; i++) {
            var req = {
                body: {
                    name: 'test' + i,
                    url: 'http://test' + i + '.git'
                }
            };

            packageManager.addPackage(req, {});
        }
        callback();
    };

    it('It is possible to add a package', function () {
        req = {
            body: {
                name: 'test',
                url: 'http://test.git'
            }
        };

        packageManager.addPackage(req, res);

        db.get('SELECT * FROM packages', function (req, row) {
            expect(row).toBeDefined();
            expect(row.length).toBe(1);
            expect(row).toBe({
                id: 1,
                name: 'test',
                url: 'http://test.git'
            });
        });
    });

    it('Posting gives 400 if name or url is missing', function () {
        res = packageManager.addPackage(req, res);
        expect(res.statusCode).toBe(400);
    });

    it('Is possible to get a list of all packages', function () {
        executeWithTestData(function(){
            res = packageManager.getAll(req, res);
            console.log(response);
            expect(response.length).toBe(3);
        });
    });

    it('Is possible to get a specific package by name', function () {
        executeWithTestData(function(){
            req.params.name = 'test2';
            packageManager.getByName(req, res);
            db.get('SELECT * FROM packages', function (req, row) {
                console.log('tjohooooooooooooooooooo');
                console.log(row);
            });
            expect(response).toBe({
                id: 2,
                name: 'test2',
                url: 'http://test2.git'
            });
        });
    });

    it('It gives 404 when no package by the name is found', function () {
        var res = {},
            req = {};
        executeWithTestData();

        req.params.name = 'testitest';
        packageManager.getByName(req, res);

        expect(res.statusCode).toBe(404);
        expect(res.body).toBe(packageManager.template404);
    });

    it('Matches alla packages containing a string when searching', function () {
        var res = {},
            req = {};

        req = {
            body: {
                name: 'ab1',
                url: ''
            }
        };
        packageManager.addPackage(req, res);
        req = {
            body: {
                name: 'ab2',
                url: ''
            }
        };
        packageManager.addPackage(req, res);
        req = {
            body: {
                name: 'bc1',
                url: ''
            }
        };
        packageManager.addPackage(req, res);

        req = { params: {searchTerm: 'ab'} };
        packageManager.searchByName(req, res);

        expect(res.length).toBe(2);
        expect(res[0].name).toBe('ab1');
        expect(res[1].name).toBe('ab2');
    });

    it('Search gives 404 when no package by the name is found', function () {
        var res = {},
            req = {};

        req = {
            body: {
                name: 'ab1',
                url: ''
            }
        };
        packageManager.addPackage(req, res);

        req = { params: {searchTerm: 'ab' }};
        packageManager.searchByName(req, res);

        expect(res.statusCode).toBe(404);
        expect(res.body).toBe(packageManager.template404);
    });


    it('It is possible to delete a package', function () {
        var res = {},
            req = {
                body: {
                    name: 'test',
                    url: 'http://test.git'
                }
            };

        packageManager.addPackage(req, res);

        req = { params: {name: 'test'} };
        packageManager.deletePackage(req, res);

        packageManager.getAll(req, res);

        expect(res.length).toBe(0);
    });
});
 */

