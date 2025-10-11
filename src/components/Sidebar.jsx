import { NavLink } from 'react-router-dom';

const Sidebar = ({ pendingOrdersCount = 0 }) => {
  const menuItems = [
    { path: '/dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { path: '/orders', icon: 'fa-shopping-cart', label: 'Orders', badge: pendingOrdersCount },
    { path: '/products', icon: 'fa-box', label: 'Products' },
    { path: '/customers', icon: 'fa-users', label: 'Customers' },
    { path: '/payments', icon: 'fa-credit-card', label: 'Payments' },
    { path: '/reports', icon: 'fa-chart-bar', label: 'Reports' },
  ];

  const settingsItems = [
    { path: '/profile', icon: 'fa-user-circle', label: 'Profile' },
  ];

  return (
    <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
              >
                <i className={`fas ${item.icon} me-2`}></i>
                {item.label}
                {item.badge > 0 && (
                  <span className="badge bg-danger ms-2">{item.badge}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <hr className="my-3" />

        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Settings</span>
        </h6>
        <ul className="nav flex-column">
          {settingsItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
              >
                <i className={`fas ${item.icon} me-2`}></i>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
