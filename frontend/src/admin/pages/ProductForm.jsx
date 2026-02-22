import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminProductsAPI, adminCategoriesAPI, adminFabricsAPI, adminUploadAPI } from '../services/adminApi';

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
    sequenceNumber: '',
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
  const [newColorOption, setNewColorOption] = useState('');
  const [newFabricType, setNewFabricType] = useState('');
  const [newDimDetailTitle, setNewDimDetailTitle] = useState('');
  const [newDimDetailItem, setNewDimDetailItem] = useState({ label: '', value: '' });
  const [dimDetailItemIndex, setDimDetailItemIndex] = useState(null);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const mainImageInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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
          sequenceNumber: p.sequenceNumber !== undefined && p.sequenceNumber !== null ? p.sequenceNumber : '',
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

  const handleAddColorOption = () => {
    const trimmed = newColorOption.trim();
    if (trimmed && !formData.colorOptions.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, colorOptions: [...prev.colorOptions, trimmed] }));
      setNewColorOption('');
    }
  };

  const handleRemoveColorOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      colorOptions: prev.colorOptions.filter((_, i) => i !== index),
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

  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid image (JPEG, PNG, GIF, WebP)' }));
      return;
    }
    try {
      setUploadingMain(true);
      setErrors((prev) => ({ ...prev, image: '' }));
      const res = await adminUploadAPI.uploadImage(file);
      if (res.data?.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
      } else {
        setErrors((prev) => ({ ...prev, image: 'Upload failed' }));
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        image: err.response?.data?.message || 'Upload failed',
      }));
    } finally {
      setUploadingMain(false);
      if (mainImageInputRef.current) mainImageInputRef.current.value = '';
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const validFiles = Array.from(files).filter((f) =>
      /^image\/(jpeg|jpg|png|gif|webp)$/i.test(f.type)
    );
    if (validFiles.length === 0) {
      setErrors((prev) => ({ ...prev, images: 'Please select valid images (JPEG, PNG, GIF, WebP)' }));
      return;
    }
    try {
      setUploadingGallery(true);
      setErrors((prev) => ({ ...prev, images: '' }));
      const urls = [];
      for (const file of validFiles) {
        const res = await adminUploadAPI.uploadImage(file);
        if (res.data?.success && res.data?.url) urls.push(res.data.url);
      }
      if (urls.length) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        images: err.response?.data?.message || 'Upload failed',
      }));
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
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
      sequenceNumber: typeof formData.sequenceNumber === 'number' ? formData.sequenceNumber : (parseInt(formData.sequenceNumber, 10) || 0),
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

  const inputClass = (err) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] ${err ? 'border-red-500' : 'border-gray-200'}`;
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const sectionTitle = 'text-base font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200';

  return (
    <div className="bg-white min-h-[calc(100vh-5rem)] -mx-4 -my-4 px-4 py-6 pb-12 lg:-mx-6 lg:-my-6 lg:px-6 lg:py-6 border border-gray-200 rounded-xl shadow-md mx-5">
      <div className="w-full max-w-fullF">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic + Pricing + Category in one flow */}
        <div>
          <h2 className={sectionTitle}>Basic & pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3">
              <label className={labelClass}>Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass(errors.name)} placeholder="Enter product name" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div className="lg:col-span-3">
              <label className={labelClass}>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass(false)} placeholder="Enter product description" />
            </div>
            <div>
              <label className={labelClass}>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass(errors.category)}>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className={labelClass}>Price (₹) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} min={0} className={inputClass(errors.price)} placeholder="0" />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className={labelClass}>Original Price (₹)</label>
              <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} min={0} className={inputClass(false)} placeholder="MRP" />
            </div>
            <div>
              <label className={labelClass}>Stock Quantity</label>
              <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} min={0} className={inputClass(false)} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>SKU</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} className={inputClass(false)} placeholder="e.g. CW-SOFA-001" />
            </div>
            <div>
              <label className={labelClass}>Sequence Number</label>
              <input type="number" name="sequenceNumber" value={formData.sequenceNumber} onChange={handleChange} min={0} className={inputClass(false)} placeholder="0" title="Display order (lower = first)" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="inStock" checked={formData.inStock} onChange={(e) => setFormData((prev) => ({ ...prev, inStock: e.target.checked }))} className="rounded border-gray-300 text-[#8b5e3c] focus:ring-[#8b5e3c]" />
              <label htmlFor="inStock" className="text-sm font-medium text-gray-700">In Stock</label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <h2 className={sectionTitle}>Images</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3">
              <label className={labelClass}>Main Image *</label>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <input ref={mainImageInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleMainImageUpload} className="hidden" />
                <button type="button" onClick={() => mainImageInputRef.current?.click()} disabled={uploadingMain} className="px-4 py-2 bg-[#8b5e3c] text-white rounded-lg hover:bg-[#70482d] disabled:opacity-50 flex items-center gap-2 text-sm">
                  {uploadingMain ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Uploading…</>) : <>Upload from device</>}
                </button>
                <span className="text-sm text-gray-500">or paste URL below</span>
              </div>
              <input type="url" name="image" value={formData.image} onChange={handleChange} className={`${inputClass(errors.image)} mb-2`} placeholder="https://..." />
              {formData.image && <img src={formData.image} alt="Main" className="w-28 h-28 object-cover rounded-lg border mt-2" />}
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>
            <div className="lg:col-span-3">
              <label className={labelClass}>Additional Images</label>
              <input ref={galleryInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" multiple onChange={handleGalleryUpload} className="hidden" />
              <div className="flex flex-wrap gap-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                    <button type="button" onClick={() => handleImageRemove(index)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none opacity-0 group-hover:opacity-100">×</button>
                  </div>
                ))}
                <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={uploadingGallery} className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#8b5e3c] disabled:opacity-50 text-xs">
                  {uploadingGallery ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#8b5e3c] border-t-transparent" /> : <>+ Upload</>}
                </button>
                <button type="button" onClick={handleImageAdd} className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400 text-xs">URL</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tag + Rating */}
        <div>
          <h2 className={sectionTitle}>Tag & rating</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3">
              <label className={labelClass}>Tag (optional)</label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button key={tag} type="button" onClick={() => handleTagSelect(tag)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${formData.tag === tag ? 'bg-[#8b5e3c] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Rating (0-5)</label>
              <input type="number" name="rating" value={formData.rating} onChange={handleChange} min={0} max={5} step={0.1} className={inputClass(false)} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Review count</label>
              <input type="number" name="reviews" value={formData.reviews} onChange={handleChange} min={0} className={inputClass(false)} placeholder="0" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className={sectionTitle}>Features (highlights)</h2>
          <div className="space-y-2 mb-3">
            {formData.features.map((f, index) => (
              <div key={index} className="flex items-center gap-2 py-1.5 px-3 bg-gray-50 rounded-lg text-sm">
                <span className="flex-1 text-gray-700">{f}</span>
                <button type="button" onClick={() => handleRemoveFeature(index)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())} placeholder="Add feature" className={`flex-1 ${inputClass(false)}`} />
            <button type="button" onClick={handleAddFeature} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Add</button>
          </div>
        </div>

        {/* Attributes + Dimensions */}
        <div>
          <h2 className={sectionTitle}>Attributes & dimensions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Material</label>
              <input type="text" name="material" value={formData.material} onChange={handleChange} className={inputClass(false)} placeholder="e.g. Solid Wood" />
            </div>
            <div>
              <label className={labelClass}>Color</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} className={inputClass(false)} placeholder="e.g. Brown" />
            </div>
            <div className="lg:col-span-3">
              <label className={labelClass}>Color options (shown on product page)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.colorOptions.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-sm">
                    {c}
                    <button type="button" onClick={() => handleRemoveColorOption(i)} className="text-red-500 hover:text-red-700" aria-label="Remove">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColorOption}
                  onChange={(e) => setNewColorOption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColorOption())}
                  placeholder="e.g. Brown, Walnut, White"
                  className={`flex-1 max-w-xs ${inputClass(false)}`}
                />
                <button type="button" onClick={handleAddColorOption} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Add color</button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Warranty</label>
              <input type="text" name="warranty" value={formData.warranty} onChange={handleChange} className={inputClass(false)} placeholder="e.g. 1 year" />
            </div>
            <div>
              <label className={labelClass}>Delivery condition</label>
              <input type="text" name="deliveryCondition" value={formData.deliveryCondition} onChange={handleChange} className={inputClass(false)} placeholder="e.g. Knock Down" />
            </div>
            <div>
              <label className={labelClass}>Weight</label>
              <div className="flex gap-2">
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} min={0} step={0.1} className={`flex-1 ${inputClass(false)}`} placeholder="0" />
                <select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="w-16 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] text-sm">
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Length</label>
              <input type="text" name="dimensions.length" value={formData.dimensions.length} onChange={handleChange} className={inputClass(false)} />
            </div>
            <div>
              <label className={labelClass}>Width</label>
              <input type="text" name="dimensions.width" value={formData.dimensions.width} onChange={handleChange} className={inputClass(false)} />
            </div>
            <div>
              <label className={labelClass}>Height</label>
              <input type="text" name="dimensions.height" value={formData.dimensions.height} onChange={handleChange} className={inputClass(false)} />
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <select name="dimensions.unit" value={formData.dimensions.unit} onChange={handleChange} className={inputClass(false)}>
                <option value="cm">cm</option>
                <option value="inch">inch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dimension Details */}
        <div>
          <h2 className={sectionTitle}>Dimension details (by variant)</h2>
          <div className="space-y-3 mb-3">
            {formData.dimensionDetails.map((detail, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{detail.title || 'Untitled'}</span>
                  <button type="button" onClick={() => handleRemoveDimensionDetail(idx)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                </div>
                {(detail.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-600 py-0.5">
                    <span>{item.label}:</span>
                    <span>{item.value}</span>
                    <button type="button" onClick={() => handleRemoveDimensionDetailItem(idx, i)} className="text-red-500 ml-1">×</button>
                  </div>
                ))}
                {dimDetailItemIndex === idx && (
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={newDimDetailItem.label} onChange={(e) => setNewDimDetailItem((p) => ({ ...p, label: e.target.value }))} placeholder="Label" className={`flex-1 ${inputClass(false)} text-sm py-1.5`} />
                    <input type="text" value={newDimDetailItem.value} onChange={(e) => setNewDimDetailItem((p) => ({ ...p, value: e.target.value }))} placeholder="Value" className={`flex-1 ${inputClass(false)} text-sm py-1.5`} />
                    <button type="button" onClick={() => handleAddDimensionDetailItem(idx)} className="px-3 py-1.5 bg-gray-100 rounded text-sm">Add</button>
                  </div>
                )}
                {dimDetailItemIndex !== idx && (
                  <button type="button" onClick={() => setDimDetailItemIndex(idx)} className="text-sm text-[#8b5e3c] hover:underline mt-1">+ Add row</button>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <input type="text" value={newDimDetailTitle} onChange={(e) => setNewDimDetailTitle(e.target.value)} placeholder="Section title" className={`flex-1 ${inputClass(false)}`} />
              <button type="button" onClick={handleAddDimensionDetail} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Add section</button>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div>
          <h2 className={sectionTitle}>Policies</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Shipping</label>
              <textarea name="policies.shipping" value={formData.policies.shipping} onChange={handleChange} rows={2} className={inputClass(false)} />
            </div>
            <div>
              <label className={labelClass}>Warranty (policy)</label>
              <textarea name="policies.warranty" value={formData.policies.warranty} onChange={handleChange} rows={2} className={inputClass(false)} />
            </div>
            <div>
              <label className={labelClass}>Cancellations</label>
              <textarea name="policies.cancellations" value={formData.policies.cancellations} onChange={handleChange} rows={2} className={inputClass(false)} />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div>
          <h2 className={sectionTitle}>Specifications</h2>
          <div className="space-y-2 mb-3">
            {formData.specifications.map((spec, index) => (
              <div key={index} className="flex items-center gap-3 py-1.5 px-3 bg-gray-50 rounded-lg text-sm">
                <span className="font-medium text-gray-700">{spec.key}:</span>
                <span className="text-gray-600 flex-1">{spec.value}</span>
                <button type="button" onClick={() => handleRemoveSpec(index)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
              </div>
            ))}
            <div className="flex gap-2">
              <input type="text" value={newSpec.key} onChange={(e) => setNewSpec((p) => ({ ...p, key: e.target.value }))} placeholder="Key" className={inputClass(false)} />
              <input type="text" value={newSpec.value} onChange={(e) => setNewSpec((p) => ({ ...p, value: e.target.value }))} placeholder="Value" className={inputClass(false)} />
              <button type="button" onClick={handleAddSpec} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Add</button>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div>
          <h2 className={sectionTitle}>Variants (size / configuration)</h2>
          <div className="space-y-2 mb-3">
            {formData.variants.map((variant, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                <span className="font-medium text-gray-700">{variant.name}</span>
                <span className="text-gray-600">₹{variant.price?.toLocaleString()}</span>
                {variant.originalPrice && <span className="text-gray-400 line-through">₹{variant.originalPrice?.toLocaleString()}</span>}
                {variant.dimensions && <span className="text-gray-500">{variant.dimensions}</span>}
                <button type="button" onClick={() => handleRemoveVariant(index)} className="ml-auto text-red-500 hover:text-red-700 text-xs">Remove</button>
              </div>
            ))}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <input type="text" value={newVariant.name} onChange={(e) => setNewVariant((p) => ({ ...p, name: e.target.value }))} placeholder="Name (e.g. 3 Seater)" className={inputClass(false)} />
              <input type="number" value={newVariant.price} onChange={(e) => setNewVariant((p) => ({ ...p, price: e.target.value }))} placeholder="Price" className={inputClass(false)} />
              <input type="number" value={newVariant.originalPrice} onChange={(e) => setNewVariant((p) => ({ ...p, originalPrice: e.target.value }))} placeholder="Original price" className={inputClass(false)} />
              <input type="text" value={newVariant.dimensions} onChange={(e) => setNewVariant((p) => ({ ...p, dimensions: e.target.value }))} placeholder="Dimensions" className={inputClass(false)} />
              <input type="text" value={newVariant.image} onChange={(e) => setNewVariant((p) => ({ ...p, image: e.target.value }))} placeholder="Variant image URL" className={inputClass(false)} />
              <button type="button" onClick={handleAddVariant} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Add variant</button>
            </div>
          </div>
        </div>

        {/* Fabric Types + Status */}
        <div>
          <h2 className={sectionTitle}>Fabric & visibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3">
              <label className={labelClass}>Fabric types</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.fabricTypes.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 rounded-full text-sm">
                    {f}
                    <button type="button" onClick={() => handleRemoveFabricType(i)} className="text-red-500 hover:text-red-700">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newFabricType} onChange={(e) => setNewFabricType(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFabricType())} placeholder="Fabric name" className={`flex-1 ${inputClass(false)}`} />
                <button type="button" onClick={handleAddFabricType} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Add</button>
              </div>
              {fabrics.length > 0 && <p className="text-xs text-gray-400 mt-1">Available: {fabrics.map((f) => f.name || f).join(', ')}</p>}
            </div>
            <div>
              <label className={labelClass}>Default fabric</label>
              <input type="text" name="defaultFabric" value={formData.defaultFabric} onChange={handleChange} className={inputClass(false)} placeholder="e.g. KEIBA" />
            </div>
            <div>
              <label className={labelClass}>Default color (code)</label>
              <input type="text" name="defaultColor" value={formData.defaultColor} onChange={handleChange} className={inputClass(false)} placeholder="e.g. 901" />
            </div>
            <div>
              <label className={labelClass}>Visibility</label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="status" value="active" checked={formData.status === 'active'} onChange={handleChange} className="text-[#8b5e3c] focus:ring-[#8b5e3c]" />
                  Active
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="status" value="inactive" checked={formData.status === 'inactive'} onChange={handleChange} className="text-[#8b5e3c] focus:ring-[#8b5e3c]" />
                  Inactive
                </label>
              </div>
            </div>
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
    </div>
  );
};

export default ProductForm;
