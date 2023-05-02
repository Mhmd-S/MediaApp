const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Club = new Schema ({
    name: {type: String, required: true},
    description: { type: String, required: true},
    date: { type: Date, required: true},
    posts: { type: [ Schema.Types.ObjectId ], ref:"Post", required: true},
    members: { type: [ Schema.Types.ObjectId ], ref:"User", required: true },
    admins: { type: [ Schema.Types.ObjectId ], ref:"User", required: true },
    passcode: { type: String, required: true}
})

module.exports = mongoose.model('Club', Club);