import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AIAssistant from "../components/ai-assistant/AIAssistant";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      <AIAssistant />
    </div>
  );
};

export default MainLayout;