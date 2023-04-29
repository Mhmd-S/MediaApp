const express = require('express');
const signUpController = require('../controller/signUpController')
let router = express.Router();


router.get('/', signUpController.signUp_create_get);

router.post('/', signUpController.signUp_create_post);

module.exports = router;