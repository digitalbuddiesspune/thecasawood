import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Cart from '../models/Cart.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const resetCarts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear all items from all carts to prevent schema mismatch issues
        // (Existing items lack _id, new schema expects _id)
        const result = await Cart.updateMany({}, {
            $set: { items: [], savedForLater: [] }
        });

        console.log(`Reset ${result.modifiedCount} carts. Carts are now empty and compatible with new schema.`);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetCarts();
