import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import PaymentDetailsModal from '../components/PaymentDetailsModal';
import Pagination from '../components/Pagination';
import { paymentsAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass, getPaymentMethodBadgeClass } from '../utils/helpers';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });

  const loadPayments = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const params = { page, limit };
      const response = await paymentsAPI.getAll(params);
      if (response.success) {
        setPayments(response.data.payments || []);
        setPagination(response.data.pagination || { total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      setAlert({ message: 'Failed to load payments', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const handleMarkAsPaid = async (paymentId) => {
    if (!window.confirm('Are you sure you want to mark this payment as paid? This action will update the order status.')) {
      return;
    }

    try {
      setProcessingPaymentId(paymentId);
      const response = await paymentsAPI.confirmPaid(paymentId, {
        notes: 'Manually confirmed by admin',
      });

      if (response.success) {
        setAlert({ message: 'Payment marked as paid successfully', type: 'success' });
        await loadPayments(currentPage, itemsPerPage); // Reload payments to show updated status
      }
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      setAlert({
        message: error.message || 'Failed to mark payment as paid',
        type: 'danger'
      });
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleOpenDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedPayment(null);
  };

  const handlePaymentUpdate = (updatedPayment) => {
    // Update the payment in the list
    setPayments((prevPayments) =>
      prevPayments.map((payment) =>
        payment.id === updatedPayment.id ? updatedPayment : payment
      )
    );
    setAlert({ message: 'Payment updated successfully', type: 'success' });
  };

  useEffect(() => {
    loadPayments(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  return (
    <div className="content-section">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Payment Management</h1>
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
                    <th>Payment ID</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.paymentReference}</td>
                        <td>{payment.order?.orderReference || 'N/A'}</td>
                        <td>{payment.order?.customer?.name || 'N/A'}</td>
                        <td>{formatCurrency(payment.amount)}</td>
                        <td>
                          <span className={`badge ${getPaymentMethodBadgeClass(payment.provider)}`}>
                            {payment.provider}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td>{formatDate(payment.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-info btn-xs"
                              onClick={() => handleOpenDetails(payment)}
                            >
                              <i className="fas fa-eye"></i> View
                            </button>
                            {(payment.status === 'pending' || payment.status === 'processing' || payment.status === 'failed') && (
                              <button
                                className="btn btn-success btn-xs"
                                onClick={() => handleMarkAsPaid(payment.id)}
                                disabled={processingPaymentId === payment.id}
                              >
                                {processingPaymentId === payment.id ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-check"></i> Mark as Paid
                                  </>
                                )}
                              </button>
                            )}
                            {payment.status === 'completed' && payment.canBeRefunded && (
                              <button className="btn btn-warning btn-xs">
                                <i className="fas fa-undo"></i> Refund
                              </button>
                            )}
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

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={handleCloseDetails}
          onUpdate={handlePaymentUpdate}
        />
      )}
    </div>
  );
};

export default Payments;
