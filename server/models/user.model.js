const mongoose = require("mongoose")

 const Schema = mongoose.Schema;
 const userSchema = new Schema({
    googleId: {
        type: String,
        require: true
    },
    displayName: {
        type: String,
        require: true
    },
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    profileImage: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    rooms: [
        {
            roomid: { type: String, required: true },
            roomName: { type: String },
            roomCode: { type: String, required: true, unique: true}
        },
    ],
 })

 module.exports = mongoose.model("User", userSchema)