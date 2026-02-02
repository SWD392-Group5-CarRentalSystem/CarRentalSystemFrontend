import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "../components/layout";
import Home from "../pages/Home";
import { Login, Register } from "../pages/Auth";
import { Booking } from "../pages/Booking";
import { History } from "../pages/History";

// Lazy load pages for better performance
// import { lazy, Suspense } from 'react';
// const Home = lazy(() => import('../pages/Home'));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/history" element={<History />} />
          {/* Add more routes here */}
          {/* <Route path="/cars" element={<Cars />} /> */}
          {/* <Route path="/profile" element={<Profile />} /> */}
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
