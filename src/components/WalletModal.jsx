import { useState } from 'react';
import { walletsAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const WalletModal = ({ wallet, customer, onClose, onUpdate }) => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddBalance = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await walletsAPI.addBalance(customer.id, {
        amount: parseFloat(amount),
        notes: notes || 'Manual balance addition by admin',
      });

      if (response.success) {
        onUpdate(response.data.wallet);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to add balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-wallet me-2"></i>
              Wallet Management - {customer?.name}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Wallet Info */}
            <div className="card mb-3 border-left-success">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                      Current Balance
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {formatCurrency(wallet?.balance || 0)}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                      Total Deposits
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {formatCurrency(wallet?.totalDeposits || 0)}
                    </div>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-6">
                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                      Total Spent
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {formatCurrency(wallet?.totalSpent || 0)}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                      Last Transaction
                    </div>
                    <div className="text-xs text-gray-800">
                      {wallet?.lastTransactionAt
                        ? new Date(wallet.lastTransactionAt).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Balance Form */}
            <form onSubmit={handleAddBalance}>
              <div className="mb-3">
                <label htmlFor="amount" className="form-label">
                  <i className="fas fa-dollar-sign me-1"></i>
                  Add Balance Amount *
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="amount"
                  placeholder="Enter amount to add"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0.01"
                  required
                  disabled={loading}
                />
                <small className="text-muted">
                  New balance will be: {formatCurrency((parseFloat(wallet?.balance || 0) + parseFloat(amount || 0)))}
                </small>
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  <i className="fas fa-sticky-note me-1"></i>
                  Notes (Optional)
                </label>
                <textarea
                  className="form-control"
                  id="notes"
                  rows="3"
                  placeholder="Add notes for this transaction..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={loading}
                ></textarea>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  <i className="fas fa-times me-1"></i>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus me-1"></i>
                      Add Balance
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;