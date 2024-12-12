const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller.js");
const { isLoggedIn } = require("../middlewares/checkAuth.js");

router.get("/dashboard/:googleId", isLoggedIn, dashboardController.dashboard);

module.exports = router;
