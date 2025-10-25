import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import OrderDetailsModal from '../components/OrderDetailsModal';
import Pagination from '../components/Pagination';
import DateRangePicker from '../components/DateRangePicker';
import { ordersAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass, getPaymentMethodBadgeClass } from '../utils/helpers';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });

  const loadOrders = async (status = 'all', search = '', page = 1, limit = 20, start = '', end = '') => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (status !== 'all') {
        params.status = status;
      }
      if (search) {
        params.search = search;
      }
      if (start && end) {
        params.startDate = start;
        params.endDate = end;
      }

      const response = await ordersAPI.getAll(params);
      if (response.success) {
        setOrders(response.data.orders || []);
        setPagination(response.data.pagination || { total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setAlert({ message: 'Failed to load orders', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(filter, searchTerm, currentPage, itemsPerPage, startDate, endDate);
  }, [filter, currentPage, itemsPerPage, startDate, endDate]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleRefresh = () => {
    loadOrders(filter, searchTerm, currentPage, itemsPerPage, startDate, endDate);
    setAlert({ message: 'Orders refreshed', type: 'success' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadOrders(filter, searchTerm, 1, itemsPerPage, startDate, endDate);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    loadOrders(filter, '', 1, itemsPerPage, startDate, endDate);
  };

  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
    loadOrders(filter, searchTerm, 1, itemsPerPage, start, end);
  };

  const handleClearDateRange = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    loadOrders(filter, searchTerm, 1, itemsPerPage, '', '');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const handleActivateOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to activate this order?')) return;

    try {
      const response = await ordersAPI.activate(orderId, {
        notes: 'Order activated successfully'
      });

      if (response.success) {
        setAlert({ message: 'Order activated successfully', type: 'success' });
        loadOrders(filter, searchTerm, currentPage, itemsPerPage, startDate, endDate);
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
        loadOrders(filter, searchTerm, currentPage, itemsPerPage, startDate, endDate);
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
        loadOrders(filter, searchTerm, currentPage, itemsPerPage, startDate, endDate);
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
      <div className="pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2 mb-3">Order Management</h1>
        <div className="d-flex justify-content-between flex-wrap align-items-center mb-3">
          <div className="col-md-3 mb-2">
            <label className="form-label small">Filter by Status</label>
            <select
              className="form-select form-select-sm"
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="activated">Activated</option>
              <option value="declined">Declined</option>
              <option value="wrong_serial">Wrong Serial</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="mb-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleRefresh}
            >
              <i className="fas fa-sync-alt me-1"></i>Refresh
            </button>
          </div>
        </div>
      </div>

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search Bar and Date Range */}
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
                  placeholder="Search by Order ID..."
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
            <div className="col-12">
              <hr className="my-2" />
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={handleDateRangeChange}
                onClear={handleClearDateRange}
                showPresets={true}
              />
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
