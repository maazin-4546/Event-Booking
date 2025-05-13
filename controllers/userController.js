const User = require("../models/User")
const bcrypt = require("bcrypt");
const registerValidation = require("../validators/registerValidation");
const jwt = require("jsonwebtoken");


const register = async (req, res) => {
    try {
        // todo: Joi Validation
        // const { error } = registerValidation.validate(req.body, { abortEarly: false });
        // if (error) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Validation error",
        //         errors: error.details.map(err => err.message)
        //     });
        // }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).send({ message: "Name, email, and password are required" });
        }

        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).send({ message: "User already exist." });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        user = new User({
            name,
            email,
            password: hashedPassword
        })

        await user.save()

        res.status(200).send({
            success: true,
            message: "User Registered",
            user,
        })

    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ success: false, message: "Email, and password are required" });
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found." });
        }

        const validateUser = await bcrypt.compare(password, user.password)
        if (!validateUser) {
            return res.status(401).send({ success: false, message: "Invalid Credentials." });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "12h" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: true
        })

        res.status(200).send({
            success: true,
            message: "Login successful",
            token,
            user: {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}


const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
        });

        return res.status(200).send({
            success: true,
            message: 'Logout successful',
        });

    } catch (error) {
        console.error("Logout Error:", error.message);
        return res.status(500).send({
            success: false,
            message: 'Logout failed',
            error: error.message,
        });
    }
};


const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const currentUser = await User.findById(userId).select('-password');

        res.status(200).json({
            success: true,
            message: 'User profile fetched successfully',
            user: currentUser,
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};


const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        // Prevent users from updating the role
        if ('role' in req.body) {
            delete req.body.role;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            req.body,
            { new: true }
        ).select("-password")

        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        res.status(200).send({
            success: true,
            message: 'Profile updated successfully.',
            user,
        });


    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).send({
            success: false,
            message: "Internal Server error",
            error: error.message
        })
    }
}


const allUsersList = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 })

        res.status(200).send({
            success: true,
            message: "All ssers fetched",
            users
        })

    } catch (error) {
        console.error(error);
        res.status(400).send({
            success: false,
            message: "Internal Server error",
            error: error.message
        })
    }
}



module.exports = {
    register,
    login,
    logoutUser,
    getCurrentUser,
    updateUserProfile,
    allUsersList,
}