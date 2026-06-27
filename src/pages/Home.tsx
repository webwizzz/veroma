import Footer from "@/components/footer";
import Hero from "../components/Hero";
import Info from "./Info";
import BrainScent from "../components/BrainScent";

const Home = () => {
  return (
    <div
      className="min-h-screen bg-white tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Hero />
      <Info />
      <BrainScent style={{ marginTop: "500vh" }} />
      <Footer />
    </div>
  );
};

export default Home;