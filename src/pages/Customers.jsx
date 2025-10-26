import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import WalletModal from '../components/WalletModal';
import EditCustomerModal from '../components/EditCustomerModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'; // New import
import Pagination from '../components/Pagination';
import { customersAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // New state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });

  const loadCustomers = async (search = '', page = 1, limit = 20) => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) {
        params.search = search;
      }
      const response = await customersAPI.getAll(params);
      if (response && response.success) {
        setCustomers(response.data.customers || []);
        setPagination(response.data.pagination || { total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setAlert({ message: 'Failed to load customers', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWallet = (customer) => {
    setSelectedCustomer(customer);
    setShowWalletModal(true);
  };

  const handleCloseWallet = () => {
    setShowWalletModal(false);
    setSelectedCustomer(null);
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedCustomer(null);
  };

  const handleCustomerUpdate = (updatedCustomer) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
    setAlert({ message: 'Customer updated successfully', type: 'success' });
    handleCloseEdit();
  };

  const handleOpenDelete = (customer) => { // New function
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleCloseDelete = () => { // New function
    setShowDeleteModal(false);
    setSelectedCustomer(null);
  };

  const handleDeleteConfirm = async () => { // New function
    if (!selectedCustomer) return;

    setLoading(true);
    setAlert(null);

    try {
      const response = await customersAPI.delete(selectedCustomer.id);
      if (response && response.success) {
        setCustomers((prevCustomers) =>
          prevCustomers.filter((customer) => customer.id !== selectedCustomer.id)
        );
        setAlert({ message: 'Customer deleted successfully', type: 'success' });
        loadCustomers(searchTerm, currentPage, itemsPerPage); // Reload to update pagination/list
      } else {
        setAlert({ message: response.message || 'Failed to delete customer', type: 'danger' });
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      setAlert({ message: error.message || 'Failed to delete customer', type: 'danger' });
    } finally {
      setLoading(false);
      handleCloseDelete();
    }
  };

  const handleWalletUpdate = (updatedWallet) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === selectedCustomer.id
          ? { ...customer, wallet: updatedWallet }
          : customer
      )
    );
    setAlert({ message: 'Wallet balance updated successfully', type: 'success' });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCustomers(searchTerm, 1, itemsPerPage);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    loadCustomers('', 1, itemsPerPage);
  };

  useEffect(() => {
    loadCustomers(searchTerm, currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  return (
    <div className="content-section">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Customer Management</h1>
      </div>

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search Bar */}
      <div className="card shadow mb-3">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-10">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by phone number or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary flex-fill">
                  Search
                </button>
                {searchTerm && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClearSearch}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

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
                    <th>Phone</th>
                    <th>Platform</th>
                    <th>Wallet Balance</th>
                    <th>Total Orders</th>
                    <th>Total Spent</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <div>{customer.name || 'N/A'}</div>
                          <small className="text-muted">{customer.email || ''}</small>
                        </td>
                        <td>{customer.phoneNumber}</td>
                        <td>
                          <span className="badge bg-info">{customer.platform || 'Web'}</span>
                        </td>
                        <td>{formatCurrency(customer.wallet?.balance || 0)}</td>
                        <td>{customer.totalOrders || 0}</td>
                        <td>{formatCurrency(customer.totalSpent || 0)}</td>
                        <td>
                          <span className={`badge bg-${customer.isActive ? 'success' : 'danger'}`}>
                            {customer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{formatDate(customer.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-primary btn-xs me-2"
                              onClick={() => handleOpenEdit(customer)}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button
                              className="btn btn-info btn-xs me-2"
                              onClick={() => handleOpenWallet(customer)}
                            >
                              <i className="fas fa-wallet"></i> Wallet
                            </button>
                            <button
                              className="btn btn-danger btn-xs"
                              onClick={() => handleOpenDelete(customer)}
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.total > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      </div>

      {/* Wallet Modal */}
      {showWalletModal && selectedCustomer && (
        <WalletModal
          wallet={selectedCustomer.wallet}
          customer={selectedCustomer}
          onClose={handleCloseWallet}
          onUpdate={handleWalletUpdate}
        />
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <EditCustomerModal
          customer={selectedCustomer}
          onClose={handleCloseEdit}
          onUpdate={handleCustomerUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCustomer && (
        <DeleteConfirmationModal
          customer={selectedCustomer}
          onClose={handleCloseDelete}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default Customers;
