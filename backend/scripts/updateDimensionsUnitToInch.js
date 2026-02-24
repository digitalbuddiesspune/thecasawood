import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI in backend/.env');
  }

  await mongoose.connect(uri);

  const r1 = await Product.updateMany(
    { 'dimensions.unit': 'cm' },
    { $set: { 'dimensions.unit': 'Inch' } }
  );
  const r2 = await Product.updateMany(
    { 'dimensions.unit': 'in' },
    { $set: { 'dimensions.unit': 'Inch' } }
  );

  const modified = r1.modifiedCount + r2.modifiedCount;
  console.log(`Updated ${modified} product(s) to dimensions.unit 'Inch'.`);
  if (r1.matchedCount + r2.matchedCount > 0 && modified === 0) {
    console.log('(All matching documents already had unit "Inch"; no changes made.)');
  }
}

main()
  .then(() => mongoose.connection.close())
  .catch(async (err) => {
    console.error('Script failed:', err);
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  });
