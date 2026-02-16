import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true }, // Hex code
    image: { type: String, default: null }
}, { _id: false });

const fabricSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    colors: [colorSchema],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Fabric = mongoose.model('Fabric', fabricSchema);

export default Fabric;
