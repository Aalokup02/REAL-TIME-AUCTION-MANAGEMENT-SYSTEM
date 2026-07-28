// API routes: maps authentication HTTP requests to the user controller.
// routes/user.routes.js
const router = require("express").Router();
const controller = require("../controllers/user.controller");

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);

module.exports = router;