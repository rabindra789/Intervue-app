require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const connectDB = require("./server/config/db.js");
const session = require("express-session");
const passport = require("passport");
const mongoStore = require("connect-mongo");
const http = require("http");  // Import the http module
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);  // Now the server is correctly created
const io = socketIo(server);

const PORT = process.env.PORT || 3000;  // Default to 3000 if PORT is not defined

// Define the Socket.IO behavior
let rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('codeChange', (data) => {
        // Broadcast the code change to other clients in the same room
        socket.to(data.roomId).emit('codeUpdate', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Middleware setup
app.use(
    session({
        secret: process.env.SECRET_SESSION,
        resave: false,
        saveUninitialized: true,
        store: mongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
        }),
        cookie: { maxAge: new Date(Date.now() + 604800000) }
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Connect database
connectDB();

// Static files
app.use(express.static("public"));

// Layout settings
app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.set('io', io);

// Route setup
app.use("/", require("./server/routes/auth.route.js"));
app.use("/", require("./server/routes/index.route.js"));
app.use("/", require("./server/routes/dashboard.route.js"));
app.use("/", require("./server/routes/room.route.js"));

// Handle 404 errors
app.get("*", function (req, res) {
    res.status(404).render("404");
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
