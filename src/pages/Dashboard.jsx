import { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { dashboardAPI, ordersAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // Load stats
      const statsResponse = await dashboardAPI.getStats();
      if (statsResponse.success) {
        // Map backend data structure to frontend
        const data = statsResponse.data;
        setStats({
          totalOrders: data.orders?.total || 0,
          totalRevenue: data.revenue?.total || 0,
          pendingOrders: data.orders?.paid || 0,
          totalCustomers: data.customers?.total || 0,
        });

        // Set recent orders
        setRecentOrders(data.recentOrders || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setAlert({ message: 'Failed to load dashboard data', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRefresh = () => {
    loadDashboard();
    setAlert({ message: 'Dashboard refreshed', type: 'success' });
  };

  const handleActivateOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to activate this order?')) return;

    try {
      const response = await ordersAPI.activate(orderId, {
        notes: 'Order activated successfully'
      });

      if (response.success) {
        setAlert({ message: 'Order activated successfully', type: 'success' });
        loadDashboard();
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
        loadDashboard();
      }
    } catch (error) {
      setAlert({ message: 'Failed to decline order', type: 'danger' });
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="content-section">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Dashboard</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
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

      {/* Stats Cards */}
      <div className="row mb-4">
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon="fa-shopping-cart"
          color="primary"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon="fa-dollar-sign"
          color="success"
        />
        <StatsCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon="fa-clock"
          color="warning"
        />
        <StatsCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon="fa-users"
          color="info"
        />
      </div>

      {/* Recent Orders */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Recent Orders</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No recent orders
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.orderReference}</td>
                      <td>{order.customer?.name || 'N/A'}</td>
                      <td>{order.product?.name || 'N/A'}</td>
                      <td>{formatCurrency(order.amount)}</td>
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
                            </>
                          )}
                          <button className="btn btn-info btn-xs">
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
