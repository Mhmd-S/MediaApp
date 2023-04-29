const asyncHandler = require("express-async-handler");
const passport = require("passport");
const LocalStartegy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const User = require('../models/User');

// Setting up passport js

passport.use(

    new LocalStartegy({
        usernameField: "email"
    },  async (email, password, done) => {
        try{        
            const user = await User.findOne({ email: email });
            
            if(!user) {
                return done(null, false, { message: "Incorrect Email"});
            }
            bcrypt.compare(password, user.password, (err, res) => {
                if(res) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: "Incorrect Password "})
                }
            })
            return done(null,user);
        } catch(e) {
            return done(err);
        }
    })
);

passport.serializeUser(function(user, done) {
    done(null, user.id);
})

passport.deserializeUser ( async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch(err) {
        done(err)
    };
});

exports.login_create_get = function (req,res,next){
    res.render('log-in');
}

exports.login_create_post = asyncHandler(async(req,res,next) => {
    passport.authenticate('local', function(err, user, info, status) {
        if (err) { return next(err) }
        if (!user) { return res.redirect('/signin') }
        res.redirect('/account');
      })(req, res, next);
});