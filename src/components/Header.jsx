import React from "react";

const Header = () => {
  return (
    <header className="bg-gray-950 py-6 px-4 shadow-sm">
      <h1 className="text-3xl md:text-5xl font-bold text-pink-500 text-center tracking-tight">
        Cloud Price Comparison Dashboard
      </h1>
      <p className="text-center text-pink-300 mt-2 text-base md:text-lg">
        Compare pricing across AWS, Azure, and GCP with ease
      </p>
    </header>
  );
};

export default Header;
