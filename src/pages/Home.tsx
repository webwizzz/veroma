import Hero from "../components/Hero";
import Info from "./Info";
import Innovation from "../components/Innovation";
import React from "react";
import Footer from "@/components/footer";

const Home = () => {
  return (
    <div
      className="min-h-screen bg-white tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Hero />
      <Info />
      <Innovation />
      <Footer />
    </div>
  );
};

export default Home;