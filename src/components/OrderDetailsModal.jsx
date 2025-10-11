import { useState } from 'react';
import { ordersAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/helpers';

const OrderDetailsModal = ({ order, onClose, onUpdate }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');
  const [activationCode, setActivationCode] = useState('');

  const handleAction = async (action) => {
    let confirmMessage = '';
    switch (action) {
      case 'activate':
        confirmMessage = 'Are you sure you want to activate this order?';
        break;
      case 'decline':
        confirmMessage = 'Are you sure you want to decline this order?';
        break;
      case 'wrong_serial':
        confirmMessage = 'Are you sure you want to mark this serial number as incorrect?';
        break;
      default:
        return;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setActionType(action);

      let response;
      const data = { notes };

      switch (action) {
        case 'activate':
          if (activationCode) {
            data.activationCode = activationCode;
          }
          response = await ordersAPI.activate(order.id, data);
          break;
        case 'decline':
          response = await ordersAPI.decline(order.id, data);
          break;
        case 'wrong_serial':
          response = await ordersAPI.wrongSerial(order.id, data);
          break;
      }

      if (response.success) {
        onUpdate(response.data.order);
        setNotes('');
        setActivationCode('');
      }
    } catch (err) {
      setError(err.message || `Failed to ${action} order`);
    } finally {
      setProcessing(false);
      setActionType('');
    }
  };

  const canActivate = order.status === 'paid' || order.status === 'processing';
  const canDecline = order.status === 'pending' || order.status === 'paid' || order.status === 'processing';
  const canMarkWrongSerial = order.status !== 'activated' && order.status !== 'declined' && order.status !== 'cancelled';

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-shopping-cart me-2"></i>
              Order Details - {order.orderReference}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Order Status */}
            <div className="card mb-3 border-left-primary">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Order Status</div>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Order Amount</div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {formatCurrency(order.amount)}
                    </div>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Order Date</div>
                    <div className="text-sm">{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Payment Method</div>
                    <div className="text-sm">{order.paymentMethod || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="card mb-3 border-left-info">
              <div className="card-body">
                <h6 className="font-weight-bold text-primary mb-3">
                  <i className="fas fa-user me-2"></i>Customer Information
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Name</div>
                    <div className="text-sm">{order.customer?.name || 'N/A'}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Email</div>
                    <div className="text-sm">{order.customer?.email || 'N/A'}</div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Phone</div>
                    <div className="text-sm">{order.customer?.phone || 'N/A'}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Platform</div>
                    <div className="text-sm">{order.customer?.platform || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="card mb-3 border-left-success">
              <div className="card-body">
                <h6 className="font-weight-bold text-primary mb-3">
                  <i className="fas fa-box me-2"></i>Product Information
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Product Name</div>
                    <div className="text-sm">{order.product?.name || 'N/A'}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Product Price</div>
                    <div className="text-sm">{formatCurrency(order.product?.price || 0)}</div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Description</div>
                    <div className="text-sm">{order.product?.description || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Serial Number Information */}
            <div className="card mb-3 border-left-warning">
              <div className="card-body">
                <h6 className="font-weight-bold text-primary mb-3">
                  <i className="fas fa-barcode me-2"></i>Serial Number Information
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Serial Number</div>
                    <div className="text-sm font-weight-bold">{order.serialNumber || 'Not provided'}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Serial Attempts</div>
                    <div className="text-sm">{order.serialAttempts || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activation Information */}
            {order.activationCode && (
              <div className="card mb-3 border-left-success">
                <div className="card-body">
                  <h6 className="font-weight-bold text-primary mb-3">
                    <i className="fas fa-key me-2"></i>Activation Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Activation Code</div>
                      <div className="text-sm font-weight-bold text-success">{order.activationCode}</div>
                    </div>
                    {order.activatedAt && (
                      <div className="col-md-6">
                        <div className="text-xs font-weight-bold text-uppercase mb-1">Activated At</div>
                        <div className="text-sm">{formatDate(order.activatedAt)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {order.adminNotes && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="font-weight-bold text-primary mb-2">
                    <i className="fas fa-sticky-note me-2"></i>Admin Notes
                  </h6>
                  <div className="text-sm">{order.adminNotes}</div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            {/* Action Section */}
            <div className="card">
              <div className="card-body">
                <h6 className="font-weight-bold text-primary mb-3">
                  <i className="fas fa-cog me-2"></i>Order Actions
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

                {/* Activation Code Input */}
                {canActivate && (
                  <div className="mb-3">
                    <label htmlFor="activationCode" className="form-label">
                      <i className="fas fa-key me-1"></i>
                      Activation Code (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="activationCode"
                      placeholder="Enter activation code if available"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      disabled={processing}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex gap-2 flex-wrap">
                  {canActivate && (
                    <button
                      className="btn btn-success"
                      onClick={() => handleAction('activate')}
                      disabled={processing}
                    >
                      {processing && actionType === 'activate' ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Activating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle me-1"></i>
                          Activate Order
                        </>
                      )}
                    </button>
                  )}

                  {canDecline && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleAction('decline')}
                      disabled={processing}
                    >
                      {processing && actionType === 'decline' ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Declining...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-times-circle me-1"></i>
                          Decline Order
                        </>
                      )}
                    </button>
                  )}

                  {canMarkWrongSerial && order.serialNumber && (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleAction('wrong_serial')}
                      disabled={processing}
                    >
                      {processing && actionType === 'wrong_serial' ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Wrong Serial Number
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
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

export default OrderDetailsModal;