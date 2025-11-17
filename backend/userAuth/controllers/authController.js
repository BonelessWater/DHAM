
const bcrypt = require("bycryptjs");
const jwt = require("jsonwebtoken");
const userRepo = require("../userAuth/repos/userRepo.memory"); //change when get DB

const JWT_SECRET = "supersecret";       //change later
const JWT_EXPIRES = "10m";
const REFRESH_EXPIRES = "2d";

function signAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id, email: user.email
        },
        JWT_SECRET,
        {
            expiresIN: JWT_EXPIRES
        }
    );
}

exports.register = async (request, response) => {
    const { name = "", email, password } = request.body;


    if (!email || !password) {
        return response.status(400).json({ error: "Email and password is required" });
    }

    const exists = await userRepo.findByEmail(email);
    if (exists) {
        return response.status(409).json({ error: "This email is already attatched to another user." });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userRepo.create({
        name,
        email,
        hashPassword
    });

    const accessToken = signAccessToken(user);

    response.status(201).json({
        user,
        accessToken
    });

};

exports.login = async (request, response) => {
    const { email, password } = request.body;

    const user = await userRepo.findByEmail(email);
    if (!user) {
        return response.status(401).json({ error: "Invalid username or password. Please try again." });
    }

    const valid = await.bcrypt.compare(password, user.hashPassword);
    if (!valid) {
        return response.status(401).json({ error: "Invalid username or password. Please try again" });
    }

    const accessTojen = signAccessToken(user);

    response.json({ user, accessToken });
};

exports.me = async (request, response) => {
    response.json({ user: request.user });
};