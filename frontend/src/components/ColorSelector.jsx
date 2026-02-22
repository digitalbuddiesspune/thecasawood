import { useState, useEffect } from 'react';

/**
 * Accurate hex values for common color names so swatches match the name.
 * Keys are normalized (lowercase, trimmed). Backend hex is used when name not in map.
 */
const COLOR_NAME_TO_HEX = {
    'pearl white': '#F5F5DC',
    'white': '#FFFFFF',
    'black': '#1C1C1C',
    'grey': '#808080',
    'gray': '#808080',
    'dark grey': '#505050',
    'dark gray': '#505050',
    'light grey': '#D3D3D3',
    'light gray': '#D3D3D3',
    'charcoal': '#36454F',
    'brown': '#8B4513',
    'dark brown': '#3D2314',
    'walnut': '#773F1A',
    'beige': '#F5F5DC',
    'cream': '#FFFDD0',
    'navy': '#000080',
    'blue': '#1E3A5F',
    'red': '#8B0000',
    'green': '#2E5C3E',
    'olive': '#6B8E23',
    'tan': '#D2B48C',
    'taupe': '#483C32',
    'sand': '#C2B280',
    'ivory': '#FFFFF0',
    'off white': '#FAF9F6',
    'off-white': '#FAF9F6',
    'slate': '#708090',
    'graphite': '#383838',
    'smoke': '#738276',
    'stone': '#928E85',
};

function getDisplayHex(colorData) {
    if (!colorData) return '#CCCCCC';
    const name = String(colorData.name || '').toLowerCase().trim();
    if (COLOR_NAME_TO_HEX[name]) return COLOR_NAME_TO_HEX[name];
    const hex = String(colorData.color || '').trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
    if (/^#[0-9A-Fa-f]{3}$/.test(hex)) return hex;
    return hex || '#CCCCCC';
}

/**
 * ColorSelector Component
 * Shows only colors from product (productColorOptions). Swatch hex is derived from color name for accuracy.
 *
 * @param {Object} props
 * @param {Object} props.fabricData - Full fabric data map (e.g., { "KEIBA": [...colors] })
 * @param {Array} props.availableFabrics - List of fabric types to show
 * @param {Array} props.productColorOptions - Product's color options from backend
 * @param {String} props.defaultFabric - Initial fabric selection
 * @param {String} props.defaultColor - Initial color code
 * @param {Function} props.onColorChange - Callback (fabric, colorCode, colorData) => {}
 */
const ColorSelector = ({
    fabricData = {},
    availableFabrics = [],
    productColorOptions = [],
    defaultFabric = null,
    defaultColor = null,
    onColorChange
}) => {
    // Helper to get colors safely (all colors for a fabric from fabrics API)
    const getColors = (fabric) => fabricData[fabric] || [];

    // Only show colors that are in this product's colorOptions (backend). No fallback to full fabric list.
    const normalizeOpt = (o) => String(o || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const matchesProductOption = (fabric, colorData) => {
        if (!productColorOptions || productColorOptions.length === 0) return false;
        const fullCode = normalizeOpt(`${fabric} ${colorData.code}`);
        const codeNorm = normalizeOpt(colorData.code);
        const nameNorm = normalizeOpt(colorData.name);
        return productColorOptions.some((opt) => {
            const o = normalizeOpt(opt);
            return o === fullCode || o === codeNorm || o === nameNorm;
        });
    };

    const getFilteredColors = (fabric) => {
        const all = getColors(fabric);
        if (!productColorOptions || productColorOptions.length === 0) return [];
        return all.filter((c) => matchesProductOption(fabric, c));
    };

    // Helper for color code format
    const getFullColorCode = (fabric, code) => `${fabric} ${code}`;

    const fabricsToList = availableFabrics;
    const hasFabrics = fabricsToList.length > 0;
    const initialFabric = hasFabrics && (defaultFabric && fabricsToList.includes(defaultFabric) ? defaultFabric : fabricsToList[0]);
    const initialColors = hasFabrics ? getFilteredColors(initialFabric) : [];
    const initialColor = defaultColor || initialColors[0]?.code;

    const [selectedFabric, setSelectedFabric] = useState(initialFabric);
    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [hoveredColor, setHoveredColor] = useState(null);

    useEffect(() => {
        if (!hasFabrics) return;
        if (Object.keys(fabricData).length > 0 && !selectedFabric) {
            const firstFabric = fabricsToList[0];
            if (firstFabric) {
                const colors = getFilteredColors(firstFabric);
                const code = colors.length > 0 ? colors[0].code : null;
                const t = setTimeout(function () {
                    setSelectedFabric(firstFabric);
                    if (code) setSelectedColor(code);
                }, 0);
                return function () { clearTimeout(t); };
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when fabric data loads; getFilteredColors is stable in practice
    }, [fabricData, fabricsToList, selectedFabric, productColorOptions, hasFabrics]);

    const currentColors = hasFabrics ? getFilteredColors(selectedFabric) : [];

    // Handle fabric change
    const handleFabricChange = (fabric) => {
        setSelectedFabric(fabric);

        // Auto-select first color of new fabric
        const newColors = getFilteredColors(fabric);
        if (newColors.length > 0) {
            const firstColor = newColors[0];
            setSelectedColor(firstColor.code);

            // Notify parent component
            if (onColorChange) {
                onColorChange(fabric, firstColor.code, firstColor);
            }
        }
    };

    // Handle color change
    const handleColorChange = (colorData) => {
        setSelectedColor(colorData.code);

        // Notify parent component
        if (onColorChange) {
            onColorChange(selectedFabric, colorData.code, colorData);
        }
    };

    useEffect(function () {
        if (onColorChange && initialColors.length > 0) {
            const initialColorData = initialColors.find(function (c) { return c.code === initialColor; });
            if (initialColorData) {
                onColorChange(initialFabric, initialColor, initialColorData);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount to notify parent of initial selection
    }, []);

    if (!hasFabrics) return null;

    return (
        <div className="mb-6">
            {/* Fabric Type Selection */}
            <div className="mb-4">
                <div className="text-sm font-medium text-gray-900 mb-3">
                    Select Fabric Type: <span className="text-[#8b5e3c] font-bold">{selectedFabric}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {fabricsToList.map((fabric) => (
                        <button
                            key={fabric}
                            onClick={() => handleFabricChange(fabric)}
                            className={`px-5 py-2.5 border rounded-lg text-sm font-semibold transition-all duration-200 ${selectedFabric === fabric
                                ? 'border-[#8b5e3c] bg-[#fff8f5] text-[#8b5e3c] shadow-sm ring-1 ring-[#8b5e3c]'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-[#8b5e3c] hover:shadow-sm'
                                }`}
                        >
                            {fabric}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Swatches */}
            <div className="mb-2">
                <div className="text-sm font-medium text-gray-900 mb-3">
                    Select Color:
                    <span className="text-[#8b5e3c] font-bold ml-2">
                        {getFullColorCode(selectedFabric, selectedColor)}
                    </span>
                    {hoveredColor && (
                        <span className="text-gray-500 text-xs ml-2">
                            ({hoveredColor.name})
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                    {currentColors.map((colorData) => {
                        const isSelected = selectedColor === colorData.code;
                        const fullCode = getFullColorCode(selectedFabric, colorData.code);

                        return (
                            <div key={colorData.code} className="relative group">
                                {/* Color Swatch */}
                                <button
                                    onClick={() => handleColorChange(colorData)}
                                    onMouseEnter={() => setHoveredColor(colorData)}
                                    onMouseLeave={() => setHoveredColor(null)}
                                    className={`w-12 h-12 rounded-md transition-all duration-300 ${isSelected
                                        ? 'ring-2 ring-[#8b5e3c] ring-offset-2 scale-110 shadow-lg z-10'
                                        : 'ring-1 ring-gray-200 hover:ring-[#8b5e3c] hover:scale-105 hover:shadow-md'
                                        }`}
                                    style={{ backgroundColor: getDisplayHex(colorData) }}
                                    title={fullCode}
                                    aria-label={`Select ${fullCode}`}
                                >
                                    {/* Checkmark for selected color */}
                                    {isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6 text-white drop-shadow-md"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </button>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    {fullCode}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Color Name Display */}
            <div className="text-xs text-gray-500 mt-2">
                {currentColors.find(c => c.code === selectedColor)?.name}
            </div>
        </div>
    );
};

export default ColorSelector;
