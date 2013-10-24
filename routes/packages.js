var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('test.db', function(err){
    if(err){
        console.log('503 - Database error')
    }
    else{
        db.run('CREATE table IF NOT EXISTS components(id integer primary key,' +
               ' name varchar(500), url varchar(500), created_at date);');
    }
});

exports.findAll = function (req, res) {
    db.serialize(function () {
        db.all('SELECT * FROM components', function (err, row) {
            if(err){
                console.log(err);
            }
            else{
                res.send(row);
            }
        });
    });
};

exports.findByName = function (req, res) {
    db.serialize(function () {
        var name = req.params.name;
        console.log('Retrieving bower component: ' + name);

        db.get('SELECT name, url, create_at FROM components WHERE name = $name',
            {
                $name:name
            },
            function (err, row) {
                if(err){
                    console.log(err);
                }
                else{
                    if (row === undefined) {
                        res.send('<h1>404 - Not found</h1>');
                    }
                    else {
                        res.send(row);
                    }
                }
            }
        );
    });
};

exports.addComponent = function (req, res) {
    db.serialize(function () {
        var component = req.body;

        if(!component.hasOwnProperty('name') ||
           !component.hasOwnProperty('url'))
        {
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect.')
        }
        console.log('Adding bower component: ' + JSON.stringify(component));

        db.run('INSERT INTO components ("name", "url", "created_at") VALUES ($name, $url, $date)',
            {
                $name: component.name,
                $url: component.url,
                $date : new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
            },
            function (err, row) {
                if(err){
                    console.log(err);
                }
                res.writeHead(202, { 'Content-Type': 'text/html' });
                res.send(row);
                res.end();
            }
        );
    });
};

exports.deleteComponent = function (req, res) {
    db.serialize(function () {
        var name = req.params.name;
        console.log('Deleting bower component: ' + name);
        db.run('DELETE FROM components WHERE name = $name', {$name: name});
    });
};
