import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="min-h-screen w-full">
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
