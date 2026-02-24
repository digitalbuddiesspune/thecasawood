import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const MATERIAL_SPEC = { key: 'Material', value: 'Leatherette' };

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI in backend/.env');
  }

  await mongoose.connect(uri);

  const beds = await Product.find({ category: /^Beds$/i }).lean();
  let updated = 0;
  let skipped = 0;

  for (const product of beds) {
    const specs = Array.isArray(product.specifications) ? product.specifications : [];
    const hasMaterial = specs.some((s) => s && String(s.key).toLowerCase() === 'material');
    if (hasMaterial) {
      skipped++;
      continue;
    }
    await Product.updateOne(
      { _id: product._id },
      { $push: { specifications: MATERIAL_SPEC } }
    );
    updated++;
    console.log(`Updated: ${product.name} (${product._id})`);
  }

  console.log(`\nDone. Updated: ${updated}, Skipped (already had Material spec): ${skipped}, Total Beds: ${beds.length}`);
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
