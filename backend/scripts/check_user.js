import mongoose from 'mongoose';
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

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ email: 'roshanchaudhari4145@gmail.com' });
    
    if (user) {
      console.log('\n📋 User Details:');
      console.log('   Name:', user.name);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Has Password:', user.password ? 'Yes' : 'No');
      console.log('   Google Account:', user.googleId ? 'Yes' : 'No');
      console.log('   Active:', user.isActive);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

checkUser();
