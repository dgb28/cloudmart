import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import CloudMartMainPage from "./components/MainPage";
import CustomerSupportPage from "./components/SupportPage";
import AboutPage from "./components/AboutPage";
import CartPage from "./components/CartPage";
import AdminPage from "./components/AdminPage";
import UserProfilePage from "./components/UserProfilePage";
import { initializeUser } from "./utils/userUtils";
import OrdersPage from "./components/OrdersPage";
import UserOrdersPage from "./components/UserOrdersPage";
import AdminTicketView from "./components/AdminTicketView";

function App() {
  useEffect(() => {
    initializeUser();
  }, []);
  return (
    <Routes>
      <Route exact path="/" element={<CloudMartMainPage />} />
      <Route path="/customer-support" element={<CustomerSupportPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/my-orders" element={<UserOrdersPage />} />
      <Route path="/tickets" element={<AdminTicketView />} />
    </Routes>
  );
}

export default App;
