const express = require('express');
const indexController = require('../controller/indexController');
let router = express.Router();


router.get('/', indexController.index_create_get);

router.get('/log-out', indexController.index_logOut);

module.exports = router;