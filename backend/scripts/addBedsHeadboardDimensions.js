import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const HEADBOARD_DIMENSIONS = {
  title: 'Headboard Dimensions',
  items: [
    { label: 'Outer width', value: '76"' },
    { label: 'Height (from floor)', value: '42"' }
  ]
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI in backend/.env');
  }

  await mongoose.connect(uri);

  // Match category Beds (case-insensitive). Only add Headboard Dimensions; never remove or overwrite existing dimensions or dimensionDetails.
  const beds = await Product.find({ category: /^Beds$/i }).lean();
  let updated = 0;
  let skipped = 0;

  for (const product of beds) {
    const dimensionDetails = Array.isArray(product.dimensionDetails) ? product.dimensionDetails : [];
    const hasHeadboard = dimensionDetails.some(
      (d) => d && d.title && String(d.title).toLowerCase() === 'headboard dimensions'
    );
    if (hasHeadboard) {
      skipped++;
      continue;
    }
    // Append only: use $push so existing dimensionDetails and product.dimensions (length/width/height) are never touched
    await Product.updateOne(
      { _id: product._id },
      { $push: { dimensionDetails: HEADBOARD_DIMENSIONS } }
    );
    updated++;
    console.log(`Updated: ${product.name} (${product._id})`);
  }

  console.log(`\nDone. Updated: ${updated}, Skipped (already had Headboard Dimensions): ${skipped}, Total Beds: ${beds.length}`);
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
