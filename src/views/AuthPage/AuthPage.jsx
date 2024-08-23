import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import config from "../../config";
import "./AuthPage.css";

function AuthPage() {
  const { userId, setUserId } = useContext(UserContext);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const navigate = useNavigate();

  const handleAuthToggle = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setPassword("");
    setErrorMessage(""); // Clear error message when toggling
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setErrorMessage(""); // Clear previous error message

    const endpoint = isLogin
      ? `${config.backendUrl}/auth/login`
      : `${config.backendUrl}/auth/create-new-user`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(isLogin ? "Login successful" : "Sign up successful");
        console.log("Data received from server:", data);

        if (data.data && data.data.user_id) {
          setUserId(data.data.user_id);
          localStorage.setItem("userId", data.data.user_id);
        } else {
          console.error("Error: user_id is missing from the response data");
        }
      } else {
        // Set error message based on the response from the backend
        setErrorMessage(data.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      navigate("/auth");
    }
  }, [setUserId, navigate]);

  useEffect(() => {
    console.log("userId changed:", userId);
    if (userId) {
      navigate("/threads");
    }
  }, [userId, navigate]);

  return (
    <div className="auth-page">
      {!userId ? (
        loading ? (
          <div className="loading">
            <button type="button" disabled>
          <svg
            className="animate-spin h-8 w-8 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          Logging In...
        </button>
          </div>
        ) : (
          <>
            <h2>{isLogin ? "Log In" : "Sign Up"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {/* Display error message */}
              {errorMessage && (
                <div className="error-message">
                  <p>{errorMessage}</p>
                </div>
              )}
              <button type="submit">{isLogin ? "Log In" : "Sign Up"}</button>
            </form>
            <button className="toggle-button" onClick={handleAuthToggle}>
              {isLogin
                ? "Need an account? Sign Up"
                : "Already have an account? Log In"}
            </button>
          </>
        )
      ) : (
        <>
          <h2>Welcome, {username}!</h2>
        </>
      )}
    </div>
  );
}

export default AuthPage;
