import { useState } from 'react';
import { paymentsAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass, getPaymentMethodBadgeClass } from '../utils/helpers';

const PaymentDetailsModal = ({ payment, onClose, onUpdate }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const handleConfirmPaid = async () => {
    if (!window.confirm('Are you sure you want to mark this payment as paid? This action will update the order status.')) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setActionType('confirm');

      const response = await paymentsAPI.confirmPaid(payment.id, {
        transactionId: transactionId || undefined,
        notes: notes || 'Manually confirmed by admin',
      });

      if (response.success) {
        onUpdate(response.data.payment);
        setNotes('');
        setTransactionId('');
      }
    } catch (err) {
      setError(err.message || 'Failed to confirm payment');
    } finally {
      setProcessing(false);
      setActionType('');
    }
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      setError('Please provide a reason for the refund');
      return;
    }

    if (!window.confirm('Are you sure you want to refund this payment? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setActionType('refund');

      const response = await paymentsAPI.refund(payment.id, {
        reason: refundReason,
        notes: notes || undefined,
      });

      if (response.success) {
        onUpdate(response.data.payment);
        setNotes('');
        setRefundReason('');
      }
    } catch (err) {
      setError(err.message || 'Failed to process refund');
    } finally {
      setProcessing(false);
      setActionType('');
    }
  };

  const canConfirmPaid = payment.status === 'pending' || payment.status === 'processing' || payment.status === 'failed';
  const canRefund = payment.status === 'completed' && payment.canBeRefunded;

  // Parse metadata if available
  let metadata = null;
  try {
    metadata = payment.metadata ? JSON.parse(payment.metadata) : null;
  } catch (e) {
    // Invalid JSON, ignore
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-credit-card me-2"></i>
              Payment Details - {payment.paymentReference}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Payment Status */}
            <div className="card mb-3 border-left-primary">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Payment Status</div>
                    <span className={`badge ${getStatusBadgeClass(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Payment Amount</div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Payment Method</div>
                    <span className={`badge ${getPaymentMethodBadgeClass(payment.provider)}`}>
                      {payment.provider}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Payment Date</div>
                    <div className="text-sm">{formatDate(payment.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            {payment.order && (
              <div className="card mb-3 border-left-info">
                <div className="card-body">
                  <h6 className="font-weight-bold text-primary mb-3">
                    <i className="fas fa-shopping-cart me-2"></i>Order Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Order Reference</div>
                      <div className="text-sm">{payment.order.orderReference || 'N/A'}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Order Status</div>
                      <span className={`badge ${getStatusBadgeClass(payment.order.status)}`}>
                        {payment.order.status}
                      </span>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Product</div>
                      <div className="text-sm">{payment.order.product?.name || 'N/A'}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Order Amount</div>
                      <div className="text-sm">{formatCurrency(payment.order.amount)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information */}
            {payment.order?.customer && (
              <div className="card mb-3 border-left-success">
                <div className="card-body">
                  <h6 className="font-weight-bold text-primary mb-3">
                    <i className="fas fa-user me-2"></i>Customer Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Name</div>
                      <div className="text-sm">{payment.order.customer.name || 'N/A'}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Email</div>
                      <div className="text-sm">{payment.order.customer.email || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Phone</div>
                      <div className="text-sm">{payment.order.customer.phone || 'N/A'}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Platform</div>
                      <div className="text-sm">{payment.order.customer.platform || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Details */}
            <div className="card mb-3 border-left-warning">
              <div className="card-body">
                <h6 className="font-weight-bold text-primary mb-3">
                  <i className="fas fa-exchange-alt me-2"></i>Transaction Details
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Payment Reference</div>
                    <div className="text-sm font-weight-bold">{payment.paymentReference}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Transaction ID</div>
                    <div className="text-sm">{payment.transactionId || 'Not available'}</div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Payment URL</div>
                    <div className="text-sm" style={{ wordBreak: 'break-all' }}>
                      {payment.paymentUrl ? (
                        <a href={payment.paymentUrl} target="_blank" rel="noopener noreferrer">
                          View Payment
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Poll URL</div>
                    <div className="text-sm" style={{ wordBreak: 'break-all' }}>
                      {payment.pollUrl ? (
                        <a href={payment.pollUrl} target="_blank" rel="noopener noreferrer">
                          Check Status
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            {metadata && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="font-weight-bold text-primary mb-2">
                    <i className="fas fa-info-circle me-2"></i>Additional Information
                  </h6>
                  <pre className="bg-light p-2 rounded" style={{ fontSize: '0.75rem', maxHeight: '200px', overflow: 'auto' }}>
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Notes */}
            {payment.notes && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="font-weight-bold text-primary mb-2">
                    <i className="fas fa-sticky-note me-2"></i>Notes
                  </h6>
                  <div className="text-sm">{payment.notes}</div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="font-weight-bold text-primary mb-3">
                  <i className="fas fa-clock me-2"></i>Timeline
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Created At</div>
                    <div className="text-sm">{formatDate(payment.createdAt)}</div>
                  </div>
                  {payment.completedAt && (
                    <div className="col-md-6">
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Completed At</div>
                      <div className="text-sm">{formatDate(payment.completedAt)}</div>
                    </div>
                  )}
                </div>
                {payment.updatedAt && (
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Last Updated</div>
                      <div className="text-sm">{formatDate(payment.updatedAt)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            {/* Action Section */}
            {(canConfirmPaid || canRefund) && (
              <div className="card">
                <div className="card-body">
                  <h6 className="font-weight-bold text-primary mb-3">
                    <i className="fas fa-cog me-2"></i>Payment Actions
                  </h6>

                  {/* Notes Input */}
                  <div className="mb-3">
                    <label htmlFor="notes" className="form-label">
                      <i className="fas fa-sticky-note me-1"></i>
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      id="notes"
                      rows="2"
                      placeholder="Add notes about this action..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={processing}
                    ></textarea>
                  </div>

                  {/* Confirm Paid Section */}
                  {canConfirmPaid && (
                    <>
                      <div className="mb-3">
                        <label htmlFor="transactionId" className="form-label">
                          <i className="fas fa-hashtag me-1"></i>
                          Transaction ID (Optional)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="transactionId"
                          placeholder="Enter transaction ID if available"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          disabled={processing}
                        />
                      </div>

                      <button
                        className="btn btn-success me-2 mb-2"
                        onClick={handleConfirmPaid}
                        disabled={processing}
                      >
                        {processing && actionType === 'confirm' ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check-circle me-1"></i>
                            Mark as Paid
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {/* Refund Section */}
                  {canRefund && (
                    <>
                      <div className="mb-3 mt-3">
                        <label htmlFor="refundReason" className="form-label">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Refund Reason *
                        </label>
                        <textarea
                          className="form-control"
                          id="refundReason"
                          rows="2"
                          placeholder="Please provide a reason for the refund..."
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          disabled={processing}
                          required
                        ></textarea>
                      </div>

                      <button
                        className="btn btn-warning mb-2"
                        onClick={handleRefund}
                        disabled={processing || !refundReason.trim()}
                      >
                        {processing && actionType === 'refund' ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing Refund...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-undo me-1"></i>
                            Process Refund
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={processing}
            >
              <i className="fas fa-times me-1"></i>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;