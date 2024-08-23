import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "./icons/logo.png"; // Import your logo
import { ReactComponent as TrendIcon } from "./icons/TrendIcon.svg";
import { UserContext } from "../contexts/UserContext";

function Header() {
  const { userId, setUserId } = useContext(UserContext);
  const navigate = useNavigate();

  const handleAuthButtonClick = () => {
    if (userId) {
      console.log("Signing out");
      setUserId(null); // Clear the userId in context
      localStorage.removeItem("userId"); // Remove userId from localStorage
      navigate("/auth"); // Redirect to the auth page after signing out
    } else {
      navigate("/auth"); // Navigate to login/sign up page
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="trendmaker-title">
          <img src={logo} alt="Trend-Maker Logo" className="trend-logo" />
          <span className="trendmaker-text">TrendMaker</span>
        </h1>
      </div>
      <div className="header-right">
        <button className="home-button" onClick={() => navigate("/")}>
          Home
        </button>
        {userId && (
          <button
            className="trends-button"
            onClick={() => navigate("/threads")}
          >
            My Trends
          </button>
        )}
        <button className="auth-button" onClick={handleAuthButtonClick}>
          {userId ? "Sign Out" : "Log In/Sign Up"}
        </button>
      </div>
    </header>
  );
}

export default Header;

