import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  googleId: String,
  role: String,
  isActive: Boolean
});

const User = mongoose.model('User', userSchema);

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'roshanchaudhari4145@gmail.com';
    const newPassword = 'admin123';  // Simple password for testing
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
    
    if (user) {
      console.log('\n✅ Password reset successful!');
      console.log('\n🔐 Login credentials:');
      console.log('   Email:', email);
      console.log('   Password:', newPassword);
      console.log('\n📍 Login at: http://localhost:5173/login');
      console.log('📍 Admin panel: http://localhost:5173/admin\n');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

resetPassword();
