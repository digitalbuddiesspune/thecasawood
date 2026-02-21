import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/1200x900?text=THECASAWOOD';

function normalizeProduct(raw) {
  const p = { ...(raw || {}) };

  p.name = typeof p.name === 'string' ? p.name.trim() : p.name;
  p.category = typeof p.category === 'string' ? p.category.trim() : p.category;
  p.description = typeof p.description === 'string' ? p.description.trim() : p.description;
  p.price = Number(p.price);
  if (p.originalPrice != null) p.originalPrice = Number(p.originalPrice);

  if (!p.image || (typeof p.image === 'string' && !p.image.trim())) {
    p.image = Array.isArray(p.images) && p.images[0] ? p.images[0] : DEFAULT_IMAGE_URL;
  }
  if (!Array.isArray(p.images) || p.images.length === 0) {
    p.images = [p.image];
  }

  if (p.isActive === undefined) p.isActive = true;
  if (p.inStock === undefined) p.inStock = true;
  if (p.stockQuantity === undefined) p.stockQuantity = 100;
  if (p.rating === undefined) p.rating = 0;
  if (p.reviews === undefined) p.reviews = 0;

  return p;
}

function validateProduct(p) {
  if (!p?.name) return 'Missing name';
  if (!p?.category) return 'Missing category';
  if (!p?.description) return 'Missing description';
  if (!Number.isFinite(p?.price) || p.price <= 0) return 'Invalid price';
  if (!p?.image) return 'Missing image';
  return null;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI in backend/.env');
  }

  const jsonPath = path.resolve(__dirname, '../k.json');
  const contents = await fs.readFile(jsonPath, 'utf-8');
  const data = JSON.parse(contents);

  if (!Array.isArray(data)) {
    throw new Error('Expected JSON array in k.json');
  }

  await mongoose.connect(uri);

  let skipped = 0;
  const ops = [];

  for (const raw of data) {
    const product = normalizeProduct(raw);
    const err = validateProduct(product);
    if (err) {
      skipped += 1;
      continue;
    }

    const filter = product.sku
      ? { sku: product.sku }
      : { name: product.name, category: product.category, ...(product.color ? { color: product.color } : {}) };

    ops.push({
      updateOne: {
        filter,
        update: { $set: product },
        upsert: true,
      },
    });
  }

  if (ops.length === 0) {
    console.log('No valid products to seed.');
    await mongoose.connection.close();
    return;
  }

  const result = await Product.bulkWrite(ops, { ordered: false });

  console.log('Seed complete (k.json).');
  console.log(`- total_in_file: ${data.length}`);
  console.log(`- operations: ${ops.length}`);
  console.log(`- upserted: ${result.upsertedCount || 0}`);
  console.log(`- modified: ${result.modifiedCount || 0}`);
  console.log(`- skipped_invalid: ${skipped}`);
}

main()
  .then(() => mongoose.connection.close())
  .catch(async (err) => {
    console.error('Seed failed:', err);
    try {
      await mongoose.connection.close();
    } catch {
      // ignore
    }
    process.exit(1);
  });
