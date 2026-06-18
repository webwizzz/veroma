import Hero from "../components/Hero";
import Info from "./Info";
import AboutSection from "../components/aboutSection";
import ScentExperience from "../components/ScentExperience";
import React from "react";
import Footer from "@/components/footer";

const Home = () => {
  return (
    <div
      className="min-h-screen bg-white tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Hero />
      {/* <Info /> */}
      <AboutSection />
      <ScentExperience />
      <Footer />
    </div>
  );
};

export default Home;