var express = require('express'),
    sqlite3 = require('sqlite3').verbose();


var app = express();
var db = {};
var template404 = '<h1>404 - Not found</h1>';
var template400 = 'Error 400: Post syntax incorrect.';

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

var initDB = function(dbName){
    db = new sqlite3.Database(dbName, function (err) {
        if (err) {
            console.log('503 - Database error');
        }
    });
    db.serialize(function () {
        db.run('CREATE table IF NOT EXISTS packages(id integer primary key,' +
            ' name varchar(500), url varchar(500), created_at date);');
    });
};

app.configure(function () {
    initDB('bowersNest.db');
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/', function(req, res){
    res.send('Welcome to Bowers-nest, your private Bower Registry');
});


app.get('/packages', function(req, res){
    db.serialize(function () {
        db.all('SELECT * FROM packages', function (err, row) {
            res.send(row);
            res.response = row;
        });
    });
});

app.get('/packages/:name', function(req, res){
    db.serialize(function () {
        var name = req.params.name;
        console.log('Retrieving bower component: ' + name);

        db.get('SELECT name, url, created_at FROM packages WHERE name = $name', { $name: name }, function (err, row) {
                if (row === undefined) {
                    res.statusCode = 404;
                    res.send(template404);
                    return res;
                }
                else {
                    res.send(row);
                    res.response = row;
                    return res;
                }
            }
        );
    });
});

app.get('/packages/search/:searchTerm', function(req, res){
    db.serialize(function () {
        console.log('Searching packages with name containing ' + req.params.searchTerm);
        db.all('SELECT * FROM packages WHERE name LIKE "%' + req.params.searchTerm + '%"', function (err, row) {
            if (row === undefined) {
                res.statusCode = 404;
                res.send(template404);
            }
            else {
                res.send(row);
            }
        });
        return res;
    });
});

app.post('/packages', function(req, res){
    db.serialize(function () {
        var component = req.body;

        if (!component.hasOwnProperty('name') || !component.hasOwnProperty('url')) {
            res.statusCode = 400;
            res.send(template404);
        }
        else{
            console.log('Adding bower component: ' + JSON.stringify(component));
            db.run('INSERT INTO packages ("name", "url", "created_at") VALUES ($name, $url, $date)',
                {
                    $name: component.name,
                    $url: component.url,
                    $date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                },
                function (err, row) {
                    if (err) {
                        console.log(err);
                    }
                    res.writeHead(202, { 'Content-Type': 'text/html' });
                    res.send(row);
                    res.end();
                }
            );
        }
    });
});

app.delete('/packages/:name', function(req, res){
    db.serialize(function () {
        var name = req.params.name;
        console.log('Deleting bower component: ' + name);
        db.run('DELETE FROM packages WHERE name = $name', {$name: name});
    });
});

