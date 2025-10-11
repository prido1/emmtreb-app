import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { productsAPI } from '../services/api';
import { formatCurrency, calculateProfit } from '../utils/helpers';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'server_renewal',
    basePrice: '',
    sellingPrice: '',
    requiresSerialNumber: true,
    requiresUsername: false,
    instructions: '',
    trackStock: false,
    stockQuantity: 0,
    isActive: true,
  });

  const categories = [
    { value: 'server_renewal', label: 'Server Renewal' },
    { value: 'activation', label: 'Activation' },
    { value: 'subscriptions', label: 'Subscriptions' },
    { value: 'airtime', label: 'Mobile Airtime' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'internet', label: 'Internet Services' },
    { value: 'entertainment', label: 'Entertainment' },
  ];

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setAlert({ message: 'Failed to load products', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggleStatus = async (productId, isActive) => {
    try {
      const response = await productsAPI.update(productId, { isActive });

      if (response.success) {
        setAlert({
          message: `Product ${isActive ? 'enabled' : 'disabled'} successfully`,
          type: 'success'
        });
        loadProducts();
      }
    } catch (error) {
      setAlert({ message: 'Failed to update product status', type: 'danger' });
    }
  };

  const handleShowAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'server_renewal',
      basePrice: '',
      sellingPrice: '',
      requiresSerialNumber: true,
      requiresUsername: false,
      instructions: '',
      trackStock: false,
      stockQuantity: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleShowEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      basePrice: product.basePrice,
      sellingPrice: product.sellingPrice,
      requiresSerialNumber: product.requiresSerialNumber,
      requiresUsername: product.requiresUsername || false,
      instructions: product.instructions || '',
      trackStock: product.trackStock,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate prices
    if (parseFloat(formData.sellingPrice) < parseFloat(formData.basePrice)) {
      setAlert({ message: 'Selling price cannot be less than base price', type: 'danger' });
      return;
    }

    try {
      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        stockQuantity: parseInt(formData.stockQuantity) || 0,
      };

      let response;
      if (editingProduct) {
        response = await productsAPI.update(editingProduct.id, productData);
      } else {
        response = await productsAPI.create(productData);
      }

      if (response.success) {
        setAlert({
          message: `Product ${editingProduct ? 'updated' : 'created'} successfully`,
          type: 'success'
        });
        handleCloseModal();
        loadProducts();
      }
    } catch (error) {
      setAlert({
        message: error.message || `Failed to ${editingProduct ? 'update' : 'create'} product`,
        type: 'danger'
      });
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await productsAPI.delete(productId);
      if (response.success) {
        setAlert({ message: 'Product deleted successfully', type: 'success' });
        loadProducts();
      }
    } catch (error) {
      setAlert({ message: 'Failed to delete product', type: 'danger' });
    }
  };

  return (
    <>
    <div className="content-section">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Product Management</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <button type="button" className="btn btn-sm btn-primary" onClick={handleShowAddModal}>
            <i className="fas fa-plus me-1"></i>Add Product
          </button>
        </div>
      </div>

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="card shadow">
        <div className="card-body">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Base Price</th>
                    <th>Selling Price</th>
                    <th>Profit</th>
                    <th>Serial Required</th>
                    <th>Username Required</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const { profit, profitPercent } = calculateProfit(
                        product.sellingPrice,
                        product.basePrice
                      );

                      return (
                        <tr key={product.id}>
                          <td>
                            <div>{product.name}</div>
                            <small className="text-muted">{product.description || ''}</small>
                          </td>
                          <td>
                            <span className="badge bg-secondary">{product.category}</span>
                          </td>
                          <td>{formatCurrency(product.basePrice)}</td>
                          <td>{formatCurrency(product.sellingPrice)}</td>
                          <td>
                            <span className="text-success">{formatCurrency(profit)}</span>
                            <small className="text-muted"> ({profitPercent}%)</small>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${product.requiresSerialNumber ? 'warning' : 'secondary'}`}
                            >
                              {product.requiresSerialNumber ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${product.requiresUsername ? 'info' : 'secondary'}`}
                            >
                              {product.requiresUsername ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${product.isActive ? 'success' : 'danger'}`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-primary btn-xs"
                                onClick={() => handleShowEditModal(product)}
                              >
                                <i className="fas fa-edit"></i> Edit
                              </button>
                              <button
                                className={`btn btn-${product.isActive ? 'warning' : 'success'} btn-xs`}
                                onClick={() => handleToggleStatus(product.id, !product.isActive)}
                              >
                                <i className={`fas fa-${product.isActive ? 'pause' : 'play'}`}></i>{' '}
                                {product.isActive ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                className="btn btn-danger btn-xs"
                                onClick={() => handleDelete(product.id)}
                              >
                                <i className="fas fa-trash"></i> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Product Modal */}
    {showModal && (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h5>
              <button type="button" className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Base Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Selling Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Instructions</label>
                    <textarea
                      className="form-control"
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="requiresSerialNumber"
                        checked={formData.requiresSerialNumber}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">Requires Serial Number</label>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="requiresUsername"
                        checked={formData.requiresUsername}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">Requires Username</label>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="trackStock"
                        checked={formData.trackStock}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">Track Stock</label>
                    </div>
                  </div>
                  {formData.trackStock && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Stock Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                  <div className="col-md-6 mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">Active</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Products;
