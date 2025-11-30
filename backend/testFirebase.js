const db = require("./config/database");

(async () => {
  try {
    await db.ref("test").set({ hello: "world" });
    const snap = await db.ref("test").once("value");
    console.log("RTDB read:", snap.val());
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
