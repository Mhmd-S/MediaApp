const asyncHandler = require('express-async-handler');
const Club = require('../models/Club');

exports.index_create_get = asyncHandler(async(req,res,next) => {
    const clubs = await Club.find({}, { name: 1 }).exec();
    res.render('index', { clubs: clubs, loggedIn: req.isAuthenticated() });
    console.log(req)
})

exports.index_logOut = asyncHandler(async(req,res,next) => {
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/');
      });
})