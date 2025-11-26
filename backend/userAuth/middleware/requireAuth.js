const jwt = require("jsonwebtoken");
const userRepo = require("../repos/userRepo.memory"); //change when get DB

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; //change later

module.exports = async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: "Missing token" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        const user = await userRepo.findById(payload.sub);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        next();

    }
    catch (e) {
        return res.status(401).json({ error: "Invalid token" });
    }

};
