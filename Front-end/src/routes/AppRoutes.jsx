import { BrowserRouter, Routes, Route } from "react-router-dom";

import { MainLayout, ManagerLayout } from "../components/layout";
import Home from "../pages/Home";
import { Login, Register } from "../pages/Auth";
import { Booking } from "../pages/Booking";
import { History } from "../pages/History";
import { Dashboard, Cars, Bookings, Drivers } from "../pages/Manager";
import { ManagerRoute } from "./RoleBasedRoute";


// Lazy load pages for better performance
// import { lazy, Suspense } from 'react';
// const Home = lazy(() => import('../pages/Home'));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="booking" element={<Booking />} />
          <Route path="history" element={<History />} />
          {/* Add more routes here */}
          {/* <Route path="/cars" element={<Cars />} /> */}
          {/* <Route path="/profile" element={<Profile />} /> */}
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
          <Route path="cars" element={<Cars />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="drivers" element={<Drivers />} />
        </Route>
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
