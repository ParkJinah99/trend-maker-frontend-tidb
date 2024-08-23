import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext"; // Import UserProvider

import LandingPage from "./views/LandingPage/LandingPage";
import AuthPage from "./views/AuthPage/AuthPage";
import ThreadsPage from "./views/ThreadsPage/ThreadsPage";
// import StatisticsPage from './views/StatisticsPage/StatisticsPage';
// import StrategiesPage from './views/StrategiesPage/StrategiesPage';
// import Sidebar from './components/Sidebar';
import Header from "./components/Header"; // Import the Header component
import "./App.css";

function App() {


  return (
    <UserProvider>
      <div className="app">
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/threads" element={<ThreadsPage />} />
          </Routes>
        </div>
      </div>
    </UserProvider>
  );
}

export default App;
