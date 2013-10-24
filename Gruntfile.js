var sqlite3 = require('sqlite3').verbose();

var dbName = 'nest.db';
var serverLocation = 'ssh://localhost:9000'

module.exports = function ( grunt ) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: [
                'Gruntfile.js',
                'bowers-nest.js',
                'server.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        jasmine_node: {
            projectRoot: 'server',
            src: 'server.js',
            spec: 'server.spec.js',
            requirejs: false,
            forceExit: true
        },
        curl: {
            long: {
                src: 'http://bower.herokuapp.com/packages',
                dest: 'data/all_bower_packages.json'
            }
        },
        clean: {
            all: 'data'
        }
    });

    grunt.registerTask('test', ['jshint', 'jasmine_node']);
    grunt.registerTask('sync', ['clean', 'curl', 'sync_db']);
    grunt.registerTask('default', ['test']);

    grunt.registerTask( 'init_db', 'Sync database to Bower official registry', function(){
        var done = this.async();
        var db = new sqlite3.Database(dbName);
        db.run('CREATE table IF NOT EXISTS packages(id integer primary key, ' +
            'name varchar(500) UNIQUE, url varchar(500) UNIQUE, created_at date);', function(){
            done();
        });
    });

    grunt.registerTask( 'sync_db', 'Sync database to Bower official registry', function(){
        var done = this.async();
        var bowerDB = grunt.file.readJSON('data/all_bower_packages.json');
        var db = new sqlite3.Database(dbName);

        db.run('CREATE table IF NOT EXISTS packages(id integer primary key, ' +
            'name varchar(500) UNIQUE, url varchar(500) UNIQUE, created_at date);', function(){

            var count = 0;
            bowerDB.forEach(function(e){
                count++;
                if(e.name !== ''){
                    var temp = count;
                    db.run('INSERT INTO packages ("name", "url", "created_at") VALUES ($name, $url, $date)',
                        {
                            $name: e.name,
                            $url: e.url,
                            $date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                        }, function(err, row){
                            if(temp == bowerDB.length) { // check if all callbacks have been called
                                done();
                            }
                        });
                }
            });
        });
    });

    grunt.registerTask( 'register', function(name, url){
        var done = this.async();
        var db = new sqlite3.Database(dbName);

        db.run('CREATE table IF NOT EXISTS packages(id integer primary key, ' +
            'name varchar(500) UNIQUE, url varchar(500) UNIQUE, created_at date);', function(){
            db.run('INSERT INTO packages ("name", "url", "created_at") VALUES ($name, $url, $date)',
                {
                    $name: name,
                    $url: serverLocation + url,
                    $date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                }, function(err, row){
                    done();
                });
        });
    });

    grunt.registerTask( 'unregister', function(name){
        var done = this.async();
        var db = new sqlite3.Database(dbName);

        db.run('CREATE table IF NOT EXISTS packages(id integer primary key, ' +
            'name varchar(500) UNIQUE, url varchar(500) UNIQUE, created_at date);', function(){
            db.run('DELETE FROM packages WHERE name = $name', {$name: name}, function(err, row){
                    done();
                });
        });
    });
};