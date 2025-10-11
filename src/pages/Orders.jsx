import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { ordersAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass, getPaymentMethodBadgeClass } from '../utils/helpers';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadOrders = async (status = 'all') => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (status !== 'all') {
        params.status = status;
      }

      const response = await ordersAPI.getAll(params);
      if (response.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setAlert({ message: 'Failed to load orders', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(filter);
  }, [filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleRefresh = () => {
    loadOrders(filter);
    setAlert({ message: 'Orders refreshed', type: 'success' });
  };

  const handleActivateOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to activate this order?')) return;

    try {
      const response = await ordersAPI.activate(orderId, {
        notes: 'Order activated successfully'
      });

      if (response.success) {
        setAlert({ message: 'Order activated successfully', type: 'success' });
        loadOrders(filter);
      }
    } catch (error) {
      setAlert({ message: 'Failed to activate order', type: 'danger' });
    }
  };

  const handleDeclineOrder = async (orderId) => {
    const reason = window.prompt('Please enter the reason for declining this order:');
    if (!reason) return;

    try {
      const response = await ordersAPI.decline(orderId, {
        reason,
        notes: `Order declined: ${reason}`
      });

      if (response.success) {
        setAlert({ message: 'Order declined successfully', type: 'success' });
        loadOrders(filter);
      }
    } catch (error) {
      setAlert({ message: 'Failed to decline order', type: 'danger' });
    }
  };

  const handleWrongSerial = async (orderId) => {
    const message = window.prompt(
      'Enter message for customer about wrong serial number:',
      'The serial number you provided is incorrect. Please provide the correct serial number.'
    );
    if (!message) return;

    try {
      const response = await ordersAPI.wrongSerial(orderId, {
        message,
        notes: 'Wrong serial number - customer notified'
      });

      if (response.success) {
        setAlert({ message: 'Customer notified about wrong serial number', type: 'success' });
        loadOrders(filter);
      }
    } catch (error) {
      setAlert({ message: 'Failed to process request', type: 'danger' });
    }
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdate = (updatedOrder) => {
    // Update the order in the list
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    setAlert({ message: 'Order updated successfully', type: 'success' });
  };

  return (
    <div className="content-section">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Order Management</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${filter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-warning ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => handleFilterChange('pending')}
            >
              Pending
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-success ${filter === 'paid' ? 'active' : ''}`}
              onClick={() => handleFilterChange('paid')}
            >
              Paid
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-primary ${filter === 'activated' ? 'active' : ''}`}
              onClick={() => handleFilterChange('activated')}
            >
              Activated
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-danger ${filter === 'declined' ? 'active' : ''}`}
              onClick={() => handleFilterChange('declined')}
            >
              Declined
            </button>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleRefresh}
          >
            <i className="fas fa-sync-alt me-1"></i>Refresh
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
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Serial Number</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.orderReference}</td>
                        <td>
                          <div>{order.customer?.name || 'N/A'}</div>
                          <small className="text-muted">{order.customer?.phoneNumber || ''}</small>
                        </td>
                        <td>{order.product?.name || 'N/A'}</td>
                        <td>{order.serialNumber || 'N/A'}</td>
                        <td>{formatCurrency(order.amount)}</td>
                        <td>
                          <span className={`badge ${getPaymentMethodBadgeClass(order.paymentMethod)}`}>
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            {order.status === 'paid' && (
                              <>
                                <button
                                  className="btn btn-success btn-xs"
                                  onClick={() => handleActivateOrder(order.id)}
                                >
                                  <i className="fas fa-check"></i> Activate
                                </button>
                                <button
                                  className="btn btn-danger btn-xs"
                                  onClick={() => handleDeclineOrder(order.id)}
                                >
                                  <i className="fas fa-times"></i> Decline
                                </button>
                                <button
                                  className="btn btn-warning btn-xs"
                                  onClick={() => handleWrongSerial(order.id)}
                                >
                                  <i className="fas fa-exclamation"></i> Wrong SN
                                </button>
                              </>
                            )}
                            <button
                              className="btn btn-info btn-xs"
                              onClick={() => handleOpenDetails(order)}
                            >
                              <i className="fas fa-eye"></i> View
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

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseDetails}
          onUpdate={handleOrderUpdate}
        />
      )}
    </div>
  );
};

export default Orders;
