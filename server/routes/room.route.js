const express = require("express");
const router = express.Router();
const createRoom = require("../controllers/createRoom.controller.js");
const { isLoggedIn } = require("../middlewares/checkAuth.js");
const Room = require("../models/room.model.js");
const compiler = require("compilex");
const options = { stats: true };
const fs = require('fs');
// Route to handle the room page
router.get("/room/:roomid", isLoggedIn, async (req, res) => {
    try {
        const roomId = req.params.roomid;

        const room = await Room.findOne({ roomid: roomId }).populate(
            "createdBy",
            "name email"
        ); // Populate user data

        if (!room) {
            return res.status(404).send("Room not found");
        }

        const locals = {
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
                cmd: "gcc", // Use g++ for C++ code
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
                const envData = { OS: "linux" }; // (Support for Linux in Next version)
                compiler.compileJava(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "Error in processing code" });
                    }
                });
            } else {
                const envData = { OS: "linux" }; // (Support for Linux in Next version)
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
// Route to handle the room creation
router.post("/dashboard/:googleId/create-room", isLoggedIn, createRoom.room);

module.exports = router;
