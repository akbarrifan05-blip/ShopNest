const mongoose = require('mongoose');
const { type } = require('node:os');

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique: true},
    password:{type:String,required:true},
    role:{type:String,enum:['user','admin'],default:'user'},
    verified:{type:Boolean,default: false },
    otp: { type: String },
    otpExpires: { type: Date }
}, { timestamps: true });



module.exports = mongoose.models.User || mongoose.model("User",userSchema);
