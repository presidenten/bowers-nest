var sqlite3 = require('sqlite3').verbose();

var dbName = 'nest.db';
var serverLocation = 'ssh://localhost:9000';

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
                dest: 'git_repositories/all_bower_packages.json'
            }
        },
        clean: {
            all: 'git_repositories'
        }
    });

    grunt.registerTask('test', ['jshint', 'jasmine_node']);
    grunt.registerTask('sync', ['clean', 'curl', 'sync_db']);
    grunt.registerTask('default', ['test', 'sync']);

    grunt.registerTask('init_db', 'Sync database to Bower official registry', function(){
        var done = this.async();
        var db = new sqlite3.Database(dbName);
        db.run('CREATE table IF NOT EXISTS packages(id integer primary key, ' +
            'name varchar(500) UNIQUE, url varchar(500) UNIQUE, created_at date);', function(){
            done();
        });
    });

    grunt.registerTask('sync_db', 'Sync database to Bower official registry', function(){
        var done = this.async();
        var bowerDB = grunt.file.readJSON('git_repositories/all_bower_packages.json');
        var db = new sqlite3.Database(dbName);
        var util = require('util');

        db.run('CREATE table IF NOT EXISTS packages(id integer primary key, ' +
            'name varchar(500) UNIQUE, url varchar(500) UNIQUE, created_at date);', function(){

            var count = 1;
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
                            util.print('Syncing with database ' + (100.0 * temp / bowerDB.length).toFixed(2) + '% ' + ' done.\r');
                            if(temp >= bowerDB.length) { // check if all callbacks have been called
                                console.log('');
                                done();
                            }
                        });
                }
            });
        });
    });

    grunt.registerTask('register', function(name){
        var fs = require('fs');
        if(!fs.existsSync('git_repositories/'+name+'.git') && name !== undefined && name !== ''){
            var done = this.async();
            var db = new sqlite3.Database(dbName);

            var cp = require('child_process');
            cp.exec('git init --bare git_repositories/'+name+'.git');

            var url = serverLocation + __dirname +'/git_repositories/'+name+'.git';

            db.run('CREATE table IF NOT EXISTS packages(id integer primary key, ' +
                'name varchar(500) UNIQUE, url varchar(500) UNIQUE, created_at date);', function(){
                db.run('INSERT INTO packages ("name", "url", "created_at") VALUES ($name, $url, $date)',
                    {
                        $name: name,
                        $url:  url,
                        $date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                    }, function(err, row){
                        console.log('\nModule \"'+name+'\" is registered.\n');
                        console.log('Run these commands in your package directory to finalize the process: \n');
                        console.log('  git remote add bower '+url);
                        console.log('  git push bower master');
                        done();
                    });
            });
        }
        else{
            if(name === undefined || name === ''){
                console.log('\nModule name can\'t be undefined.');
            }
            else{
                console.log('\nModule \"'+name+'\" already exists.');
            }
            console.log('\nShutting down...\n');
        }
    });

    grunt.registerTask('unregister', function(name){
        if(name !== undefined && name !== ''){
            var done = this.async();
            var db = new sqlite3.Database(dbName);
            var cp = require('child_process');

            db.run('CREATE table IF NOT EXISTS packages(id integer primary key, ' +
                'name varchar(500) UNIQUE, url varchar(500) UNIQUE, created_at date);', function(){
                db.run('DELETE FROM packages WHERE name = $name', {$name: name}, function(err, row){
                        console.log('\nModule \"'+name+'\" is unregistered.\n');
                        console.log('Dont forget to remove the git_repository.');
                        done();
                    });
            });
        }
        else{
            console.log('\nModule name can\'t be undefined.');
            console.log('\nShutting down...\n');
        }
    });
};