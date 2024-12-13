const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Room = require("../models/room.model.js")
const User = require("../models/user.model.js")

const rooms = {};


exports.handleSocketConnection = (io) => {
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);
        const googleId = req.params.googleId; 
        const roomId = uuidv4(); 
        console.log(`Room created for user ${googleId}: ${roomId}`);

        // User joins a room
        socket.on("join-room", (roomId) => {
            if (!rooms[roomId]) {
                socket.emit("error", "Room not found");
                return;
            }
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
            socket
                .to(roomId)
                .emit("user-joined", "A new user has joined the room.");

            // Collaborative code editing
            socket.on("code-update", (code) => {
                socket.to(roomId).emit("code-update", code);
            });

            socket.on("disconnect", () => {
                console.log(
                    `User ${socket.id} disconnected from room ${roomId}`
                );
            });
        });
    });
};


exports.room = async (req, res) => {
    try {
        const user = await User.findOne({ googleId: req.user.googleId });
        if (!user) {
            return res.status(404).send("User not found");
        }
        // console.log(req.user);
        const roomName = req.body.roomName;
        const roomId = uuidv4();

        const generateRoomCode = () => {
            return Math.random().toString(36).substring(2, 8).toUpperCase();
        };
        

        const newRoom = new Room({
            roomid: roomId,
            roomCode: generateRoomCode(),
            roomName: roomName,
            createdBy: user.firstName,
            profileImage: user.profileImage,
            googleId: user.googleId
        });

        await newRoom.save();

        user.rooms.push({ roomid: roomId, roomName: roomName });
        await user.save();

        res.redirect(`/room/${roomId}`);
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).send("Error creating room");
    }
};


