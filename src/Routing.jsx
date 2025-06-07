import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CloudData from "./Pages/Home";
import AzureVmInfoPage from "./Pages/AzureVminfoPage";

function Layout() {
  return (
    <div className="min-h-screen bg-space-gradient bg-[url('')] bg-starry-size flex flex-col">
      <Header />
      <main className="flex-grow px-4 sm:px-6 md:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const Routing = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CloudData />} />
        <Route
          path="/azure-vm-info/:region/:vmSize"
          element={<AzureVmInfoPage />}
        />
      </Route>
    </Routes>
  );
};

export default Routing;
