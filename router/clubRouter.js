const express = require('express');
const clubController = require('../controller/clubController');
let router = express.Router();

function loggedIn(req, res, next) {
    console.log(req.isAuthenticated() );
    if ( req.isAuthenticated() ) {
        next();
    } else {
        res.redirect('/log-in');
    }
}

// Gets
router.get('/', loggedIn, clubController.club_create_get);
router.get('/create-club', loggedIn, clubController.createClub_create_get);
router.get('/:clubName/create-post', loggedIn, clubController.post_create_get);
router.get('/:clubName', clubController.club_create_get);


// Posts
router.post('/create-club', loggedIn, clubController.createClub_create_post);
router.post('/:clubName/create-post', loggedIn, clubController.post_create_post);
router.post('/:clubName', loggedIn, clubController.club_create_post);

module.exports = router;

// Test the club