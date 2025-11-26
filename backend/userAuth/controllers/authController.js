
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepo = require("../repos/userRepo.memory"); //change when get DB

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";       //change later
const JWT_EXPIRES = process.env.JWT_EXPIRES || "10m";

function signAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id, email: user.email
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES
        }
    );
}

exports.register = async (req, res) => {
    const { name = "", email, password } = req.body;


    if (!email || !password) {
        return res.status(400).json({ error: "Email and password is required" });
    }

    const exists = await userRepo.findByEmail(email);
    if (exists) {
        return res.status(409).json({ error: "This email is already attatched to another user." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userRepo.create({
        name,
        email,
        passwordHash
    });

    const accessToken = signAccessToken(user);

    res.status(201).json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        },
        accessToken
    });

};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await userRepo.findByEmail(email);
    if (!user) {
        return res.status(401).json({ error: "Invalid username or password. Please try again." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        return res.status(401).json({ error: "Invalid username or password. Please try again" });
    }

    const accessToken = signAccessToken(user);

    res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        },
        accessToken
    });
};

exports.me = async (req, res) => {
    res.json({ user: req.user });
};