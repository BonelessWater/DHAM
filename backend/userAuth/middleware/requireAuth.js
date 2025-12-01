const admin = require("../firebaseAdmin");

module.exports = async (req, res, next) => {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : null;

        if (!token) {
            return res.status(401).json({ error: "Missing token" });
        }   

        const decoded = await admin.auth().verifyIdToken(token);

        if (!decoded) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = {
            uid: decoded.uid,
            name: decoded.name || null,
            email: decoded.email || null,
            picture: decoded.picture || null,
            emailVerified: !!decoded.email_verified,
            provider: decoded.firebase?.sign_in_provider || null,
        };

        next();

    }
    catch (e) {
        console.error("verifyIdToken error: ", e?.message || e);
        return res.status(401).json({ error: "Invalid token" });
    }

};

// check for users