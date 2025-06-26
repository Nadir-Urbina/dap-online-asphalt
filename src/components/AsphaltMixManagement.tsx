'use client';

import React, { useState, useEffect } from 'react';
import { AsphaltMix } from '@/types';

interface MixFormData {
  mixId: string;
  type: string;
  name: string;
  description: string;
  pricePerTon: number;
  specifications: {
    aggregateSize: string;
    asphaltContent: number;
    voidRatio?: number;
    stability?: number;
    flow?: number;
    additives?: string[];
    gradation?: string;
  };
  performanceGrade?: string;
  applications?: string[];
  minimumTemperature?: number;
  maximumTemperature?: number;
  active: boolean;
  availableForOrders: boolean;
}

export default function AsphaltMixManagement() {
  const [mixes, setMixes] = useState<AsphaltMix[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMix, setEditingMix] = useState<AsphaltMix | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'inactive'>('all');

  // Form state
  const [formData, setFormData] = useState<MixFormData>({
    mixId: '',
    type: 'Superpave',
    name: '',
    description: '',
    pricePerTon: 0,
    specifications: {
      aggregateSize: '',
      asphaltContent: 0,
      additives: [],
    },
    performanceGrade: '',
    applications: [],
    minimumTemperature: 275,
    maximumTemperature: 325,
    active: true,
    availableForOrders: true,
  });

  useEffect(() => {
    fetchMixes();
  }, []);

  const fetchMixes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/asphalt-mixes');
      if (response.ok) {
        const data = await response.json();
        setMixes(data.mixes || []);
      } else {
        setError('Failed to load asphalt mixes');
      }
    } catch (error) {
      console.error('Error fetching mixes:', error);
      setError('Failed to load asphalt mixes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingMix ? `/api/admin/asphalt-mixes/${editingMix.id}` : '/api/admin/asphalt-mixes';
      const method = editingMix ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(editingMix ? 'Mix updated successfully' : 'Mix created successfully');
        resetForm();
        fetchMixes();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save mix');
      }
    } catch (err) {
      setError('Failed to save mix');
    }
  };

  const handleEdit = (mix: AsphaltMix) => {
    setEditingMix(mix);
    setFormData({
      mixId: mix.mixId,
      type: mix.type,
      name: mix.name,
      description: mix.description,
      pricePerTon: mix.pricePerTon,
      specifications: {
        aggregateSize: mix.specifications.aggregateSize,
        asphaltContent: mix.specifications.asphaltContent,
        voidRatio: mix.specifications.voidRatio,
        stability: mix.specifications.stability,
        flow: mix.specifications.flow,
        additives: mix.specifications.additives || [],
        gradation: mix.specifications.gradation,
      },
      performanceGrade: mix.performanceGrade || '',
      applications: mix.applications || [],
      minimumTemperature: mix.minimumTemperature || 275,
      maximumTemperature: mix.maximumTemperature || 325,
      active: mix.active,
      availableForOrders: mix.availableForOrders,
    });
    setShowCreateForm(true);
  };

  const handleAvailabilityToggle = async (mixId: string, available: boolean) => {
    try {
      const response = await fetch(`/api/admin/asphalt-mixes/${mixId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableForOrders: available }),
      });

      if (response.ok) {
        setSuccess('Availability updated successfully');
        fetchMixes();
      } else {
        setError('Failed to update availability');
      }
    } catch (error) {
      setError('Failed to update availability');
    }
  };

  const handleDeactivate = async (mixId: string) => {
    try {
      const response = await fetch(`/api/admin/asphalt-mixes/${mixId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Mix deactivated successfully');
        fetchMixes();
      } else {
        setError('Failed to deactivate mix');
      }
    } catch (error) {
      setError('Failed to deactivate mix');
    }
  };

  const resetForm = () => {
    setFormData({
      mixId: '',
      type: 'Superpave',
      name: '',
      description: '',
      pricePerTon: 0,
      specifications: {
        aggregateSize: '',
        asphaltContent: 0,
        additives: [],
      },
      performanceGrade: '',
      applications: [],
      minimumTemperature: 275,
      maximumTemperature: 325,
      active: true,
      availableForOrders: true,
    });
    setEditingMix(null);
    setShowCreateForm(false);
  };

  const generateMixId = () => {
    const prefix = formData.type === 'Superpave' ? 'SP' : 'HMA';
    const size = formData.specifications.aggregateSize || 'XX';
    setFormData({ ...formData, mixId: `${prefix}-${size}` });
  };

  const handleAdditive = (additive: string) => {
    if (additive.trim() && !formData.specifications.additives?.includes(additive.trim())) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          additives: [...(formData.specifications.additives || []), additive.trim()]
        }
      });
    }
  };

  const handleRemoveAdditive = (index: number) => {
    const newAdditives = [...(formData.specifications.additives || [])];
    newAdditives.splice(index, 1);
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        additives: newAdditives
      }
    });
  };

  const handleAddApplication = (application: string) => {
    if (application.trim() && !formData.applications?.includes(application.trim())) {
      setFormData({
        ...formData,
        applications: [...(formData.applications || []), application.trim()]
      });
    }
  };

  const handleRemoveApplication = (index: number) => {
    const newApplications = [...(formData.applications || [])];
    newApplications.splice(index, 1);
    setFormData({
      ...formData,
      applications: newApplications
    });
  };

  const filteredMixes = mixes.filter(mix => {
    if (filter === 'all') return true;
    if (filter === 'available') return mix.active && mix.availableForOrders;
    if (filter === 'inactive') return !mix.active;
    return true;
  });

  const availableCount = mixes.filter(mix => mix.active && mix.availableForOrders).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hot Asphalt Mix Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {availableCount} mix{availableCount !== 1 ? 'es' : ''} available for orders
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Mix
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
            All Mixes ({mixes.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Available ({availableCount})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Inactive ({mixes.filter(m => !m.active).length})
          </button>
        </div>
      </div>

      {/* Create/Edit Mix Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMix ? 'Edit Asphalt Mix' : 'Create New Asphalt Mix'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mix ID</label>
                    <div className="flex mt-1">
                      <input
                        type="text"
                        value={formData.mixId}
                        onChange={(e) => setFormData({ ...formData, mixId: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-l-md"
                        placeholder="SP-12.5"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateMixId}
                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mix Type</label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Superpave, Dense-graded, etc."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mix Name</label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Ton ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.pricePerTon}
                      onChange={(e) => setFormData({ ...formData, pricePerTon: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Performance Grade</label>
                    <input
                      type="text"
                      value={formData.performanceGrade}
                      onChange={(e) => setFormData({ ...formData, performanceGrade: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="PG 64-22"
                    />
                  </div>
                </div>

                {/* Mix Specifications */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Mix Specifications</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Aggregate Size</label>
                      <input
                        type="text"
                        value={formData.specifications.aggregateSize}
                        onChange={(e) => setFormData({
                          ...formData,
                          specifications: { ...formData.specifications, aggregateSize: e.target.value }
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="12.5mm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Asphalt Content (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={formData.specifications.asphaltContent}
                        onChange={(e) => setFormData({
                          ...formData,
                          specifications: { ...formData.specifications, asphaltContent: parseFloat(e.target.value) || 0 }
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Void Ratio (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={formData.specifications.voidRatio || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          specifications: { ...formData.specifications, voidRatio: parseFloat(e.target.value) || undefined }
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marshall Stability (lbs)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.specifications.stability || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          specifications: { ...formData.specifications, stability: parseInt(e.target.value) || undefined }
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marshall Flow (0.01")</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.specifications.flow || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          specifications: { ...formData.specifications, flow: parseFloat(e.target.value) || undefined }
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gradation</label>
                      <input
                        type="text"
                        value={formData.specifications.gradation || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          specifications: { ...formData.specifications, gradation: e.target.value }
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Dense, Gap, Open"
                      />
                    </div>
                  </div>
                </div>

                {/* Temperature Range */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Temperature Requirements</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Minimum Temperature (°F)</label>
                      <input
                        type="number"
                        min="200"
                        max="400"
                        value={formData.minimumTemperature}
                        onChange={(e) => setFormData({ ...formData, minimumTemperature: parseInt(e.target.value) || undefined })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Maximum Temperature (°F)</label>
                      <input
                        type="number"
                        min="200"
                        max="400"
                        value={formData.maximumTemperature}
                        onChange={(e) => setFormData({ ...formData, maximumTemperature: parseInt(e.target.value) || undefined })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Status</h4>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                        Mix is active
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="availableForOrders"
                        checked={formData.availableForOrders}
                        onChange={(e) => setFormData({ ...formData, availableForOrders: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="availableForOrders" className="ml-2 block text-sm text-gray-900">
                        Available for customer orders
                      </label>
                    </div>
                  </div>
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
                    {editingMix ? 'Update Mix' : 'Create Mix'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mixes Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filter === 'all' ? 'All Asphalt Mixes' : 
             filter === 'available' ? 'Available Mixes' : 
             'Inactive Mixes'}
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading mixes...</p>
          </div>
        ) : filteredMixes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No mixes found. Create your first asphalt mix to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mix Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specifications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
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
                {filteredMixes.map((mix) => (
                  <tr key={mix.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{mix.name}</div>
                        <div className="text-sm text-gray-500">{mix.mixId}</div>
                        <div className="text-xs text-gray-400">{mix.type}</div>
                        {mix.performanceGrade && (
                          <div className="text-xs text-blue-600">{mix.performanceGrade}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        <div>Size: {mix.specifications.aggregateSize}</div>
                        <div>AC: {mix.specifications.asphaltContent}%</div>
                        {mix.specifications.voidRatio && (
                          <div>Voids: {mix.specifications.voidRatio}%</div>
                        )}
                        {mix.specifications.additives && mix.specifications.additives.length > 0 && (
                          <div>Additives: {mix.specifications.additives.join(', ')}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${mix.pricePerTon.toFixed(2)}/ton
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          mix.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mix.active ? 'Active' : 'Inactive'}
                        </span>
                        {mix.active && (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            mix.availableForOrders ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {mix.availableForOrders ? 'Available' : 'Unavailable'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(mix)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      {mix.active && (
                        <button
                          onClick={() => handleAvailabilityToggle(mix.id!, !mix.availableForOrders)}
                          className={`${
                            mix.availableForOrders ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {mix.availableForOrders ? 'Hide' : 'Show'}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to deactivate this mix?')) {
                            handleDeactivate(mix.id!);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        disabled={!mix.active}
                      >
                        {mix.active ? 'Deactivate' : 'Deactivated'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}