import { BrowserRouter, Routes, Route } from "react-router-dom";

import { MainLayout, ManagerLayout, StaffLayout } from "../components/layout";
import Home from "../pages/Home";
import { Login, Register } from "../pages/Auth";
import { Booking } from "../pages/Booking";
import { History } from "../pages/History";
import { Profile } from "../pages/Profile";
import { Vehicles } from "../pages/Vehicles";
import { Dashboard, Vehicles as ManagerVehicles, Bookings, Drivers } from "../pages/Manager";
import { StaffDashboard, StaffBookings } from "../pages/Staff";
import { PaymentResult } from "../pages/Payment";
import { ManagerRoute, StaffRoute } from "./RoleBasedRoute";
import ProtectedAuthRoute from "./ProtectedAuthRoute";

// Lazy load pages for better performance
// import { lazy, Suspense } from 'react';
// const Home = lazy(() => import('../pages/Home'));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="booking" element={<Booking />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="payment/result" element={<PaymentResult />} />
          {/* Add more routes here */}
        </Route>

        {/* Manager Routes - Protected */}
        <Route
          path="/manager"
          element={
            <ManagerRoute>
              <ManagerLayout />
            </ManagerRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vehicles" element={<ManagerVehicles />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="drivers" element={<Drivers />} />
        </Route>

        {/* Staff Routes - Protected */}
        <Route
          path="/staff"
          element={
            <StaffRoute>
              <StaffLayout />
            </StaffRoute>
          }
        >
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="bookings" element={<StaffBookings />} />
          {/* Additional staff routes can be added here */}
        </Route>

        <Route path="/login" element={
          <ProtectedAuthRoute>
            <Login />
          </ProtectedAuthRoute>
        } />
        <Route path="/register" element={
          <ProtectedAuthRoute>
            <Register />
          </ProtectedAuthRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
