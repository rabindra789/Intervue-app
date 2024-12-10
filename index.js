require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override")
const connectDB = require("./server/config/db.js");
const session = require("express-session");
const passport = require("passport");
const mongoStore = require("connect-mongo");

const app = express();
const PORT = process.env.PORT;

app.use(
    session({
      secret: process.env.SECRET_SESSION,
      resave: false,
      saveUninitialized: true,
      store: mongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
      }),
      cookie: {maxAge: new Date(Date.now() + 604800000)}
    })
  );
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"))

// connect database
connectDB();

app.use(express.static("public"));
app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
  

app.use("/", require("./server/routes/auth.route.js"));
app.use("/", require("./server/routes/index.route.js"));


app.get("*", function (req, res) {
  res.status(404).render("404");
});


app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});