const express = require('express');
const logInController = require('../controller/logInController');
let router = express.Router();

router.get('/', logInController.login_create_get);

router.post('/', logInController.login_create_post);

module.exports = router;