const express = require("express");
const router = express.Router()
const authorize = require("../middleware/authorize");

const { register, login, getCurrentUser, logoutUser, updateUserProfile, allUsersList } = require("../controllers/userController");


router.post("/register", register)

router.post("/login", login)

router.post("/logout", logoutUser)

router.get('/profile', authorize(['user', 'admin']), getCurrentUser);

router.get('/all-users', authorize(['admin']), allUsersList);

router.put('/update-profile', authorize(['user']), updateUserProfile);




module.exports = router;