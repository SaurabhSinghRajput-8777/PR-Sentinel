import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { QueuePage } from "./pages/QueuePage";
import { PRDetailsPage } from "./pages/PRDetailsPage";

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#080808] text-[#f5f5f0]">
        <Header />
        <Routes>
          <Route path="/" element={<QueuePage />} />
          <Route path="/pr/:prNumber" element={<PRDetailsPage />} />
          <Route path="/command-center" element={<QueuePage />} />
          <Route path="/live-surface" element={<PRDetailsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
