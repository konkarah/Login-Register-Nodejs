const express = require('express');
const session = require('express-session');
const path = require('path');
const pageRouter = require('./routes/pages');
const itemRouter = require('./routes/item');
const app = express();

app.use(express.json());

// for body parser. to collect data that sent from the client.
app.use(express.urlencoded( { extended : true}));


// Serve static files. CSS, Images, JS files ... etc
app.use(express.static(path.join(__dirname, 'public')));


// Template engine. PUG
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// session
app.use(session({
    secret:'youtube_video',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 1000 * 30
    }
}));



// Routers
app.use('/', pageRouter);
app.use('/items', itemRouter);



// Errors => page not found 404
app.use((req, res, next) =>  {
    var err = new Error('Page not found');
    err.status = 404;
    next(err);
})

// Handling errors (send them to the client)
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.message);
});



// Setting up the server
app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000...');
});

app.get('/stuint',(req,res)=> {
    res.sendFile(path.join(__dirname, './interfaces/stuinterface.html'));
})

module.exports = app;