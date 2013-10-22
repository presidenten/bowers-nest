var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('bowerdb', server);

db.open(function (err, db) {
    if (!err) {
        console.log("Connected to 'bowerdb' database");
        db.collection('components', {strict: true}, function (err, collection) {
            if (err) {
                console.log("The bower 'components' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

exports.findById = function (req, res) {
    var id = req.params.id;
    console.log('Retrieving bower component: ' + id);
    db.collection('components', function (err, collection) {
        collection.findOne({'_id': new BSON.ObjectID(id)}, function (err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function (req, res) {
    db.collection('components', function (err, collection) {
        collection.find().toArray(function (err, items) {
            res.send(items);
        });
    });
};

exports.addComponent = function (req, res) {
    var component = req.body;
    console.log('Adding b owercomponent: ' + JSON.stringify(component));
    db.collection('components', function (err, collection) {
        collection.insert(component, {safe: true}, function (err, result) {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.updateComponent = function (req, res) {
    var id = req.params.id;
    var component = req.body;
    console.log('Updating bower component: ' + id);
    console.log(JSON.stringify(component));
    db.collection('components', function (err, collection) {
        collection.update({'_id': new BSON.ObjectID(id)}, component, {safe: true}, function (err, result) {
            if (err) {
                console.log('Error updating component: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(component);
            }
        });
    });
};

exports.deleteComponent = function (req, res) {
    var id = req.params.id;
    console.log('Deleting bower component: ' + id);
    db.collection('components', function (err, collection) {
        collection.remove({'_id': new BSON.ObjectID(id)}, {safe: true}, function (err, result) {
            if (err) {
                res.send({'error': 'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};

var populateDB = function () {
    var components = [
        {
            name: "test-component",
            url: "127.0.01",
            created_at: new Date()
        }
    ];

    db.collection('components', function (err, collection) {
        collection.insert(components, {safe: true}, function (err, result) {
        });
    });
};