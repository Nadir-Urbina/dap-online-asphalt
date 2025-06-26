'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';

interface ProductFormData {
  productId: string;
  type: 'tool' | 'equipment' | 'part' | 'supplies';
  name: string;
  description: string;
  price: number;
  stock: number;
  minStock?: number;
  category?: string;
  manufacturer?: string;
  imageUrl?: string;
  active: boolean;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'tool' | 'equipment' | 'part' | 'supplies' | 'low-stock'>('all');

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    productId: '',
    type: 'tool',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    minStock: 10,
    category: '',
    manufacturer: '',
    imageUrl: '',
    active: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        setError('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(editingProduct ? 'Product updated successfully' : 'Product created successfully');
        resetForm();
        fetchProducts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save product');
      }
    } catch (err) {
      setError('Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      productId: product.productId,
      type: product.type,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      minStock: product.minStock || 10,
      category: product.category || '',
      manufacturer: product.manufacturer || '',
      imageUrl: product.imageUrl || '',
      active: product.active,
    });
    setShowCreateForm(true);
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });

      if (response.ok) {
        setSuccess('Stock updated successfully');
        fetchProducts();
      } else {
        setError('Failed to update stock');
      }
    } catch (error) {
      setError('Failed to update stock');
    }
  };

  const handleDeactivate = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Product deactivated successfully');
        fetchProducts();
      } else {
        setError('Failed to deactivate product');
      }
    } catch (error) {
      setError('Failed to deactivate product');
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      type: 'tool',
      name: '',
      description: '',
      price: 0,
      stock: 0,
      minStock: 10,
      category: '',
      manufacturer: '',
      imageUrl: '',
      active: true,
    });
    setEditingProduct(null);
    setShowCreateForm(false);
  };

  const generateProductId = () => {
    const prefix = formData.type.toUpperCase().slice(0, 3);
    const randomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    setFormData({ ...formData, productId: `${prefix}-${randomId}` });
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    if (filter === 'low-stock') {
      const threshold = product.minStock || 10;
      return product.stock <= threshold;
    }
    return product.type === filter;
  });

  const lowStockCount = products.filter(product => {
    const threshold = product.minStock || 10;
    return product.stock <= threshold;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          {lowStockCount > 0 && (
            <p className="text-sm text-orange-600 mt-1">
              ⚠️ {lowStockCount} product{lowStockCount !== 1 ? 's' : ''} low in stock
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilter('tool')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'tool' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tools ({products.filter(p => p.type === 'tool').length})
          </button>
          <button
            onClick={() => setFilter('equipment')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'equipment' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Equipment ({products.filter(p => p.type === 'equipment').length})
          </button>
          <button
            onClick={() => setFilter('part')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'part' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Parts ({products.filter(p => p.type === 'part').length})
          </button>
          <button
            onClick={() => setFilter('supplies')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'supplies' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Supplies ({products.filter(p => p.type === 'supplies').length})
          </button>
          <button
            onClick={() => setFilter('low-stock')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'low-stock' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
        </div>
      </div>

      {/* Create/Edit Product Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product ID (SKU)</label>
                    <div className="flex mt-1">
                      <input
                        type="text"
                        value={formData.productId}
                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-l-md"
                        placeholder="TOOL-ABC123"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateProductId}
                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Product['type'] })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="tool">Tool</option>
                      <option value="equipment">Equipment</option>
                      <option value="part">Part</option>
                      <option value="supplies">Supplies</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Stock Alert</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 10 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Hand Tools, Power Tools, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Product is active
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filter === 'all' ? 'All Products' : 
             filter === 'low-stock' ? 'Low Stock Products' : 
             `${filter.charAt(0).toUpperCase() + filter.slice(1)} Products`}
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No products found. Create your first product to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const isLowStock = product.stock <= (product.minStock || 10);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {product.imageUrl ? (
                              <img
                                className="h-10 w-10 rounded object-cover"
                                src={product.imageUrl}
                                alt={product.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {product.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.productId}</div>
                            {product.manufacturer && (
                              <div className="text-xs text-gray-400">{product.manufacturer}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.type === 'tool' ? 'bg-blue-100 text-blue-800' :
                          product.type === 'equipment' ? 'bg-purple-100 text-purple-800' :
                          product.type === 'part' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.stock}
                          </span>
                          {isLowStock && (
                            <span className="text-xs text-red-500">⚠️ Low</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">Min: {product.minStock || 10}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const newStock = prompt(`Update stock for ${product.name}:`, product.stock.toString());
                            if (newStock !== null && !isNaN(parseInt(newStock))) {
                              handleStockUpdate(product.id!, parseInt(newStock));
                            }
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Stock
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to deactivate this product?')) {
                              handleDeactivate(product.id!);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          disabled={!product.active}
                        >
                          {product.active ? 'Deactivate' : 'Deactivated'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 