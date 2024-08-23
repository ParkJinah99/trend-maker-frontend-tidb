import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import config from "../config";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import countries from "./data/country_names.json"; // Adjust the path to where your JSON file is located
import "./QueryContainer.css";

function QueryContainer({ onSubmitSuccess }) {
  const { userId } = useContext(UserContext);
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Target Country");
  const [loading, setLoading] = useState(false);
  const [countryFilter, setCountryFilter] = useState(""); // State for filtering
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility

  const navigate = useNavigate();

  // Filter the country options based on the filter text
  const filteredCountries = countries.filter((country) => {
    return country.toLowerCase().includes(countryFilter.toLowerCase());
  });

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false); // Close dropdown when a country is selected
  };

  const handleFilterChange = (e) => {
    setCountryFilter(e.target.value);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${config.backendUrl}/threads/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          user_query: query,
          country:
            selectedCountry !== "Select a country" ? selectedCountry : null,
        }),
      });

      if (response.ok) {
        if (onSubmitSuccess) {
          onSubmitSuccess();
        } else {
          navigate("/threads");
        }
      } else {
        console.error("Failed to submit query");
      }
    } catch (error) {
      console.error("Error submitting query:", error);
    } finally {
      setLoading(false);
      setQuery("");
      setSelectedCountry("Select a country");
    }
  };

  return (
    <div className="query-container">
      <div className="introduction"></div>

      {!loading && (
        <div className="input-container flex space-x-4">
          {" "}
          {/* Flex container with spacing */}
          <input
            type="text"
            placeholder="What is your business?"
            value={query}
            onChange={handleInputChange}
            disabled={loading}
            className="flex-grow px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500 h-12" // Flex-grow to take up available space
          />
          {/* Country dropdown with filtering */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500 h-12" // Same height class
            >
              <span className="mr-2">{selectedCountry}</span>
              <ChevronDownIcon
                aria-hidden="true"
                className="w-5 h-5 ml-2 -mr-1 text-gray-400"
              />
            </button>
            {isDropdownOpen && (
              <div
                id="dropdown-menu"
                className="absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-1 space-y-1"
              >
                <input
                  id="search-input"
                  className="block w-full px-4 py-2 text-gray-800 border rounded-md border-gray-300 focus:outline-none"
                  type="text"
                  placeholder="Filter countries"
                  value={countryFilter}
                  onChange={handleFilterChange}
                />
                {filteredCountries.map((country) => (
                  <a
                    key={country}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 active:bg-blue-100 cursor-pointer rounded-md"
                    onClick={() => handleCountrySelect(country)}
                  >
                    {country}
                  </a>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            className="submit-button" // Same height class
            disabled={loading}
          >
            Submit
          </button>
        </div>
      )}

      {loading && (
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <button
              type="button"
              className="bg-indigo-500 flex items-center justify-center px-4 py-2 text-white rounded-md"
              disabled
            >
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 22c5.421 0 10-4.579 10-10S17.421 2 12 2 2 6.579 2 12s4.579 10 10 10zm0-2c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-14a6 6 0 00-6 6h12a6 6 0 00-6-6zm0 10a6 6 0 006-6H6a6 6 0 006 6z"
                />
              </svg>
              Submitting your query...
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QueryContainer;
