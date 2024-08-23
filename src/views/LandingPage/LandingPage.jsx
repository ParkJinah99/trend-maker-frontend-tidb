import React, { useState, useEffect } from "react";
import "./LandingPage.css";
import QueryContainer from "../../components/QueryContainer";
import DashboardContainer from "./DashboardContainer";
import { useNavigate } from "react-router-dom";
import config from "../../config"; // Ensure this is correctly pointing to your config file

function LandingPage() {
  const [aggregatedCounts, setAggregatedCounts] = useState(null);
  const [countryCounts, setCountryCounts] = useState(null);
  const [topCategories, setTopCategories] = useState(null);
  const [queriesOverTime, setQueriesOverTime] = useState(null);
  const [embeddingsData, setEmbeddingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAggregatedCounts = async () => {
      try {
        setError(null);
        setLoading(true);

        const response = await fetch(
          `${config.backendUrl}/dashboard/aggregated_counts`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          setAggregatedCounts(data.data);
        } else {
          throw new Error(data.message || "Unexpected error occurred");
        }
      } catch (error) {
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    const fetchCountryCounts = async () => {
      try {
        setError(null);
        setLoading(true);

        const response = await fetch(
          `${config.backendUrl}/dashboard/aggregated_country_counts`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          setCountryCounts(data.data);
        } else {
          throw new Error(data.message || "Unexpected error occurred");
        }
      } catch (error) {
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    const fetchDashboardData = async () => {
      try {
        setError(null);
        setLoading(true);

        const response = await fetch(
          `${config.backendUrl}/dashboard/top_categories`
        );

        console.log("Response object:", response);

        if (!response.ok) {
          let errorMessage = `Error: ${response.status} ${response.statusText}`;
          if (response.status === 404) {
            errorMessage = "Data not found";
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("Response JSON:", data);

        if (data.status === "success") {
          setTopCategories(data.data.top_categories);
          console.log("Top categories data:", data.data.top_categories);
        } else {
          throw new Error(data.message || "Unexpected error occurred");
        }
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    const fetchQueriesOverTime = async () => {
      // New fetching function
      try {
        setError(null);
        setLoading(true);

        const response = await fetch(
          `${config.backendUrl}/dashboard/queries-over-time`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          setQueriesOverTime(data.data);
        } else {
          throw new Error(data.message || "Unexpected error occurred");
        }
      } catch (error) {
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    const fetchEmbeddingsData = async () => {
      try {
        setError(null);
        setLoading(true);

        const response = await fetch(
          `${config.backendUrl}/dashboard/queries-embeddings`
        );

        console.log("Response object:", response);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          const { queries, embeddings, category_names, category_embeddings } =
            data.data;

          setEmbeddingsData({
            queries: queries,
            embeddings: embeddings,
            category_names: category_names,
            category_embeddings: category_embeddings,
          });
        } else {
          throw new Error(data.message || "Unexpected error occurred");
        }
      } catch (error) {
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchAggregatedCounts();
    fetchCountryCounts();
    fetchDashboardData();
    fetchQueriesOverTime();
    fetchEmbeddingsData();
  }, []);

  return (
    <div className="landing-page">
      <QueryContainer onSubmitSuccess={() => navigate("/threads")} />
      <DashboardContainer
        aggregatedCounts={aggregatedCounts}
        countryCounts={countryCounts}
        topCategories={topCategories}
        queriesOverTime={queriesOverTime}
        embeddingsData={embeddingsData}
        loading={loading}
        error={error}
      />
    </div>
  );
}

export default LandingPage;
