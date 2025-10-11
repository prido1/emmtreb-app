import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import WalletModal from '../components/WalletModal';
import { customersAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getAll();
      if (response && response.success) {
        setCustomers(response.data.customers || []);
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

  const handleWalletUpdate = (updatedWallet) => {
    // Update the customer in the list with new wallet data
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === selectedCustomer.id
          ? { ...customer, wallet: updatedWallet }
          : customer
      )
    );
    setAlert({ message: 'Wallet balance updated successfully', type: 'success' });
  };

  useEffect(() => {
    loadCustomers();
  }, []);

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
                              className="btn btn-primary btn-xs"
                              onClick={() => handleOpenWallet(customer)}
                            >
                              <i className="fas fa-wallet"></i> Wallet
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
    </div>
  );
};

export default Customers;
