#!/usr/bin/env node
require("dotenv").config({
  path: require("path").resolve(process.cwd(), ".env.local"),
});
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not set");
  process.exit(2);
}

(async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    const coll = mongoose.connection.db.collection("fiscalconfigurations");
    const docs = await coll
      .find({
        $or: [{ cuit: { $exists: false } }, { cuit: null }, { cuit: "" }],
      })
      .project({ _id: 1, business: 1 })
      .limit(100)
      .toArray();

    console.log("Missing CUIT count:", docs.length);
    if (docs.length > 0) console.log("Sample:", docs.slice(0, 20));
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error("Error:", e && e.message ? e.message : e);
    try {
      await mongoose.disconnect();
    } catch (e2) {}
    process.exit(1);
  }
})();
