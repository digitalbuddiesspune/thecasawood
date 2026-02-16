
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const productSchema = new mongoose.Schema({
    name: String,
    variants: [mongoose.Schema.Types.Mixed]
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function checkVariants() {
    try {
        const output = [];
        output.push('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        output.push('Connected to DB');

        const products = await Product.find({
            $and: [
                { 'variants.0': { $exists: true } },
                { $or: [{ category: 'Sofas' }, { name: /Sofa/i }] }
            ]
        }).limit(5).lean();

        output.push(`Found ${products.length} products with variants.`);

        products.forEach(p => {
            output.push(`\nProduct: ${p.name}`);
            output.push('Variants structure: ' + JSON.stringify(p.variants, null, 2));
        });

        fs.writeFileSync('debug_variants_log.txt', output.join('\n'), 'utf8');
        console.log('Log written to debug_variants_log.txt');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkVariants();
