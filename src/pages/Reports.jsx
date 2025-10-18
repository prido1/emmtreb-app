import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Pagination from '../components/Pagination';
import { reportsAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [period, setPeriod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const loadReports = async (selectedPeriod) => {
    try {
      setLoading(true);
      // Use 'sales' report type which gives us the summary we need
      const response = await reportsAPI.get('sales', { period: selectedPeriod });
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      setAlert({ message: 'Failed to load reports', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(period);
  }, [period]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setCurrentPage(1); // Reset to first page when period changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Calculate paginated orders
  const getPaginatedOrders = () => {
    if (!reports?.orders) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return reports.orders.slice(startIndex, endIndex);
  };

  const totalOrders = reports?.orders?.length || 0;
  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  return (
    <div className="content-section">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Reports & Analytics</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${period === 'today' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('today')}
            >
              Today
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${period === 'week' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('week')}
            >
              This Week
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${period === 'month' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('month')}
            >
              This Month
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${period === 'all' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('all')}
            >
              All Time
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

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div>
          {/* Summary Cards Row */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card shadow h-100">
                <div className="card-body">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Revenue
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-success">
                    {formatCurrency(reports?.summary?.totalRevenue || 0)}
                  </div>
                  <small className="text-muted">
                    {reports?.summary?.activatedOrders || 0} activated orders
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow h-100">
                <div className="card-body">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Profit
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-success">
                    {formatCurrency(reports?.summary?.totalProfit || 0)}
                  </div>
                  <small className="text-muted">
                    {reports?.summary?.profitMargin?.toFixed(2) || 0}% margin
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow h-100">
                <div className="card-body">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Total Cost
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-info">
                    {formatCurrency(reports?.summary?.totalCost || 0)}
                  </div>
                  <small className="text-muted">Product base costs</small>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow h-100">
                <div className="card-body">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Total Orders
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-primary">
                    {reports?.summary?.totalOrders || 0}
                  </div>
                  <small className="text-muted">
                    Avg: {formatCurrency(reports?.summary?.averageOrderValue || 0)}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics Row */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-header">
                  <h6 className="m-0 font-weight-bold text-primary">Profit Analysis</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Average Profit per Order</span>
                      <strong className="text-success">
                        {formatCurrency(reports?.summary?.averageProfit || 0)}
                      </strong>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Profit Margin</span>
                      <strong className="text-info">
                        {reports?.summary?.profitMargin?.toFixed(2) || 0}%
                      </strong>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-info"
                        role="progressbar"
                        style={{ width: `${Math.min(reports?.summary?.profitMargin || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <hr />

                  <div className="row text-center">
                    <div className="col-6 border-end">
                      <div className="text-muted small">Revenue</div>
                      <div className="h6 mb-0 text-success">
                        {formatCurrency(reports?.summary?.totalRevenue || 0)}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted small">Cost</div>
                      <div className="h6 mb-0 text-danger">
                        {formatCurrency(reports?.summary?.totalCost || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-header">
                  <h6 className="m-0 font-weight-bold text-primary">Order Statistics</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Total Orders</span>
                      <strong>{reports?.summary?.totalOrders || 0}</strong>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Activated Orders</span>
                      <strong className="text-success">
                        {reports?.summary?.activatedOrders || 0}
                      </strong>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Pending Orders</span>
                      <strong className="text-warning">
                        {(reports?.summary?.totalOrders || 0) - (reports?.summary?.activatedOrders || 0)}
                      </strong>
                    </div>
                  </div>

                  <hr />

                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Average Order Value</span>
                      <strong className="text-primary">
                        {formatCurrency(reports?.summary?.averageOrderValue || 0)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-header">
                  <h6 className="m-0 font-weight-bold text-primary">Recent Orders</h6>
                </div>
                <div className="card-body">
                  {reports?.orders && reports.orders.length > 0 ? (
                    <>
                      <div className="table-responsive">
                        <table className="table table-striped table-hover">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer</th>
                              <th>Product</th>
                              <th>Revenue</th>
                              <th>Cost</th>
                              <th>Profit</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPaginatedOrders().map((order) => (
                              <tr key={order.id}>
                                <td><small>{order.orderReference}</small></td>
                                <td><small>{order.customer?.name || 'N/A'}</small></td>
                                <td><small>{order.product?.name || 'N/A'}</small></td>
                                <td><small className="text-success">{formatCurrency(order.amount)}</small></td>
                                <td><small className="text-danger">{formatCurrency(order.cost || 0)}</small></td>
                                <td>
                                  <small className={order.profit > 0 ? 'text-success fw-bold' : 'text-muted'}>
                                    {formatCurrency(order.profit || 0)}
                                  </small>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    order.status === 'activated' ? 'bg-success' :
                                    order.status === 'paid' ? 'bg-info' :
                                    order.status === 'pending' ? 'bg-warning' :
                                    'bg-secondary'
                                  }`}>
                                    <small>{order.status}</small>
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalOrders > 0 && (
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalItems={totalOrders}
                          itemsPerPage={itemsPerPage}
                          onPageChange={handlePageChange}
                          onItemsPerPageChange={handleItemsPerPageChange}
                        />
                      )}
                    </>
                  ) : (
                    <p className="text-muted text-center">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
