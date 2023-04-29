require('dotenv').config('.env');
const express = require('express');
const createError = require('http-errors');
const mongoose = require('mongoose');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');

const indexRouter = require('./router/indexRouter');
const logInRouter = require('./router/logInRouter');
const signUpRouter = require('./router/SignUpRouter');

const app = express();

// Setting up database
mongoose.set('strictQuery', false);

const mongooseDb = process.env.MONGO_URL;

async function main() {
    await mongoose.connect(mongooseDb);
}

main().catch(err => console.log('Mongo connection error'));


// Setting up the view engine
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');


// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(session({ secret: "SuperMan", resave:false, saveUninitialized:true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routers 
app.use('/', indexRouter);
app.use('/log-in', logInRouter);
app.use('/sign-up', signUpRouter);


// Catching 404 and forwarding it to error handler
app.use(function(req,res,next) {1
    next(createError(404));
});

// Error Handler
app.use(function (err,req,res,next) {
        // set locals, only providing error in dev
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') == 'development' ? err : {};

        // render error page
        res.status(err.status || 500);
        res.render('error');
    }
);

module.exports = app;

