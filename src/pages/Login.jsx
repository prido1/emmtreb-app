import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import '../styles/login.css';

const Login = () => {
  // const [username, setUsername] = useState('williechieza@yahoo.co.uk');
  // const [password, setPassword] = useState('bill0773765845');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    const result = await login({ username, password });

    if (result.success) {
      setAlert({ message: 'Login successful! Redirecting...', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setAlert({
        message: result.message || 'Login failed. Please check your credentials.',
        type: 'danger'
      });
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img src="/logo.png" alt="Logo" className="login-logo mb-3" />
          <h1>Admin Panel</h1>
          <p>Emmtreb System</p>
        </div>

        <div className="login-body">
          {alert && (
            <Alert
              message={alert.message}
              type={alert.type}
              onClose={() => setAlert(null)}
            />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label htmlFor="username">
                <i className="fas fa-user me-2"></i>Username
              </label>
            </div>

            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password">
                <i className="fas fa-lock me-2"></i>Password
              </label>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>Login
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
