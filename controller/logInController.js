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
        } catch(err) {
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
    console.log(req.session.messages);
    if (req.session.messages){
        res.render('log-in', { errors : req.session.messages })
        return;
    }
    res.render('log-in', { errors: [] });
}

exports.login_create_post = [
    passport.authenticate('local', {
        failureMessage: true,
        failureRedirect: "/log-in"
    }),
    function(req,res) {
        res.redirect('/');
    }
]