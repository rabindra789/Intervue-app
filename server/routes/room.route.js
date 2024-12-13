const express = require("express");
const router = express.Router();
const createRoom = require("../controllers/createRoom.controller.js");
const { isLoggedIn } = require("../middlewares/checkAuth.js");
const Room = require("../models/room.model.js");
const User = require("../models/user.model.js");
const compiler = require("compilex");
const options = { stats: true };
const fs = require('fs');
router.get("/room/:roomid", isLoggedIn, async (req, res) => {
    try {
        const roomId = req.params.roomid;

        const room = await Room.findOne({ roomid: roomId }).populate(
            "createdBy",
            "name email"
        );

        if (!room) {
            return res.status(404).send("Room not found");
        }
        const user = await User.findOne({"rooms.roomid": roomId})
        const locals = {
            roomCode: room.roomCode,
            roomName: user.rooms[0].roomName,
            title: "Intervue App",
            description: "Open source Intervue app",
            roomId: roomId,
            googleId: room.googleId,
            createdBy: room.createdBy,
            profileImage: room.profileImage,
            roomLink: `${req.protocol}://${req.get("host")}/room/${roomId}`,
        };

        res.render("room", { locals, layout: "../views/layouts/dashboard" });
    } catch (error) {
        console.error("Error fetching room details:", error);
        res.status(500).send("Error fetching room details");
    }
});
compiler.init(options);
router.post("/compile", (req, res) => {
    try {
        const code = req.body.code;
        const input = req.body.input;
        const lang = req.body.lang;
        if (lang == "Cpp") {
            const envData = {
                OS: "linux",
                cmd: "gcc",
                options: { timeout: 10000 },
            };
        
            if (!input) {
                compiler.compileCPP(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "Error in processing code" });
                    }
                });
            } else {
                compiler.compileCPPWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "Error in processing code" });
                    }
                });
            }
            compiler.flushSync(function(){
                console.log('All temporary files flushed !'); 
                });
        } else if (lang == "Java") {
            if (!input) {
                const envData = { OS: "linux" }; 
                compiler.compileJava(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "Error in processing code" });
                    }
                });
            } else {
                const envData = { OS: "linux" };
                compiler.compileJavaWithInput(
                    envData,
                    code,
                    input,
                    function (data) {
                        if (data.output) {
                            res.send(data);
                        } else {
                            res.send({ output: "Error in processing code" });
                        }
                    }
                );
            }
            compiler.flushSync(function(){
                console.log('All temporary files flushed !'); 
                });
        } else if (lang == "Python") {
            if (!input) {
                const envData = { OS: "linux" };
                compiler.compilePython(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "Error in processing code" });
                    }
                });
            } else {
                const envData = { OS: "linux" };
                compiler.compilePythonWithInput(
                    envData,
                    code,
                    input,
                    function (data) {
                        if (data.output) {
                            res.send(data);
                        } else {
                            res.send({ output: "Error in processing code" });
                        }
                    }
                );
            }
        }
        compiler.flushSync(function(){
            console.log('All temporary files flushed !'); 
            });
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.post("/join-room", isLoggedIn, async (req, res) => {
    try {
        const { roomCode } = req.body;  
        const room = await Room.findOne({ roomCode: roomCode });
        if (!room) {
            return res.status(404).send("Room not found with this code");
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).send("You need to be logged in to join a room");
        }

        const roomData = {
            roomid: room.roomid,
            roomName: room.roomName,
            roomCode: room.roomCode, 
        };

        if (!user.rooms.some(r => r.roomid === room.roomid)) {
            user.rooms.push(roomData);
            await user.save();
        }

        res.redirect(`/room/${room.roomid}`);

    } catch (error) {
        console.error("Error handling room join:", error);
        res.status(500).send("Error joining room");
    }
});

// Route to handle the room creation
router.post("/dashboard/:googleId/create-room", isLoggedIn, createRoom.room);

module.exports = router;
