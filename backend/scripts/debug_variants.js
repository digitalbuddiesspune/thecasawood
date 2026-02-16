
const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({
    name: String,
    variants: [mongoose.Schema.Types.Mixed] // Use Mixed to see raw structure
});

const Product = mongoose.model('Product', productSchema);

async function checkVariants() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find products that have variants array with at least one item
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
