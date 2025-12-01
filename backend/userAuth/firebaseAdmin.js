const admin = require("firebase-admin");

const svcB64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!admin.apps.length) {
    if (svcB64) {
        const json = Buffer.from(svcB64, "base64").toString("utf8");
        const creds = JSON.parse(json);
        admin.initializeApp({ credential: admin.credential.cert(creds) });
    }
    else {
        admin.initializeApp({ credential: admin.credential.applicationDefault() });
    }
}

module.exports = admin;


// connect to db