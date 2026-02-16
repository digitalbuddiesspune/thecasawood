/**
 * EXAMPLE: How to Use the Fabric Color Selection System
 * 
 * This file demonstrates the complete workflow from product setup
 * to cart integration.
 */

// ============================================
// 1. PRODUCT SETUP (Backend - seed.js)
// ============================================

const exampleProduct = {
    name: "Premium Sofa Set",
    price: 56499,
    category: "Sofas",

    // Add fabric types
    fabricTypes: ['KEIBA', 'MERRY', 'VELVETO'],
    defaultFabric: 'KEIBA',
    defaultColor: '901',

    // Optional: Variants for size selection
    variants: [
        { name: '1 seater', price: 18545, dimensions: '30 L × 33 W × 18 H' },
        { name: '2 seater', price: 42000, dimensions: '72 L × 33 W × 18 H' },
        { name: '3 seater', price: 56499, dimensions: '96 L × 33 W × 18 H' }
    ],

    // Other fields...
    description: "...",
    features: [],
    specifications: []
};

// ============================================
// 2. PRODUCT DETAIL PAGE (Frontend)
// ============================================

import { useState } from 'react';
import ColorSelector from '../components/ColorSelector';

function ProductDetailExample() {
    // State for fabric/color selection
    const [selectedFabric, setSelectedFabric] = useState(null);
    const [selectedColorCode, setSelectedColorCode] = useState(null);
    const [selectedColorData, setSelectedColorData] = useState(null);

    // State for variant selection
    const [selectedVariant, setSelectedVariant] = useState(null);

    // Handler for color changes
    const handleColorChange = (fabric, colorCode, colorData) => {
        setSelectedFabric(fabric);
        setSelectedColorCode(colorCode);
        setSelectedColorData(colorData);

        console.log('Selected:', {
            fabric,           // "KEIBA"
            colorCode,        // "901"
            fullCode: `${fabric} ${colorCode}`,  // "KEIBA 901"
            colorData: {
                code: colorData.code,       // "901"
                name: colorData.name,       // "Ivory White"
                color: colorData.color,     // "#f1ede4"
                image: colorData.image      // null or image URL
            }
        });
    };

    return (
        <div>
            {/* Variant Selection (Size) */}
            {product.variants && (
                <div>
                    {product.variants.map(variant => (
                        <button onClick={() => setSelectedVariant(variant)}>
                            {variant.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Fabric & Color Selection */}
            {product.fabricTypes && (
                <ColorSelector
                    availableFabrics={product.fabricTypes}
                    defaultFabric={product.defaultFabric}
                    defaultColor={product.defaultColor}
                    onColorChange={handleColorChange}
                />
            )}

            {/* Add to Cart Button */}
            <button onClick={handleAddToCart}>
                Add to Cart
            </button>
        </div>
    );
}

// ============================================
// 3. ADD TO CART LOGIC
// ============================================

async function handleAddToCart() {
    const cartData = {
        productId: product._id,
        quantity: 1,

        // Variant data (size)
        variantName: selectedVariant?.name,  // "3 seater"

        // Fabric & Color data
        fabric: selectedFabric,              // "KEIBA"
        colorCode: `${selectedFabric} ${selectedColorCode}`,  // "KEIBA 901"
        colorData: {
            code: selectedColorData.code,      // "901"
            name: selectedColorData.name,      // "Ivory White"
            color: selectedColorData.color,    // "#f1ede4"
            image: selectedColorData.image     // null or URL
        }
    };

    try {
        await cartAPI.add(cartData);
        console.log('Added to cart:', cartData);
    } catch (error) {
        console.error('Failed to add to cart:', error);
    }
}

// ============================================
// 4. CART DISPLAY
// ============================================

function CartItemExample({ item }) {
    return (
        <div className="cart-item">
            {/* Product Name */}
            <h3>{item.product.name}</h3>

            {/* Variant (Size) */}
            {item.variantName && (
                <div className="variant-badge">
                    Size: {item.variantName}
                </div>
            )}

            {/* Fabric & Color */}
            {item.colorCode && (
                <div className="color-info">
                    <span>Color:</span>

                    {/* Color Swatch */}
                    {item.colorData?.color && (
                        <div
                            className="color-swatch"
                            style={{ backgroundColor: item.colorData.color }}
                        />
                    )}

                    {/* Color Code */}
                    <span>{item.colorCode}</span>

                    {/* Color Name (optional) */}
                    {item.colorData?.name && (
                        <span className="color-name">
                            ({item.colorData.name})
                        </span>
                    )}
                </div>
            )}

            {/* Price & Quantity */}
            <div>
                ₹{item.price} × {item.quantity}
            </div>
        </div>
    );
}

// ============================================
// 5. BACKEND CART ROUTE (Automatic)
// ============================================

// The cart route automatically handles fabric/color data
// No changes needed - it's already integrated!

/*
POST /api/cart

Request Body:
{
  "productId": "...",
  "quantity": 1,
  "variantName": "3 seater",
  "fabric": "KEIBA",
  "colorCode": "KEIBA 901",
  "colorData": {
    "code": "901",
    "name": "Ivory White",
    "color": "#f1ede4",
    "image": null
  }
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "product": { ... },
        "quantity": 1,
        "variantName": "3 seater",
        "fabric": "KEIBA",
        "colorCode": "KEIBA 901",
        "colorData": {
          "code": "901",
          "name": "Ivory White",
          "color": "#f1ede4",
          "image": null
        }
      }
    ]
  }
}
*/

// ============================================
// 6. ADDING NEW FABRICS
// ============================================

// Edit: frontend/src/data/fabricData.js

export const fabricColors = {
    // Existing fabrics...
    KEIBA: [ /* ... */],
    MERRY: [ /* ... */],

    // Add new fabric
    NEWFABRIC: [
        {
            code: "101",
            name: "Custom Color 1",
            color: "#ff5733",  // Hex color
            image: null        // Optional: "/fabrics/newfabric/101.jpg"
        },
        {
            code: "102",
            name: "Custom Color 2",
            color: "#33ff57",
            image: null
        }
    ]
};

// Then add to product:
// fabricTypes: ['KEIBA', 'NEWFABRIC']

// ============================================
// 7. COMPLETE WORKFLOW SUMMARY
// ============================================

/*
1. User visits product page
   ↓
2. Sees fabric type buttons (KEIBA, MERRY, etc.)
   ↓
3. Clicks a fabric type (e.g., KEIBA)
   ↓
4. Sees color swatches for that fabric
   ↓
5. Clicks a color (e.g., 901 - Ivory White)
   ↓
6. Color is selected (visual feedback)
   ↓
7. User clicks "Add to Cart"
   ↓
8. Cart stores: product + variant + fabric + color
   ↓
9. Cart displays: product name, size, color swatch, color code
   ↓
10. User proceeds to checkout with full selection
*/

// ============================================
// 8. TESTING CHECKLIST
// ============================================

/*
✅ Product page loads with default fabric/color
✅ Clicking fabric changes available colors
✅ Clicking color updates selection
✅ Color swatch shows correct color
✅ Tooltip shows full color code
✅ Add to cart includes fabric/color data
✅ Cart displays color swatch and code
✅ Mobile responsive
✅ Smooth transitions
✅ Accessibility (ARIA labels, keyboard nav)
*/

export default {
    exampleProduct,
    ProductDetailExample,
    CartItemExample,
    handleAddToCart
};
