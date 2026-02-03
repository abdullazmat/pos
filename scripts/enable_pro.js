const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found");
  }
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing");

  await mongoose.connect(uri, { bufferCommands: false });

  const userSchema = new mongoose.Schema(
    { username: String, businessId: mongoose.Schema.Types.ObjectId },
    { collection: "users" },
  );
  const subscriptionSchema = new mongoose.Schema(
    {
      businessId: mongoose.Schema.Types.ObjectId,
      planId: String,
      status: String,
      provider: String,
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      failedPayments: Number,
      autoRenew: Boolean,
      features: Object,
    },
    { collection: "subscriptions" },
  );
  const businessSchema = new mongoose.Schema(
    { subscriptionId: mongoose.Schema.Types.ObjectId },
    { collection: "businesses" },
  );

  const User = mongoose.model("User", userSchema);
  const Subscription = mongoose.model("Subscription", subscriptionSchema);
  const Business = mongoose.model("Business", businessSchema);

  const username = "testing123";
  const user = await User.findOne({ username }).lean();
  if (!user) {
    throw new Error(`User not found: ${username}`);
  }

  const now = new Date();
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const features = {
    maxProducts: 5000,
    maxUsers: 5,
    maxCategories: 200,
    maxClients: 100,
    maxSuppliers: 100,
    arcaIntegration: true,
    advancedReporting: true,
    customBranding: false,
    invoiceChannels: 2,
  };

  const subscription = await Subscription.findOneAndUpdate(
    { businessId: user.businessId },
    {
      planId: "PROFESSIONAL",
      status: "active",
      provider: "mercado_pago",
      currentPeriodStart: now,
      currentPeriodEnd: end,
      failedPayments: 0,
      autoRenew: true,
      features,
    },
    { new: true, upsert: true },
  );

  await Business.findOneAndUpdate(
    { _id: user.businessId },
    { subscriptionId: subscription._id },
  );

  console.log(
    `Enabled PROFESSIONAL for ${username}. SubscriptionId: ${subscription._id}`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
