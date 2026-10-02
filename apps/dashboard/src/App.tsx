import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { QueuePage } from "./pages/QueuePage";
import { PRDetailsPage } from "./pages/PRDetailsPage";
import { OpsOverviewPage } from "./pages/OpsOverviewPage";
import { AboutPage } from "./pages/AboutPage";
import { ScrollToTop } from "./components/ScrollToTop";

export const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#efece6] text-[#111111] font-sans antialiased selection:bg-[#e63920] selection:text-white">
        <Header />
        <Routes>
          <Route path="/" element={<QueuePage />} />
          <Route path="/pr/:prNumber" element={<PRDetailsPage />} />
          <Route path="/command-center" element={<OpsOverviewPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
