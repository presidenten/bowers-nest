var server = require('./server');
var sqlite3 = require('../node_modules/sqlite3/lib/sqlite3').verbose();
var request = require('supertest');

var response = {},
    db = {},
    error = '',
    result = '',
    done = 0;

describe('Package manager DB handling', function () {
    it('Opens a database connection and initializes with table packages', function () {
        db = server.openDB(':memory:');
        server.initDB(db, function () {
            done++;
        });
        waitsFor(function () {return done > 0;}, 50);
        runs(function () {
            db.get('SELECT name FROM sqlite_master WHERE type = "table"', function (err, row) {
                error = err;
                result = row;
                done++;
            });
            waitsFor(function () {return done > 1;}, 50);
            runs(function () {
                expect(error).toBeNull();
                expect(result.name).toBe('packages');
            });
        });
    });
});

describe('Bower Components rest API', function () {
    beforeEach(function () {
        done = 0;
        db = server.openDB(':memory:');
        db.run('DROP TABLE packages', function(){
            done++;
        });
        waitsFor(function(){return done >0;}, 50);
        runs(function(){
        server.initDB(db, function () {
            done++;
        });

        waitsFor(function () {return done > 1;}, 50);
        runs(function () {
            done = 0;
            error = '';
            result = '';
        });
        });
    });

    var executeWithTestData = function (callback) {
        for (var i = 1; i < 4; i++) {
            db.run('INSERT INTO packages (name, url, created_at) ' +
                   'VALUES ("test'+i+'", "http://test'+i+'.git", datetime())', function (err, res) {
                    done++;
                });
        }

        waitsFor(function () {return done > 0;}, 50);
        runs(function () {
            done = 0;
            if (typeof(callback) === 'function') {
                callback();
            }
        });
    };

    it('Is possible to get a list of all packages', function () {
        executeWithTestData(function () {
            request(server.app)
                .get('/packages')
                .expect('Content-Type', /json/)
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    error = err;
                    result = res;
                    done++;
                });

            waitsFor(function () {return done > 0;}, 50);
            runs(function () {
                expect(result.body.length).toBe(3);
            });
        });
    });

    it('Is possible to get a specific package by name', function () {
        executeWithTestData(function () {
            request(server.app)
                .get('/packages/test2')
                .expect('Content-Type', /json/)
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    error = err;
                    result = res;
                    done++;
                });

            waitsFor(function () {return done > 0;}, 50);
            runs(function () {
                expect(result.body.name).toBe('test2');
                expect(result.body.url).toBe('http://test2.git');
            });
        });
    });

    it('It gives 404 when no package by the name is found', function () {
        request(server.app)
            .get('/packages/testitest')
            .expect('Content-Type', /json/)
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                error = err;
                result = res;
                done++;
            });

        waitsFor(function () {return done > 0;}, 50);
        runs(function () {
            expect(result.statusCode).toBe(404);
            expect(result.text).toBe(server.template404);
        });
    });

    it('Matches all packages containing a string when searching', function () {
        db.run('INSERT INTO packages (name, url, created_at) ' +
            'VALUES ("ab1", "1", datetime())', function (err, res) {
            done++;
        });
        db.run('INSERT INTO packages (name, url, created_at) ' +
            'VALUES ("ab2", "2", datetime())', function (err, res) {
            done++;
        });
        db.run('INSERT INTO packages (name, url, created_at) ' +
            'VALUES ("bc1", "3", datetime())', function (err, res) {
            done++;
        });

        waitsFor(function () {return done > 2;}, 50);
        runs(function () {
            request(server.app)
                .get('/packages/search/ab')
                .expect('Content-Type', /json/)
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    error = err;
                    result = res;
                    done++;
                });

            waitsFor(function () {return done > 3;}, 50);
            runs(function () {
                expect(result.body.length).toBe(2);
                expect(result.body[0].name).toContain('ab');
                expect(result.body[1].name).toContain('ab');
            });
        });
    });

    it('Search gives empty array when no package by the name is found', function () {
        db.run('INSERT INTO packages (name, url, created_at) ' +
            'VALUES ("ab1", "1", datetime())', function (err, res) {
            done++;
        });

        waitsFor(function () {return done > 0;}, 50);
        runs(function () {
            request(server.app)
                .get('/packages/search/test')
                .expect('Content-Type', /json/)
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    error = err;
                    result = res;
                    done++;
                });

            waitsFor(function () {return done > 1;}, 50);
            runs(function () {
                expect(result.body.length).toBe(0);
            });
        });
    });

    it('It is possible to add a package', function () {
        request(server.app)
            .post('/packages')
            .send({name: 'test', url: 'http://test.git'})
            .set('Accept', 'application/json')
            .end(function (err, res) {
                done++;
            });

        waitsFor(function () {return done > 0;}, 50);
        runs(function () {
            db.get('SELECT id, name, url FROM packages', function (err, row) {
                error = err;
                result = row;
                done++;
            });

            waitsFor(function () {return done > 1;}, 50);
            runs(function () {
                expect(error).toBeNull();
                expect(result.id).toBe(1);
                expect(result.name).toBe('test');
                expect(result.url).toBe('http://test.git');
            });
        });
    });

    it('Posting gives 400 if name or url is missing', function () {
        request(server.app)
            .post('/packages')
            .send({name: 'test'})
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                error = err;
                result = res;
                done++;
            });

        waitsFor(function () {return done > 0;}, 50);
        runs(function () {
            expect(result.statusCode).toBe(400);
            expect(result.text).toBe(server.template400);
        });
    });

    it('Posting gives 406 if name is not unique', function () {
        request(server.app)
            .post('/packages')
            .send({name: 'test', url: 'http://test1.git'})
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                error = err;
                result = res;
                done++;
            });
        request(server.app)
            .post('/packages')
            .send({name: 'test', url: 'http://test2.git'})
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                error = err;
                result = res;
                done++;
            });

        waitsFor(function () {return done > 1;}, 50);
        runs(function () {
            expect(result.statusCode).toBe(406);
            expect(result.text).toBe(server.template406);
        });
    });

    it('Posting gives 406 if url is not unique', function () {
        request(server.app)
            .post('/packages')
            .send({name: 'test1', url: 'http://test.git'})
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                error = err;
                result = res;
                done++;
            });
        request(server.app)
            .post('/packages')
            .send({name: 'test2', url: 'http://test.git'})
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                error = err;
                result = res;
                done++;
            });

        waitsFor(function () {return done > 1;}, 50);
        runs(function () {
            expect(result.statusCode).toBe(406);
            expect(result.text).toBe(server.template406);
        });
    });

    it('It is possible to delete a package', function () {
        db.run('INSERT INTO packages (name, url, created_at) ' +
            'VALUES ("test1", "1", datetime())', function (err, res) {
            done++;
        });
        waitsFor(function () {return done > 0;}, 50);
        runs(function () {
            request(server.app)
                .del('/packages/test1')
                .end(function(res){
                });

            waits(20);
            runs(function(){
                db.get('SELECT id, name, url FROM packages', function (err, row) {
                    error = err;
                    result = row;
                    done++;
                });

                waitsFor(function () {return done > 1;}, 50);
                runs(function () {
                    expect(error).toBeNull();
                    expect(result).toBeUndefined();
                });
            });
        });
    });
});
