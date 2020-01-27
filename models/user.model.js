const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema ({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true, // removes white space from ends
        minlength: 3,
    },
    password:{
        type:String,
        required: true,
        minlength: 3,
    },
    money: { type: Number, required: true},
}, {
    timestamps: true, // auto create fields for when created / modified
})

const User = mongoose.model('User', userSchema);
module.exports = User;