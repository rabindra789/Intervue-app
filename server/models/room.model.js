const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomid: { type: String, required: true },
    googleId: { type: String, required: true },
    createdBy: { type: String, required: true },
    profileImage: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    roomCode: { type: String, unique: true, required: true },
});

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
