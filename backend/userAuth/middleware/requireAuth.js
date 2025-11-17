const jwt = require("jsonwebtoken");
const userRepo = require("../userAuth/middleware/requireAuth"); //change when get DB

const JWT_SECRET = "supersecret"; //change later

module.exports = async (request, response, next) => {
    const header = request.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return response.status(401).json({ error: "Missing token" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        const user = await userRepo.findById(payload.sub);
        if (!user) {
            return response.status(401).json({ error: "User not found" });
        }

        request.user = user;
        next();

    }
    catch (e) {
        return response.status(401).json({ error: "Invalid token" });
    }

};
