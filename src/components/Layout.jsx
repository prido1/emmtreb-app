import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

const Layout = () => {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await ordersAPI.getAll({ status: 'paid', limit: 1 });
        if (response.success) {
          setPendingOrdersCount(response.data.total || 0);
        }
      } catch (error) {
        console.error('Error fetching pending orders:', error);
      }
    };

    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <Sidebar pendingOrdersCount={pendingOrdersCount} />
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
