import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminCategoriesAPI } from '../services/adminApi';

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    sortOrder: '0',
    status: 'active',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await adminCategoriesAPI.getAll();
      if (response.data.success) {
        const list = response.data.data || [];
        const category = list.find((c) => c._id === id);
        if (category) {
          setFormData({
            name: category.name || '',
            image: category.image || '',
            sortOrder: category.sortOrder !== undefined && category.sortOrder !== null ? String(category.sortOrder) : '0',
            status: category.status === 'inactive' || category.isActive === false ? 'inactive' : 'active',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        description: '',
        image: formData.image || '',
        sortOrder: formData.sortOrder !== '' ? Number(formData.sortOrder) : 0,
        status: formData.status,
      };
      if (isEdit) {
        await adminCategoriesAPI.update(id, payload);
      } else {
        await adminCategoriesAPI.create(payload);
      }
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to save category' });
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

  return (
    <div className="bg-white min-h-[calc(100vh-5rem)] -mx-4 -my-4 px-4 py-6 lg:-mx-6 lg:-my-6 lg:px-6 lg:py-6 border border-gray-200 rounded-xl shadow-md">
      <div className="w-full max-w-lg">
      <button
        onClick={() => navigate('/admin/categories')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Categories
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Category' : 'Add New Category'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className={inputClass(errors.name)}
            placeholder="e.g. Sofas"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
            className={inputClass(false)}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input
            type="number"
            min={0}
            value={formData.sortOrder}
            onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: e.target.value }))}
            className={inputClass(false)}
            placeholder="0"
          />
          <p className="text-xs text-gray-400 mt-1">Lower numbers appear first in navbar</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
            className={inputClass(false)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {errors.submit && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{errors.submit}</div>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/categories')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[#8b5e3c] text-white rounded-lg hover:bg-[#70482d] disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
            {isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default CategoryForm;
