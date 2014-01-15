var express = require('express'),
    sqlite3 = require('sqlite3').verbose();

var app = express();
exports.app = app;
var db = {};
var template400 = '<h1>Error 400: Post syntax incorrect.</h1>\n';
var template404 = '<h1>404 - Not found</h1>\n';
var template406 = '<h1>Error 406: Not Acceptable. Package name and url must be unique.</h1>\n';
var template503 = '<h1>Error 503: Database error. Please try again</h1>\n';
exports.template400 = template400;
exports.template404 = template404;
exports.template406 = template406;

exports.start = function(port){
    if(port === undefined){
        app.listen(9000);
        console.log('Listening on port 9000');
    }
    else{
        app.listen(port);
        console.log('Listening on port ' + port);
    }
};

var openDB = function(dbName){
    db = new sqlite3.Database(dbName, function (err) {
        if (err) {
            console.log('503 - Database error');
        }
    });
    return db;
};
var initDB = function(db, callback){
    db.run('CREATE table IF NOT EXISTS packages(id integer primary key, ' +
           'name varchar(500) UNIQUE, url varchar(500), created_at date);', function(){
        if(typeof(callback) === 'function'){
            callback();
        }
    });
};
exports.openDB = openDB;
exports.initDB = initDB;

app.configure(function () {
    openDB(require('path').join(__dirname, '..', 'nest.db'));
    initDB(db);
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/', function(req, res){
    res.send('Welcome to Bowers-nest, your private Bower Registry');
});


app.get('/packages', function(req, res){
    db.all('SELECT * FROM packages', function (err, row) {
        res.send(row);
    });
});

app.get('/packages/:name', function(req, res){
    var name = req.params.name;

    db.get('SELECT name, url, created_at FROM packages WHERE name = $name', { $name: name }, function (err, row) {
            if (row === undefined) {
                res.statusCode = 404;
                res.send(template404);
            }
            else {
                res.send(row);
            }
        }
    );
});

app.get('/packages/search/:searchTerm', function(req, res){
    db.all('SELECT * FROM packages WHERE name LIKE "%' + req.params.searchTerm + '%"', function (err, row) {
        res.send(row);
    });
    return res;
});

app.post('/packages', function(req, res){
    var component = req.body;

    if (!component.hasOwnProperty('name') || !component.hasOwnProperty('url')) {
        res.statusCode = 400;
        res.send(template400);
    }
    else{
        db.run('INSERT INTO packages ("name", "url", "created_at") VALUES ($name, $url, $date)',
            {
                $name: component.name,
                $url: component.url,
                $date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
            },
            function (err, row) {
                if (err) {
                    res.statusCode = 406;
                    res.send(template406);
                }
                else{
                    res.writeHead(202, { 'Content-Type': 'text/html' });
                    res.send(row);
                }
            }
        );
    }
});

app.delete('/packages/:name', function(req, res){
    var name = req.params.name;
    db.run('DELETE FROM packages WHERE name = $name', {$name: name}, function(err) {
        if(err) {
            res.statusCode = 503;
            res.send(template503);
        } else {
            res.statusCode = 204;
            res.send("");
        }
    });
});
