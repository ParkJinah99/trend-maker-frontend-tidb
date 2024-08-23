// src/config.js

// Load the backend URL from environment variables
const backendUrl = process.env.REACT_APP_BACKEND_URL;
console.log("Backend URL:", backendUrl);

// You can add more configuration settings if needed
const config = {
  backendUrl, // Equivalent to backendUrl: backendUrl
  // Other config values can go here
};

// Export the configuration object
export default config;
