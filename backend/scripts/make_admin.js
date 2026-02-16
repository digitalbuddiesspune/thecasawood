import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// User Schema (simplified for this script)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

const makeAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the email from command line argument or use default
    const email = process.argv[2];

    if (!email) {
      // List all users
      console.log('\n📋 Existing users in database:\n');
      const users = await User.find().select('name email role');
      
      if (users.length === 0) {
        console.log('No users found. Please sign up first at http://localhost:5173/signup');
      } else {
        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
        });
        console.log('\n🔧 To make a user admin, run:');
        console.log('   node scripts/make_admin.js your-email@example.com\n');
      }
    } else {
      // Make the specified user an admin
      const user = await User.findOneAndUpdate(
        { email: email },
        { role: 'admin' },
        { new: true }
      );

      if (user) {
        console.log(`\n✅ Success! User "${user.name}" (${user.email}) is now an ADMIN`);
        console.log('\n🔐 You can now access the admin panel at:');
        console.log('   http://localhost:5173/admin\n');
      } else {
        console.log(`\n❌ User with email "${email}" not found`);
        console.log('   Please check the email and try again.\n');
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

makeAdmin();
