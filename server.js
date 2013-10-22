var express = require('express'),
    components = require('./routes/components');

var app = express();

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/components', wine.findAll);
app.get('/components/:id', wine.findById);
app.post('/components', wine.addWine);
app.put('/components/:id', wine.updateWine);
app.delete('/components/:id', wine.deleteWine);

app.listen(3000);
console.log('Listening on port 3000');