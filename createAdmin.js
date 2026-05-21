import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
  nama: String,
  username: String,
  password: String,
  role: String,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const existing = await User.findOne({ username: "admin" });
if (existing) {
  console.log("✅ Admin sudah ada! Username: admin");
} else {
  const hashed = await bcrypt.hash("admin123", 10);
  await User.create({ nama: "Administrator", username: "admin", password: hashed, role: "admin" });
  console.log("✅ Admin berhasil dibuat! Username: admin | Password: admin123");
}

await mongoose.disconnect();
process.exit(0);