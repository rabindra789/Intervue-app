const express = require("express")
const router = express.Router()
const mainController = require("../controllers/main.controller.js")
const { isLoggedIn } = require("../middlewares/checkAuth.js")

router.get("/", mainController.homepage)
router.get("/about", mainController.about)

module.exports = router