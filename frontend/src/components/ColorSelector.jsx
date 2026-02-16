import { useState, useEffect } from 'react';

/**
 * ColorSelector Component
 * 
 * Professional fabric and color selection UI for furniture products
 * Fetches data dynamically from passed props (which come from backend).
 * 
 * @param {Object} props
 * @param {Object} props.fabricData - Full fabric data map (e.g., { "KEIBA": [...colors] })
 * @param {Array} props.availableFabrics - List of fabric types to show (e.g., ['KEIBA', 'MERRY'])
 * @param {String} props.defaultFabric - Initial fabric selection
 * @param {String} props.defaultColor - Initial color code
 * @param {Function} props.onColorChange - Callback when color changes: (fabric, colorCode, colorData) => {}
 */
const ColorSelector = ({
    fabricData = {}, // Defaults to empty object if not loaded yet
    availableFabrics = [],
    defaultFabric = null,
    defaultColor = null,
    onColorChange
}) => {
    // Helper to get colors safely
    const getColors = (fabric) => fabricData[fabric] || [];

    // Helper for color code format
    const getFullColorCode = (fabric, code) => `${fabric} ${code}`;

    // Initialize with first available fabric if no default provided
    // If availableFabrics is empty (shouldn't happen if parent handles it), fallback to keys of fabricData
    // Use availableFabrics directly. Parent must handle fallback if desired.
    const fabricsToList = availableFabrics;

    // Safety check if no fabrics at all
    // Safety check if no fabrics at all
    if (fabricsToList.length === 0) return null;

    const initialFabric = defaultFabric && fabricsToList.includes(defaultFabric) ? defaultFabric : fabricsToList[0];
    const initialColors = getColors(initialFabric);
    const initialColor = defaultColor || initialColors[0]?.code;

    const [selectedFabric, setSelectedFabric] = useState(initialFabric);
    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [hoveredColor, setHoveredColor] = useState(null);

    // Update state if props change (e.g. data loaded late)
    useEffect(() => {
        if (Object.keys(fabricData).length > 0 && !selectedFabric) {
            const firstFabric = fabricsToList[0];
            if (firstFabric) {
                setSelectedFabric(firstFabric);
                const colors = getColors(firstFabric);
                if (colors.length > 0) setSelectedColor(colors[0].code);
            }
        }
    }, [fabricData, fabricsToList, selectedFabric]);


    // Get current color options based on selected fabric
    const currentColors = getColors(selectedFabric);

    // Handle fabric change
    const handleFabricChange = (fabric) => {
        setSelectedFabric(fabric);

        // Auto-select first color of new fabric
        const newColors = getColors(fabric);
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

    // Initialize parent with default selection
    useEffect(() => {
        if (onColorChange && initialColors.length > 0) {
            const initialColorData = initialColors.find(c => c.code === initialColor);
            if (initialColorData) {
                onColorChange(initialFabric, initialColor, initialColorData);
            }
        }
    }, []); // Run once on mount

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
                                    style={{ backgroundColor: colorData.color }}
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
