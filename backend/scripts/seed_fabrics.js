import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Fabric from '../models/Fabric.js';

dotenv.config();

const fabricData = {
    KEIBA: [
        { code: "901", name: "Ivory White", color: "#f1ede4", image: null },
        { code: "902", name: "Beige Sand", color: "#e3d7c8", image: null },
        { code: "903", name: "Warm Taupe", color: "#d4c4b0", image: null },
        { code: "907", name: "Mocha Brown", color: "#8b7355", image: null },
    ],

    MERRY: [
        { code: "701", name: "Pearl White", color: "#f5f5f5", image: null },
        { code: "703", name: "Soft Grey", color: "#d1d1d1", image: null },
        { code: "705", name: "Charcoal", color: "#6b6b6b", image: null },
        { code: "706", name: "Slate Grey", color: "#4a4a4a", image: null },
        { code: "734", name: "Deep Charcoal", color: "#2d2d2d", image: null },
        { code: "738", name: "Midnight Black", color: "#1a1a1a", image: null },
    ],

    VELVETO: [
        { code: "927", name: "Velvet Cream", color: "#f8f6f0", image: null },
        { code: "928", name: "Velvet Beige", color: "#e8dcc8", image: null },
        { code: "929", name: "Velvet Rose", color: "#d4a5a5", image: null },
        { code: "930", name: "Velvet Burgundy", color: "#8b4545", image: null },
    ],

    ABOONE: [
        { code: "801", name: "Natural Linen", color: "#f0ebe0", image: null },
        { code: "802", name: "Desert Sand", color: "#d9c7a8", image: null },
        { code: "803", name: "Caramel", color: "#b8956a", image: null },
        { code: "804", name: "Espresso", color: "#5c4a3a", image: null },
    ],

    AMBER: [
        { code: "101", name: "Amber Beige", color: "#e8dcb5", image: null },
        { code: "113", name: "Amber Grey", color: "#8a8ea3", image: null },
        { code: "119", name: "Amber Blue", color: "#4a5d8f", image: null },
        { code: "100", name: "Amber Cream", color: "#fdfbd0", image: null },
    ],

    POLYESTER: [
        { code: "P-01", name: "Polyester Grey", color: "#808080", image: null },
        { code: "P-02", name: "Polyester Blue", color: "#0000FF", image: null },
        { code: "P-03", name: "Polyester Red", color: "#FF0000", image: null },
    ],

    LEATHERETTE: [
        { code: "L-01", name: "Classic Brown", color: "#8B4513", image: null },
        { code: "L-02", name: "Black", color: "#000000", image: null },
        { code: "L-03", name: "Tan", color: "#D2B48C", image: null },
    ],
};

const seedFabrics = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/casawood';
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');

        // Clear existing
        await Fabric.deleteMany({});
        console.log('Cleared existing fabrics');

        // Insert new
        const fabricDocs = Object.keys(fabricData).map(name => ({
            name,
            colors: fabricData[name]
        }));

        await Fabric.insertMany(fabricDocs);
        console.log('Fabrics seeded successfully');

        process.exit();
    } catch (error) {
        console.error('Error seeding fabrics:', error);
        process.exit(1);
    }
};

seedFabrics();
