import express from 'express';
import Fabric from '../models/Fabric.js';

const router = express.Router();

// @route   GET /api/fabrics
// @desc    Get all fabrics and their colors
// @access  Public
router.get('/', async (req, res) => {
    try {
        const fabrics = await Fabric.find({ isActive: true });

        // Convert array of documents to the object structure the frontend expects
        // structure: { "KEIBA": [ {code, name, color}, ... ], "MERRY": [...] }
        const fabricMap = {};

        fabrics.forEach(fabric => {
            fabricMap[fabric.name] = fabric.colors;
        });

        res.json({
            success: true,
            data: fabricMap
        });
    } catch (error) {
        console.error('Get fabrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;
