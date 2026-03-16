import { BrowserRouter, Routes, Route } from "react-router-dom";

import { MainLayout, ManagerLayout, StaffLayout, DriverLayout } from "../components/layout";
import Home from "../pages/Home";
import { Login, Register } from "../pages/Auth";
import { Booking } from "../pages/Booking";
import { History } from "../pages/History";
import { Profile } from "../pages/Profile";
import { Vehicles } from "../pages/Vehicles";
import { Dashboard, Vehicles as ManagerVehicles, Bookings, Drivers } from "../pages/Manager";
import { StaffDashboard, StaffBookings } from "../pages/Staff";
import { DriverDashboard, DriverSchedule } from "../pages/Driver";
import { PaymentResult } from "../pages/Payment";
import About from "../pages/About/About";
import { ManagerRoute, StaffRoute, DriverRoute } from "./RoleBasedRoute";
import ProtectedAuthRoute from "./ProtectedAuthRoute";

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
          <Route path="about" element={<About />} />
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

        {/* Driver Routes - Protected */}
        <Route
          path="/driver"
          element={
            <DriverRoute>
              <DriverLayout />
            </DriverRoute>
          }
        >
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="schedule" element={<DriverSchedule />} />
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
