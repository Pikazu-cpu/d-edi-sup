import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import AdminLayout from '../../components/Layout/AdminLayout'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { useProducts } from '../../hooks/useProducts'
import { Product } from '../../lib/supabase'

const categories = [
  'electronics',
  'clothing',
  'home-garden',
  'sports-outdoors',
  'books',
  'toys-games',
  'health-beauty',
  'automotive'
]

const sampleImages = [
  'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/1598300/pexels-photo-1598300.jpeg?auto=compress&cs=tinysrgb&w=500'
]

export default function AdminProductForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { products, addProduct, updateProduct, loading } = useProducts()
  const [submitting, setSubmitting] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    shipping_charges: '',
    image_url: sampleImages[0],
    category: categories[0],
    sizes: [] as string[],
    colors: [] as string[],
    in_stock: true,
    rating: '4.5',
    reviews: '0',
    tags: [] as string[],
    featured: false
  })

  const isEditing = Boolean(id)

  useEffect(() => {
    if (isEditing && products.length > 0) {
      const foundProduct = products.find(p => p.id === id)
      if (foundProduct) {
        setProduct(foundProduct)
        setFormData({
          name: foundProduct.name,
          description: foundProduct.description,
          price: foundProduct.price.toString(),
          original_price: foundProduct.original_price?.toString() || '',
          shipping_charges: foundProduct.shipping_charges?.toString() || '',
          image_url: foundProduct.image_url,
          category: foundProduct.category,
          sizes: foundProduct.sizes,
          colors: foundProduct.colors,
          in_stock: foundProduct.in_stock,
          rating: foundProduct.rating.toString(),
          reviews: foundProduct.reviews.toString(),
          tags: foundProduct.tags,
          featured: foundProduct.featured
        })
      }
    }
  }, [isEditing, id, products])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        original_price: formData.original_price ? parseInt(formData.original_price) : undefined,
        shipping_charges: formData.shipping_charges ? parseInt(formData.shipping_charges) : 0,
        image_url: formData.image_url,
        category: formData.category,
        sizes: formData.sizes,
        colors: formData.colors,
        in_stock: formData.in_stock,
        rating: parseFloat(formData.rating),
        reviews: parseInt(formData.reviews),
        tags: formData.tags,
        featured: formData.featured
      }

      if (isEditing && id) {
        await updateProduct(id, productData)
      } else {
        await addProduct(productData)
      }

      navigate('/admin/products')
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleArrayInput = (field: 'sizes' | 'colors' | 'tags', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    setFormData({ ...formData, [field]: items })
  }

  if (loading && isEditing) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {isEditing ? 'Update product information' : 'Create a new product for your store'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Pricing</h3>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    id="original_price"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="shipping_charges" className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Charges (₹)
                  </label>
                  <input
                    type="number"
                    id="shipping_charges"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.shipping_charges}
                    onChange={(e) => setFormData({ ...formData, shipping_charges: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                Product Image *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    id="image_url"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  >
                    {sampleImages.map((url, index) => (
                      <option key={url} value={url}>
                        Sample Image {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <img
                    src={formData.image_url}
                    alt="Product preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sizes" className="block text-sm font-medium text-gray-700 mb-1">
                  Sizes (comma-separated)
                </label>
                <input
                  type="text"
                  id="sizes"
                  placeholder="S, M, L, XL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.sizes.join(', ')}
                  onChange={(e) => handleArrayInput('sizes', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-1">
                  Colors (comma-separated)
                </label>
                <input
                  type="text"
                  id="colors"
                  placeholder="Red, Blue, Green"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.colors.join(', ')}
                  onChange={(e) => handleArrayInput('colors', e.target.value)}
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  id="rating"
                  min="1"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="reviews" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Reviews
                </label>
                <input
                  type="number"
                  id="reviews"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.reviews}
                  onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="in_stock"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                  />
                  <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-900">
                    In Stock
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    Featured Product
                  </label>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                placeholder="trending, bestseller, new"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={formData.tags.join(', ')}
                onChange={(e) => handleArrayInput('tags', e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting && <LoadingSpinner size="sm" className="text-white" />}
                <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}