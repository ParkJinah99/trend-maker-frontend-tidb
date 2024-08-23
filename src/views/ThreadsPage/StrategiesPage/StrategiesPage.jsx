import React, { useEffect, useState } from "react";
import config from "../../../config";
import "./StrategiesPage.css"; // Import the CSS file

const fetchStrategies = async (threadId, snapshotId) => {
  try {
    console.log("Fetching strategies for thread:", threadId);

    const strategiesResponse = await fetch(
      `${config.backendUrl}/threads/snapshot/strategies/${threadId}/${snapshotId}`
    );
    let strategiesData = {};

    if (strategiesResponse.ok) {
      const strategiesResponseData = await strategiesResponse.json();
      if (strategiesResponseData.status === "success") {
        strategiesData = strategiesResponseData.data;
        console.log("Strategies response data:", strategiesData);

        // Parse the JSON strings into actual objects/arrays if necessary
        strategiesData.marketing_strategies = JSON.parse(
          strategiesData.marketing_strategies || "[]"
        );
        strategiesData.brand_color_palette = JSON.parse(
          strategiesData.brand_color_palette || "[]"
        );

        console.log("Parsed strategies data:", strategiesData);
      } else {
        console.error(
          "Failed to retrieve strategies:",
          strategiesResponseData.message
        );
      }
    } else {
      console.error(
        "Failed to fetch strategies",
        strategiesResponse.status,
        strategiesResponse.statusText
      );
    }

    return strategiesData;
  } catch (error) {
    console.error("Error fetching strategies:", error);
    return {};
  }
};

function StrategiesPage({ thread, snapshot, hasFetched }) {
  const [strategies, setStrategies] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (thread && snapshot && !hasFetched) {
      setLoading(true); // Set loading to true when fetching starts
      fetchStrategies(thread.id, snapshot.id).then((data) => {
        setStrategies(data);
        setLoading(false); // Set loading to false when data is fetched
        hasFetched = true;
      });
    }
  }, [thread, snapshot, hasFetched]);

  const renderColorPalette = (palette) => {
    if (!Array.isArray(palette) || palette.length === 0) {
      return <p>No color palette available.</p>;
    }

    return (
      <div className="color-palettes-container">
        {palette.map((paletteItem, index) => {
          return (
            <div key={index} className="color-palette-section">
              <div className="color-swatch-container">
                {paletteItem.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="color-swatch"
                    style={{ backgroundColor: color }}
                  >
                    <div className="color-tooltip">{color}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMarketingStrategies = (strategies) => {
    if (!Array.isArray(strategies) || strategies.length === 0) {
      return <p>No marketing strategies available.</p>;
    }

    return strategies.map((strategy, index) => {
      const [header, content] = strategy.split(":");
      return (
        <div key={index} className="marketing-strategy-item">
          <strong>{header}</strong>
          <span>{content.trim()}</span>
        </div>
      );
    });
  };

  const renderLogoImages = (logoImages) => {
    if (!Array.isArray(logoImages) || logoImages.length === 0) {
      return <p>No logo images available.</p>;
    }

    return (
      <div className="reference-logo-image-container">
        {logoImages.map((base64String, index) => {
          const imageUrl = `data:image/png;base64,${base64String}`;
          return (
            <img
              key={index}
              src={imageUrl}
              alt={`Brand Logo ${index + 1}`}
              className="logo-image"
            />
          );
        })}
      </div>
    );
  };


  const renderBrandLogo = (base64String) => {
    if (!base64String) {
      // Handles null, undefined, or any other falsy value
      return <p>No logo images available.</p>;
    }

    const imageUrl = `data:image/png;base64,${base64String}`;

    return (
      <div className="logo-image-container">
        <img src={imageUrl} alt= 'brandlogo' className="brand-logo" />
      </div>
    );
  };

  return (
    <div className="strategies-page">
    {loading ? (
      <div className="loading-spinner-strategies">
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
          Processing...
        </button>
      </div>
    ) : snapshot ? (
      <>
        <div>
          <h2 className="section-header">&nbsp;&nbsp;&nbsp;Strategy</h2>
          <div className="strategies-container strategies-content">
            <div className="strategies-item">
              <div className="strategies-header">TREND SUMMARY</div>
              {strategies?.trend_summary}
            </div>
            <div className="strategies-item">
              <div className="strategies-header">TARGET AUDIENCE</div>
              <p>{strategies?.target_audience}</p>
            </div>
            <div className="strategies-item">
              <div className="strategies-header">MARKETING STRATEGIES</div>
              {renderMarketingStrategies(strategies?.marketing_strategies)}
            </div>
          </div>
        </div>
        <div>
          <h2 className="section-header">&nbsp;&nbsp;&nbsp;Branding Suggestion</h2>
          <div className="branding-container">
            <div className="branding-item">
              <p>
                <div className="brand-name">{strategies?.brand_name}</div>
                <div className="brand-header">NAME</div>
              </p>
            </div>
            <div className="branding-item">
              <p>
                <div className="brand-slogan">{strategies?.brand_slogan}</div>
                <div className="brand-header">SLOGAN</div>
              </p>
            </div>
            <div className="branding-item">
              {renderBrandLogo(strategies?.brand_logo)}
              <p>
                <div className="brand-header">YOUR LOGO</div>
              </p>
            </div>
            <div className="branding-item">
              <div className="color-palette">
                {renderColorPalette(strategies?.brand_color_palette)}
              </div>
              <p>
                <div className="brand-header">COLOR PALETTES</div>
              </p>
            </div>
            <div className="reference-logo">
              {renderLogoImages(strategies?.logo_image)}
              <p>
                <div className="brand-header">REFERENCE LOGOS</div>
              </p>
            </div>
          </div>
        </div>
      </>
    ) : (
      <p>No snapshot selected.</p>
    )}
  </div>

  );
}

export default StrategiesPage;
