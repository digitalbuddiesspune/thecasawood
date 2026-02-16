import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminProductsAPI, adminCategoriesAPI, adminFabricsAPI } from '../services/adminApi';

const TAG_OPTIONS = ['Best Seller', 'New', 'Sale', 'Featured', 'Premium', 'Trending'];

const defaultPolicies = {
  shipping: 'Directly from Factory/ Warehouse, Delivered in multiple boxes',
  warranty: '1 year Manufacturing Warranty',
  cancellations: 'Cancellations are allowed free of charge only within first 24 hours of placing the order',
};

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fabrics, setFabrics] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    image: '',
    images: [],
    tag: '',
    rating: '',
    reviews: '',
    stockQuantity: '',
    inStock: true,
    sku: '',
    status: 'active',
    weight: '',
    weightUnit: 'kg',
    dimensions: { length: '', width: '', height: '', unit: 'cm' },
    warranty: '',
    material: '',
    color: '',
    deliveryCondition: '',
    specifications: [],
    features: [],
    colorOptions: [],
    variants: [],
    fabricTypes: [],
    defaultFabric: '',
    defaultColor: '',
    dimensionDetails: [],
    policies: { ...defaultPolicies },
  });

  const [errors, setErrors] = useState({});
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [newVariant, setNewVariant] = useState({
    name: '',
    price: '',
    originalPrice: '',
    dimensions: '',
    image: '',
  });
  const [newFeature, setNewFeature] = useState('');
  const [newFabricType, setNewFabricType] = useState('');
  const [newDimDetailTitle, setNewDimDetailTitle] = useState('');
  const [newDimDetailItem, setNewDimDetailItem] = useState({ label: '', value: '' });
  const [dimDetailItemIndex, setDimDetailItemIndex] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchFabrics();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await adminProductsAPI.getById(id);
      if (response.data.success) {
        const p = response.data.data;
        const dims = p.dimensions || {};
        const weightNum = typeof p.weight === 'object' && p.weight !== null ? p.weight.type ?? p.weight.value ?? '' : (p.weight ?? '');
        const weightUnit = (typeof p.weight === 'object' && p.weight !== null ? p.weight.unit : null) || p.weightUnit || 'kg';
        setFormData({
          name: p.name || '',
          description: p.description || '',
          price: p.price ?? '',
          originalPrice: p.originalPrice ?? '',
          category: p.category || '',
          image: p.image || '',
          images: Array.isArray(p.images) ? p.images : [],
          tag: p.tag || '',
          rating: p.rating ?? '',
          reviews: p.reviews ?? '',
          stockQuantity: p.stockQuantity ?? '',
          inStock: p.inStock !== false,
          sku: p.sku || '',
          status: p.isActive !== false ? 'active' : 'inactive',
          weight: weightNum,
          weightUnit,
          dimensions: {
            length: dims.length ?? '',
            width: dims.width ?? '',
            height: dims.height ?? '',
            unit: dims.unit || 'cm',
          },
          warranty: p.warranty || '',
          material: p.material || '',
          color: p.color || '',
          deliveryCondition: p.deliveryCondition || '',
          specifications: Array.isArray(p.specifications) ? p.specifications : [],
          features: Array.isArray(p.features) ? p.features : [],
          colorOptions: Array.isArray(p.colorOptions) ? p.colorOptions : [],
          variants: Array.isArray(p.variants) ? p.variants : [],
          fabricTypes: Array.isArray(p.fabricTypes) ? p.fabricTypes : [],
          defaultFabric: p.defaultFabric || '',
          defaultColor: p.defaultColor || '',
          dimensionDetails: Array.isArray(p.dimensionDetails) ? p.dimensionDetails : [],
          policies: p.policies && typeof p.policies === 'object'
            ? { ...defaultPolicies, ...p.policies }
            : { ...defaultPolicies },
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminCategoriesAPI.getAll();
      if (response.data.success && response.data.data?.length > 0) {
        setCategories(response.data.data);
      } else {
        setCategories([
          { name: 'Beds' },
          { name: 'Coffee & Center Tables' },
          { name: 'Dining Tables' },
          { name: 'Sofas' },
          { name: 'Lounge chair' },
        ]);
      }
    } catch {
      setCategories([
        { name: 'Beds' },
        { name: 'Coffee & Center Tables' },
        { name: 'Dining Tables' },
        { name: 'Sofas' },
        { name: 'Lounge chair' },
      ]);
    }
  };

  const fetchFabrics = async () => {
    try {
      const response = await adminFabricsAPI.getAll();
      if (response.data.success) {
        const data = response.data.data;
        setFabrics(Array.isArray(data) ? data : Object.keys(data || {}).map((name) => ({ name })));
      }
    } catch (error) {
      console.error('Error fetching fabrics:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('policies.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        policies: { ...prev.policies, [key]: value },
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleTagSelect = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tag: prev.tag === tag ? '' : tag,
    }));
  };

  const handleAddSpec = () => {
    if (newSpec.key && newSpec.value) {
      setFormData((prev) => ({
        ...prev,
        specifications: [...prev.specifications, { ...newSpec }],
      }));
      setNewSpec({ key: '', value: '' });
    }
  };

  const handleRemoveSpec = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleAddFeature = () => {
    const trimmed = newFeature.trim();
    if (trimmed) {
      setFormData((prev) => ({ ...prev, features: [...prev.features, trimmed] }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleAddFabricType = () => {
    const t = newFabricType.trim();
    if (t && !formData.fabricTypes.includes(t)) {
      setFormData((prev) => ({ ...prev, fabricTypes: [...prev.fabricTypes, t] }));
      setNewFabricType('');
    }
  };

  const handleRemoveFabricType = (index) => {
    setFormData((prev) => ({
      ...prev,
      fabricTypes: prev.fabricTypes.filter((_, i) => i !== index),
    }));
  };

  const handleAddVariant = () => {
    if (newVariant.name && newVariant.price !== '' && newVariant.price !== undefined) {
      const v = {
        name: newVariant.name,
        price: Number(newVariant.price),
        originalPrice: newVariant.originalPrice ? Number(newVariant.originalPrice) : undefined,
        dimensions: newVariant.dimensions || undefined,
        image: newVariant.image || undefined,
      };
      setFormData((prev) => ({ ...prev, variants: [...prev.variants, v] }));
      setNewVariant({ name: '', price: '', originalPrice: '', dimensions: '', image: '' });
    }
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleAddDimensionDetail = () => {
    if (newDimDetailTitle.trim()) {
      setFormData((prev) => ({
        ...prev,
        dimensionDetails: [
          ...prev.dimensionDetails,
          { title: newDimDetailTitle.trim(), items: [] },
        ],
      }));
      setNewDimDetailTitle('');
    }
  };

  const handleAddDimensionDetailItem = (detailIndex) => {
    if (newDimDetailItem.label.trim() && newDimDetailItem.value.trim()) {
      setFormData((prev) => {
        const next = [...prev.dimensionDetails];
        if (!next[detailIndex].items) next[detailIndex].items = [];
        next[detailIndex].items = [...next[detailIndex].items, { ...newDimDetailItem }];
        return { ...prev, dimensionDetails: next };
      });
      setNewDimDetailItem({ label: '', value: '' });
      setDimDetailItemIndex(null);
    }
  };

  const handleRemoveDimensionDetail = (index) => {
    setFormData((prev) => ({
      ...prev,
      dimensionDetails: prev.dimensionDetails.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveDimensionDetailItem = (detailIndex, itemIndex) => {
    setFormData((prev) => {
      const next = [...prev.dimensionDetails];
      next[detailIndex].items = next[detailIndex].items.filter((_, i) => i !== itemIndex);
      return { ...prev, dimensionDetails: next };
    });
  };

  const handleImageAdd = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    }
  };

  const handleImageRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (formData.price === '' && formData.price !== 0) newErrors.price = 'Price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.image) newErrors.image = 'Main image URL is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const price = Number(formData.price);
    const originalPrice = formData.originalPrice ? Number(formData.originalPrice) : price;
    const stockQuantity = formData.stockQuantity !== '' ? Number(formData.stockQuantity) : 0;
    const weightNum = formData.weight !== '' ? Number(formData.weight) : undefined;
    const weightValid = weightNum !== undefined && !Number.isNaN(weightNum);
    const dimensions =
      formData.dimensions.length || formData.dimensions.width || formData.dimensions.height
        ? {
            length: formData.dimensions.length ? Number(formData.dimensions.length) : undefined,
            width: formData.dimensions.width ? Number(formData.dimensions.width) : undefined,
            height: formData.dimensions.height ? Number(formData.dimensions.height) : undefined,
            unit: formData.dimensions.unit || 'cm',
          }
        : undefined;
    const rating = formData.rating !== '' ? Number(formData.rating) : undefined;
    const reviews = formData.reviews !== '' ? Number(formData.reviews) : undefined;

    const payload = {
      name: (formData.name || '').trim(),
      description: (formData.description || '').trim() || 'No description',
      price,
      originalPrice,
      category: (formData.category || '').trim(),
      image: (formData.image || '').trim(),
      images: Array.isArray(formData.images) ? formData.images.filter(Boolean) : [],
      tag: formData.tag && formData.tag.trim() ? formData.tag.trim() : null,
      rating: rating !== undefined && !Number.isNaN(rating) ? rating : 0,
      reviews: reviews !== undefined && !Number.isNaN(reviews) ? reviews : 0,
      stockQuantity,
      inStock: Boolean(formData.inStock),
      isActive: formData.status === 'active',
      sku: formData.sku && formData.sku.trim() ? formData.sku.trim() : undefined,
      dimensions,
      warranty: formData.warranty && formData.warranty.trim() ? formData.warranty.trim() : undefined,
      material: formData.material && formData.material.trim() ? formData.material.trim() : undefined,
      color: formData.color && formData.color.trim() ? formData.color.trim() : undefined,
      deliveryCondition: formData.deliveryCondition && formData.deliveryCondition.trim() ? formData.deliveryCondition.trim() : undefined,
      specifications: Array.isArray(formData.specifications) ? formData.specifications : [],
      features: Array.isArray(formData.features) ? formData.features : [],
      colorOptions: Array.isArray(formData.colorOptions) ? formData.colorOptions : [],
      fabricTypes: Array.isArray(formData.fabricTypes) ? formData.fabricTypes : [],
      defaultFabric: formData.defaultFabric && formData.defaultFabric.trim() ? formData.defaultFabric.trim() : undefined,
      defaultColor: formData.defaultColor && formData.defaultColor.trim() ? formData.defaultColor.trim() : undefined,
      dimensionDetails: Array.isArray(formData.dimensionDetails) ? formData.dimensionDetails : [],
      policies: formData.policies && typeof formData.policies === 'object' ? formData.policies : undefined,
      variants: (Array.isArray(formData.variants) ? formData.variants : []).map((v) => ({
        name: String(v.name || '').trim(),
        price: Number(v.price),
        originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
        dimensions: v.dimensions && String(v.dimensions).trim() ? String(v.dimensions).trim() : undefined,
        image: v.image && String(v.image).trim() ? String(v.image).trim() : undefined,
      })),
    };
    if (weightValid) {
      payload.weight = weightNum;
      payload.weightUnit = formData.weightUnit || 'kg';
    }
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      const productData = buildPayload();
      if (isEdit) {
        await adminProductsAPI.update(id, productData);
      } else {
        await adminProductsAPI.create(productData);
      }
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to save product' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                placeholder="Enter product description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] ${errors.category ? 'border-red-500' : 'border-gray-200'}`}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                placeholder="e.g. CW-SOFA-001"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Stock</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min={0}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] ${errors.price ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="0"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                min={0}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                placeholder="MRP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                min={0}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                id="inStock"
                checked={formData.inStock}
                onChange={(e) => setFormData((prev) => ({ ...prev, inStock: e.target.checked }))}
                className="rounded border-gray-300 text-[#8b5e3c] focus:ring-[#8b5e3c]"
              />
              <label htmlFor="inStock" className="text-sm font-medium text-gray-700">In Stock</label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Images</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Image URL *</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] ${errors.image ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="https://..."
              />
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
              <div className="flex flex-wrap gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img} alt={`Product ${index + 1}`} className="w-24 h-24 object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleImageAdd}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tag (single) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tag</h2>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagSelect(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.tag === tag ? 'bg-[#8b5e3c] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
            <span className="text-sm text-gray-500 self-center ml-2">Optional - select one</span>
          </div>
        </div>

        {/* Rating & Reviews */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Rating & Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min={0}
                max={5}
                step={0.1}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Count</label>
              <input
                type="number"
                name="reviews"
                value={formData.reviews}
                onChange={handleChange}
                min={0}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Features (Highlights)</h2>
          <div className="space-y-3">
            {formData.features.map((f, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700 flex-1">{f}</span>
                <button type="button" onClick={() => handleRemoveFeature(index)} className="text-red-500 hover:text-red-700 text-sm">
                  Remove
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                placeholder="Add feature line"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
              <button type="button" onClick={handleAddFeature} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Material, Color, Delivery, Warranty */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Attributes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                placeholder="e.g. Solid Wood"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                placeholder="e.g. Brown"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Condition</label>
              <input
                type="text"
                name="deliveryCondition"
                value={formData.deliveryCondition}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                placeholder="e.g. Knock Down"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warranty</label>
              <input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                placeholder="e.g. 1 year"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min={0}
                  step={0.1}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                  placeholder="0"
                />
                <select
                  name="weightUnit"
                  value={formData.weightUnit}
                  onChange={handleChange}
                  className="w-20 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dimensions (General)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
              <input
                type="text"
                name="dimensions.length"
                value={formData.dimensions.length}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <input
                type="text"
                name="dimensions.width"
                value={formData.dimensions.width}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input
                type="text"
                name="dimensions.height"
                value={formData.dimensions.height}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                name="dimensions.unit"
                value={formData.dimensions.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              >
                <option value="cm">cm</option>
                <option value="inch">inch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dimension Details (nested) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dimension Details (by variant/section)</h2>
          <div className="space-y-4">
            {formData.dimensionDetails.map((detail, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{detail.title || 'Untitled'}</span>
                  <button type="button" onClick={() => handleRemoveDimensionDetail(idx)} className="text-red-500 hover:text-red-700 text-sm">
                    Remove section
                  </button>
                </div>
                {(detail.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 py-1">
                    <span>{item.label}:</span>
                    <span>{item.value}</span>
                    <button type="button" onClick={() => handleRemoveDimensionDetailItem(idx, i)} className="text-red-500 ml-2">
                      ×
                    </button>
                  </div>
                ))}
                {dimDetailItemIndex === idx && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newDimDetailItem.label}
                      onChange={(e) => setNewDimDetailItem((p) => ({ ...p, label: e.target.value }))}
                      placeholder="Label"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded"
                    />
                    <input
                      type="text"
                      value={newDimDetailItem.value}
                      onChange={(e) => setNewDimDetailItem((p) => ({ ...p, value: e.target.value }))}
                      placeholder="Value"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded"
                    />
                    <button type="button" onClick={() => handleAddDimensionDetailItem(idx)} className="px-3 py-1.5 bg-gray-100 rounded">
                      Add item
                    </button>
                  </div>
                )}
                {dimDetailItemIndex !== idx && (
                  <button type="button" onClick={() => setDimDetailItemIndex(idx)} className="text-sm text-[#8b5e3c] hover:underline mt-2">
                    + Add row to this section
                  </button>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newDimDetailTitle}
                onChange={(e) => setNewDimDetailTitle(e.target.value)}
                placeholder="Section title (e.g. Overall Dimensions)"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
              <button type="button" onClick={handleAddDimensionDetail} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Add section
              </button>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Policies</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping</label>
              <textarea
                name="policies.shipping"
                value={formData.policies.shipping}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty (policy text)</label>
              <textarea
                name="policies.warranty"
                value={formData.policies.warranty}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancellations</label>
              <textarea
                name="policies.cancellations"
                value={formData.policies.cancellations}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Specifications</h2>
          <div className="space-y-4">
            {formData.specifications.map((spec, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{spec.key}:</span>
                <span className="text-gray-600">{spec.value}</span>
                <button type="button" onClick={() => handleRemoveSpec(index)} className="ml-auto text-red-500 hover:text-red-700">
                  Remove
                </button>
              </div>
            ))}
            <div className="flex gap-4">
              <input
                type="text"
                value={newSpec.key}
                onChange={(e) => setNewSpec((p) => ({ ...p, key: e.target.value }))}
                placeholder="Key"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
              <input
                type="text"
                value={newSpec.value}
                onChange={(e) => setNewSpec((p) => ({ ...p, value: e.target.value }))}
                placeholder="Value"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
              <button type="button" onClick={handleAddSpec} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Variants (Size / Configuration)</h2>
          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <div key={index} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{variant.name}</span>
                <span className="text-gray-600">₹{variant.price?.toLocaleString()}</span>
                {variant.originalPrice && <span className="text-gray-400 line-through text-sm">₹{variant.originalPrice?.toLocaleString()}</span>}
                {variant.dimensions && <span className="text-gray-500 text-sm">{variant.dimensions}</span>}
                <button type="button" onClick={() => handleRemoveVariant(index)} className="ml-auto text-red-500 hover:text-red-700">
                  Remove
                </button>
              </div>
            ))}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <input
                type="text"
                value={newVariant.name}
                onChange={(e) => setNewVariant((p) => ({ ...p, name: e.target.value }))}
                placeholder="Name (e.g. 3 Seater)"
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
              <input
                type="number"
                value={newVariant.price}
                onChange={(e) => setNewVariant((p) => ({ ...p, price: e.target.value }))}
                placeholder="Price"
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
              <input
                type="number"
                value={newVariant.originalPrice}
                onChange={(e) => setNewVariant((p) => ({ ...p, originalPrice: e.target.value }))}
                placeholder="Original price"
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
              <input
                type="text"
                value={newVariant.dimensions}
                onChange={(e) => setNewVariant((p) => ({ ...p, dimensions: e.target.value }))}
                placeholder="Dimensions"
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
              <input
                type="text"
                value={newVariant.image}
                onChange={(e) => setNewVariant((p) => ({ ...p, image: e.target.value }))}
                placeholder="Variant image URL"
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
              <button type="button" onClick={handleAddVariant} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 md:col-span-2">
                Add variant
              </button>
            </div>
          </div>
        </div>

        {/* Fabric Types */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Fabric Types</h2>
          <p className="text-sm text-gray-500 mb-2">Fabric names that can be selected for this product (e.g. KEIBA, MERRY). Must match fabric names in Fabrics list.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.fabricTypes.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                {f}
                <button type="button" onClick={() => handleRemoveFabricType(i)} className="text-red-500 hover:text-red-700">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFabricType}
              onChange={(e) => setNewFabricType(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFabricType())}
              placeholder="Fabric name"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
            />
            <button type="button" onClick={handleAddFabricType} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Add
            </button>
          </div>
          {fabrics.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">Available fabrics: {fabrics.map((f) => f.name || f).join(', ')}</p>
          )}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Fabric</label>
              <input
                type="text"
                name="defaultFabric"
                value={formData.defaultFabric}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                placeholder="e.g. KEIBA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Color (code)</label>
              <input
                type="text"
                name="defaultColor"
                value={formData.defaultColor}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                placeholder="e.g. 901"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Visibility</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="active"
                checked={formData.status === 'active'}
                onChange={handleChange}
                className="text-[#8b5e3c] focus:ring-[#8b5e3c]"
              />
              <span className="text-gray-700">Active (visible on store)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={formData.status === 'inactive'}
                onChange={handleChange}
                className="text-[#8b5e3c] focus:ring-[#8b5e3c]"
              />
              <span className="text-gray-700">Inactive (hidden)</span>
            </label>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{errors.submit}</div>
        )}

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#8b5e3c] text-white rounded-lg hover:bg-[#70482d] disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
            {isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
