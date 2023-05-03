const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Club  = require('../models/Club');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');

const checkUserMember = asyncHandler(async(req,res,next) => {
    const clubInfo = await Club.findOne({ name: req.params.clubName }).populate('posts').exec();
    
    // Check if user is admin
    const userIsMember = clubInfo.members.includes(req.user._id);

    if (userIsMember) {
        next();
    } else {
        res.redirect($`/clubs/${req.params.clubName}`);
    }
})

exports.clubs_create_get = asyncHandler(async(req,res,next) => { // Displays a page which display all sites with a search functionality.
    res.render('clubs');
})

exports.club_create_get = asyncHandler(async(req,res,next) => { // Displays the specified club 
    // Get Club name from params
    const clubName = req.params.clubName;
    
    // Fetch from database the club Info and populate the posts of the club
    const clubInfo = await Club.findOne({ name: clubName}).populate({ path: 'posts', populate: {path: 'author' } }).exec();

    // Check if user is admin
    const userIsAdmin = req.user ? clubInfo.admins.includes(req.user._id) : false;

    // Check if user is a member if the the admin check returns false
    let userIsMember;
    if (!userIsAdmin) { userIsMember = req.user ? clubInfo.members.includes(req.user._id) : false };
    
    res.render('club', { userIsAdmin: userIsAdmin, userIsMember: userIsMember, clubInfo: clubInfo, error:'' });
})

exports.post_create_get = [ // User requests to create a post.
    checkUserMember,
    function (req,res,next) {
        res.render('create-post', { errors: [] });
    }
]


exports.createClub_create_get = asyncHandler( async(req,res,next) => { // Renders the create club form
    res.render('create-club', { errors: [] });
})

exports.addAdmin_create_get = function(req,res,next) {
    res.render('add-admin');
}

exports.post_create_post = [ // Computing the user's post request for a post
    checkUserMember,
    body('title')
    .trim()
    .isLength({ min: 1, max: 25 }).withMessage('Title can have a minimum of 1 character and a maximum of 25 characters')
    .escape(),
    body('content')
    .isLength({ min:1, max: 300 }).withMessage('Content can have a minimum of 1 characters and a maximum of 300')
    .escape(),
    asyncHandler( async(req,res,next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.render('create-post', { errors: errors.array() });
            return;
        }

        const newPost = new Post({
            title: req.body.title,
            content: req.body.content,
            author: req.user._id,
            club: req.params.clubName
        });

        const result = await newPost.save();
        console.log(result);

        const result1 = await Club.updateOne(
            { name: req.params.clubName }, 
            { $push: { posts: result._id } }
        )
        
        console.log(result1);
        
        res.redirect(`/clubs/${req.params.clubName}`);
    })
]


exports.club_create_post = asyncHandler (async(req,res,next) => { // Logic for when a user wants to join a club
    // Checks the passcode
    const clubInfo = await Club.findOne({ name: req.params.clubName }).populate('posts').exec();

    // Check if user is admin
    const userIsAdmin = clubInfo.admins.includes(req.user._id);

    // Check if user is a member if the the admin check returns false
    let userIsMember;
    if (!userIsAdmin) { userIsMember = clubInfo.members.includes(req.user._id) };

    if (userIsMember || userIsAdmin) {
        res.render('club', { userIsAdmin: userIsAdmin, userIsMember: userIsMember, clubInfo: clubInfo, error:'Already a member' });
        return;
    }

    bcrypt.compare(req.body.passcode, clubInfo.passcode , async(err, success) => {
        if(success) {
            await Club.updateOne(
                { name: req.params.clubName }, 
                { $push: { members: req.user._id } }
                );
            res.render('club', { userIsAdmin: userIsAdmin, userIsMember: true, clubInfo: clubInfo, error:'' });
        } else {
            res.render('club', { userIsAdmin: userIsAdmin, userIsMember: userIsMember, clubInfo: clubInfo, error:'Wrong Passcode' });
        }  
    })
})

exports.createClub_create_post = [ // Processing the create club form from user
    body('name')
    .isAlpha().withMessage('Club name can only contains alphabets')
    .custom( async value => {
        const clubFound = await Club.findOne({ name: value }).exec();
        if (clubFound) {
            throw new Error('Club name is already taken');
        }
    })
    .escape(),
    body('description')
    .trim()
    .isLength({ min: 30, max: 100 }).withMessage('Description needs to have minimum of 30 and maximum of 100 characters')
    .escape(),
    body('passcode')
    .isStrongPassword().withMessage("Password min length is 8. Needs to contain atleast 1 lowercase, uppercase, symbol and number")
    .escape(),
    asyncHandler(async(req,res,next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()){
            res.render('create-club', { errors: errors.array()})
            return;
        }

        bcrypt.hash(req.body.passcode, 10, async(err, hashedPassword) => {
            if (err) {
                throw new Error(err);
            }
    
            const newClub = new Club({
                name: req.body.name,
                description: req.body.description,
                date: new Date(),
                members:[req.user._id],
                admins: [req.user._id],
                passcode: hashedPassword
            })
            
            await newClub.save();
        });

        res.redirect('/'); // Change it to redirect to new club!
    })
]

exports.addAdmin_create_post = [ // Adds an admin
    body('username')
    .trim()
    .isEmpty().withMessage('Username input can not be empty').bail()
    .custom(async username => {
        const foundUser = await User.findOne({ username: username }).exec();
        const clubInfo = await Club.findOne({ name : req.params.clubName}).exec();
        
        if (!foundUser) {
            throw new Error('User does not exist');
        }

        if (clubInfo.admins.includes(req.user._id)) {
            throw new Error('User is already an admin');
        }
    })
    .escape(),
    asyncHandler(async(req,res,next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('add-admin', { errors: errors.array() } );
            return;
        }

        await Club.updateOne(
            { name: req.params.clubName },
            { $push: { admins: foundUser._id }
             }
        )

    })
]

exports.deletePost_create_get = asyncHandler( async(req,res,next) => {
    const postInfo = await Post.findOne({ _id: req.params.postId }).exec();
    const clubInfo = await Club.findOne({ name: req.params.clubName}).exec();
  
    const userIsAdmin = clubInfo.admins.includes(req.user._id);
    const userIsMember = clubInfo.members.includes(req.user._id);
    // Check if user is admin or the one who posted the post
    // Check if the user is an admin
    if (clubInfo.admins.includes(req.user._id) || postInfo.author === req.params._id) {
        // Remove from posts
        await Post.deleteOne({ _id: postInfo._id });
        // remove from the club
        await Club.updateOne(
            { name: req.params.clubName },
            { $pull: { posts: postInfo._id } }
        );
        res.redirect(`/club/${clubInfo.name}`);
        res.render('clubs', { userIsAdmin: userIsAdmin, userIsMember: userIsMember, clubInfo: clubInfo, error:'Post removed!' });
        return;
    }
    res.redirect(`/clubs/${clubInfo.name}`);
    res.render('club', { userIsAdmin: userIsAdmin, userIsMember: userIsMember, clubInfo: clubInfo, error:'Not authorized to remove post' });
})