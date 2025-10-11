import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { reportsAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [period, setPeriod] = useState('all');

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
  };

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
        <div className="row">
          <div className="col-md-6">
            <div className="card shadow mb-4">
              <div className="card-header">
                <h6 className="m-0 font-weight-bold text-primary">Sales Summary</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <strong>Total Sales:</strong>
                    <br />
                    <span className="h4 text-success">
                      {formatCurrency(reports?.summary?.totalRevenue || 0)}
                    </span>
                  </div>
                  <div className="col-6">
                    <strong>Total Orders:</strong>
                    <br />
                    <span className="h4 text-primary">{reports?.summary?.totalOrders || 0}</span>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-6">
                    <strong>Total Profit:</strong>
                    <br />
                    <span className="h4 text-info">
                      {formatCurrency(reports?.summary?.totalProfit || 0)}
                    </span>
                  </div>
                  <div className="col-6">
                    <strong>Avg Order:</strong>
                    <br />
                    <span className="h4 text-warning">
                      {formatCurrency(reports?.summary?.averageOrderValue || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow mb-4">
              <div className="card-header">
                <h6 className="m-0 font-weight-bold text-primary">Recent Orders</h6>
              </div>
              <div className="card-body">
                {reports?.orders && reports.orders.length > 0 ? (
                  <div className="table-responsive" style={{ maxHeight: '400px' }}>
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.orders.slice(0, 10).map((order) => (
                          <tr key={order.id}>
                            <td><small>{order.orderReference}</small></td>
                            <td><small>{order.customer?.name || 'N/A'}</small></td>
                            <td><small>{formatCurrency(order.amount)}</small></td>
                            <td>
                              <span className="badge bg-success">
                                <small>{order.status}</small>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
