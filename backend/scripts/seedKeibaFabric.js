import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import Fabric from '../models/Fabric.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seed Fabric collection from keiba_colors.json.
 * JSON format: { "code": "KEIBA 901", "hex": "#E8E3D8", "approx": "Off-white / Cream" }
 * Fabric model: { name: "KEIBA", colors: [ { code: "901", name: "Off-white / Cream", color: "#E8E3D8" } ] }
 */
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI in backend/.env');
  }

  const jsonPath = path.resolve(__dirname, '../data/keiba_colors.json');
  const contents = await fs.readFile(jsonPath, 'utf-8');
  const rows = JSON.parse(contents);

  if (!Array.isArray(rows)) {
    throw new Error('Expected JSON array in keiba_colors.json');
  }

  await mongoose.connect(uri);

  // Group by fabric name (e.g. "KEIBA")
  const byFabric = {};
  for (const row of rows) {
    const codeStr = String(row.code || '').trim();
    const hex = String(row.hex || '').trim();
    const approx = String(row.approx || '').trim();
    if (!codeStr || !hex) continue;

    const parts = codeStr.split(/\s+/);
    const fabricName = parts[0] || 'KEIBA';
    const shortCode = parts.length > 1 ? parts.slice(1).join(' ') : codeStr;

    if (!byFabric[fabricName]) byFabric[fabricName] = [];
    byFabric[fabricName].push({
      code: shortCode,
      name: approx || shortCode,
      color: hex,
      image: row.image || null
    });
  }

  for (const [fabricName, colors] of Object.entries(byFabric)) {
    if (colors.length === 0) continue;
    await Fabric.findOneAndUpdate(
      { name: fabricName },
      { $set: { name: fabricName, colors, isActive: true } },
      { upsert: true, new: true }
    );
    console.log(`Fabric "${fabricName}": ${colors.length} colors seeded.`);
  }

  console.log('Keiba fabric seed complete.');
}

main()
  .then(() => mongoose.connection.close())
  .catch(async (err) => {
    console.error('Seed failed:', err);
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  });
