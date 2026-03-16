import { BrowserRouter, Routes, Route } from "react-router-dom";

import { MainLayout, ManagerLayout, StaffLayout, DriverLayout } from "../components/layout";
import Home from "../pages/Home";
import { Login, Register } from "../pages/Auth";
import { Booking } from "../pages/Booking";
import { History } from "../pages/History";
import { Profile } from "../pages/Profile";
import { Vehicles } from "../pages/Vehicles";
import { Dashboard, Vehicles as ManagerVehicles, Bookings, Drivers, Staff as ManagerStaff, ManagerProfile } from "../pages/Manager";
import { StaffDashboard, StaffBookings, StaffProfile, StaffCars, StaffCustomers } from "../pages/Staff";
import { DriverDashboard, DriverSchedule, DriverProfile } from "../pages/Driver";
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
          <Route path="staff" element={<ManagerStaff />} />
          <Route path="profile" element={<ManagerProfile />} />
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
          <Route path="cars" element={<StaffCars />} />
          <Route path="customers" element={<StaffCustomers />} />
          <Route path="profile" element={<StaffProfile />} />
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
          <Route path="profile" element={<DriverProfile />} />
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
