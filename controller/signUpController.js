const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler"); 
const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.signUp_create_get = function (req,res,next)  {
    res.render('sign-up', { errors: [] });
}

exports.signUp_create_post = [
    body("email")
    .escape()
    .isEmail().withMessage("Invalid Email"),
    body("username")
    .trim()
    .notEmpty().withMessage("Username required")
    .escape(),
    body("password")
    .isStrongPassword().withMessage("Password min length is 8. Needs to contain atleast 1 lowercase, uppercase, symbol and number")
    .custom((value, { req } ) => {
        if (value !== req.body.confirmPassword){
            throw new Error("Passwords are not the same!");
        }

        if (value === req.body.username || value === req.body.email) {
            throw new Error("Password can have the same value of email or password");
        }

        return value;
    })
    .escape(),
    asyncHandler(async (req,res,next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('sign-up', { errors: errors.array() });
            return;
        }

        bcrypt.hash(req.body.password, 10, async(err, hashedPassword) => {
            if (err) {
                throw new Error(err);
            }
    
            const newUser =  new User({
                email: req.body.email,
                username: req.body.username,
                password: hashedPassword
            });
            
            await newUser.save();
        });
    
        res.render('sign-up', { errors: [] });
    })
]