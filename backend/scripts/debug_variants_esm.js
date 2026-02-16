
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent directory (backend root)
dotenv.config({ path: path.join(__dirname, '../.env') });

const productSchema = new mongoose.Schema({
    name: String,
    variants: [mongoose.Schema.Types.Mixed]
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function checkVariants() {
    try {
        console.log('Connecting to DB...', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const products = await Product.find({ 'variants.0': { $exists: true } }).limit(5).lean();

        console.log(`Found ${products.length} products with variants.`);

        products.forEach(p => {
            console.log(`\nProduct: ${p.name}`);
            console.log('Variants structure:', JSON.stringify(p.variants, null, 2));
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkVariants();
