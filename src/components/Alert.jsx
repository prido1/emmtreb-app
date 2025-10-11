import { useState, useEffect } from 'react';

const Alert = ({ message, type = 'info', onClose, autoClose = true }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'danger':
        return 'fa-exclamation-triangle';
      case 'warning':
        return 'fa-exclamation-circle';
      default:
        return 'fa-info-circle';
    }
  };

  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      <i className={`fas ${getIcon()} me-2`}></i>
      {message}
      <button
        type="button"
        className="btn-close"
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        aria-label="Close"
      ></button>
    </div>
  );
};

export default Alert;
