import Hero from "../components/Hero";
import Info from "./Info";
import React from "react";

const Home = () => {
  return (
    <div
      className="min-h-screen bg-white tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Hero />
      <Info />
    </div>
  );
};

export default Home;