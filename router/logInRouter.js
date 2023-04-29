const express = require('express');
const logInController = require('../controller/logInController');
let router = express.Router();

router.get('/', logInController.login_create_get);

module.exports = router;