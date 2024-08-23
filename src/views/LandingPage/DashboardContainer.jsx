import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import "./DashboardContainer.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { Scatter, Pie, Line } from "react-chartjs-2";
import { ReactComponent as UserIcon } from "../../components/icons/UserIcon.svg";
import { ReactComponent as QueryIcon } from "../../components/icons/QueryIcon.svg";
import { ReactComponent as StrategyIcon } from "../../components/icons/StrategyIcon.svg";
import { ReactComponent as KeywordsIcon } from "../../components/icons/KeywordsIcon.svg";
import * as d3 from "d3-scale";
import { interpolateViridis } from "d3-scale-chromatic";
import { PCA } from "ml-pca";

ChartJS.register(
  CategoryScale,
  RadialLinearScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
function DashboardContainer({
  topCategories,
  countryCounts,
  aggregatedCounts,
  queriesOverTime,
  embeddingsData,
  loading,
  error,
}) {
  const countryCountsPieData = {
    labels: countryCounts ? Object.keys(countryCounts) : [],
    datasets: [
      {
        label: "Country Counts",
        data: countryCounts ? Object.values(countryCounts) : [],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ], // Add more colors if needed
        hoverOffset: 4,
      },
    ],
  };

  const queriesOverTimeData = {
    labels: queriesOverTime
      ? queriesOverTime.map((item) => item.creation_date)
      : [],
    datasets: [
      {
        label: "thread count",
        data: queriesOverTime
          ? queriesOverTime.map((item) => item.daily_thread_count)
          : [],
        fill: false,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };

  const [scatterData, setScatterData] = useState(null);

  useEffect(() => {
    if (embeddingsData) {
      // Check if embeddings and category_embeddings exist and are arrays
      if (
        Array.isArray(embeddingsData.embeddings) &&
        embeddingsData.embeddings.length > 0 &&
        Array.isArray(embeddingsData.category_embeddings) &&
        embeddingsData.category_embeddings.length > 0
      ) {
        const pcaQueries = new PCA(embeddingsData.embeddings);
        const reducedEmbeddingsQueries = pcaQueries.predict(
          embeddingsData.embeddings,
          {
            nComponents: 2,
          }
        );

        const pcaCategories = new PCA(embeddingsData.category_embeddings);
        const reducedEmbeddingsCategories = pcaCategories.predict(
          embeddingsData.category_embeddings,
          {
            nComponents: 2,
          }
        );

        // Create a color scale based on the first dimension of the reduced embeddings
        const colorScaleQueries = d3
          .scaleSequential(interpolateViridis)
          .domain([
            Math.min(...reducedEmbeddingsQueries.data.map((d) => d[0])),
            Math.max(...reducedEmbeddingsQueries.data.map((d) => d[0])),
          ]);

        const colorScaleCategories = d3
          .scaleSequential(interpolateViridis)
          .domain([
            Math.min(...reducedEmbeddingsCategories.data.map((d) => d[0])),
            Math.max(...reducedEmbeddingsCategories.data.map((d) => d[0])),
          ]);

        const data = {
          datasets: [
            {
              label: "Query Embeddings",
              data: reducedEmbeddingsQueries
                .to2DArray()
                .map((embedding, index) => ({
                  x: embedding[0],
                  y: embedding[1],
                  label: embeddingsData.queries[index],
                  backgroundColor: colorScaleQueries(embedding[0]), // Apply color based on the first dimension
                })),
              pointBackgroundColor: reducedEmbeddingsQueries
                .to2DArray()
                .map((embedding) => colorScaleQueries(embedding[0])),
              pointStyle: "circle", // Shape for the first dataset
              pointRadius: 2,
            },
            {
              label: "Category Embeddings",
              data: reducedEmbeddingsCategories
                .to2DArray()
                .map((embedding, index) => ({
                  x: embedding[0],
                  y: embedding[1],
                  label: embeddingsData.category_names[index],
                  backgroundColor: colorScaleCategories(embedding[0]), // Apply color based on the first dimension
                })),
              pointBackgroundColor: reducedEmbeddingsCategories
                .to2DArray()
                .map((embedding) => colorScaleCategories(embedding[0])),
              pointStyle: "triangle", // Shape for the second dataset
              pointRadius: 5,
            },
          ],
        };

        setScatterData(data);
      } else {
        console.error(
          "Embeddings data is not in the correct format or is missing."
        );
      }
    }
  }, [embeddingsData]);

  if (loading) {
    return (
      <div className="loading-spinner-dashboard">
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
          Loading...
        </button>
      </div>
    );
  }

  if (error) {
    return <div className="message">Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      {aggregatedCounts && (
        <div className="top-rectangles">
          <div className="rectangle">
            <QueryIcon className="icon" />
            <div className="rectangle-content">
              <div className="data-wrapper">
                <div className="data">
                  {aggregatedCounts.queries_number || 0}
                </div>
                <div
                  className="difference"
                  style={{
                    color:
                      aggregatedCounts.diff_queries_number >= 0
                        ? "red"
                        : "blue",
                    marginLeft: "10px",
                  }}
                >
                  {aggregatedCounts.diff_queries_number >= 0
                    ? `+${aggregatedCounts.diff_queries_number}`
                    : `${aggregatedCounts.diff_queries_number}`}
                </div>
              </div>
              <div className="data-name">Total Queries</div>
            </div>
          </div>
          <div className="rectangle">
            <UserIcon className="icon" />
            <div className="rectangle-content">
              <div className="data-wrapper">
                <div className="data">{aggregatedCounts.users_number || 0}</div>
                <div
                  className="difference"
                  style={{
                    color:
                      aggregatedCounts.diff_users_number >= 0 ? "red" : "blue",
                    marginLeft: "10px",
                  }}
                >
                  {aggregatedCounts.diff_users_number >= 0
                    ? `+${aggregatedCounts.diff_users_number}`
                    : `${aggregatedCounts.diff_users_number}`}
                </div>
              </div>
              <div className="data-name">Total Users</div>
            </div>
          </div>
          <div className="rectangle">
            <StrategyIcon className="icon" />
            <div className="rectangle-content">
              <div className="data-wrapper">
                <div className="data">
                  {aggregatedCounts.strategies_number || 0}
                </div>
                <div
                  className="difference"
                  style={{
                    color:
                      aggregatedCounts.diff_strategies_number >= 0
                        ? "red"
                        : "blue",
                    marginLeft: "10px",
                  }}
                >
                  {aggregatedCounts.diff_strategies_number >= 0
                    ? `+${aggregatedCounts.diff_strategies_number}`
                    : `${aggregatedCounts.diff_strategies_number}`}
                </div>
              </div>
              <div className="data-name">Total Strategies</div>
            </div>
          </div>
          <div className="rectangle">
            <KeywordsIcon className="icon" />
            <div className="rectangle-content">
              <div className="data-wrapper">
                <div className="data">
                  {aggregatedCounts.statistics_number || 0}
                </div>
                <div
                  className="difference"
                  style={{
                    color:
                      aggregatedCounts.diff_statistics_number >= 0
                        ? "red"
                        : "blue",
                    marginLeft: "10px",
                  }}
                >
                  {aggregatedCounts.diff_statistics_number >= 0
                    ? `+${aggregatedCounts.diff_statistics_number}`
                    : `${aggregatedCounts.diff_statistics_number}`}
                </div>
              </div>
              <div className="data-name">Total Statistics</div>
            </div>
          </div>
        </div>
      )}

      <div className="bottom-charts">
        <div className="chart-container">
          <h3 className="chart-title">Number of Queries over Time</h3>
          {queriesOverTime ? <Line data={queriesOverTimeData} /> : <div></div>}
        </div>
        <div className="chart-container" style={{ height: 400 }}>
          <h3 className="chart-title">Query Embeddings Scatter Graph</h3>
          {scatterData ? (
            <Scatter
              data={scatterData}
              options={{
                plugins: {
                  legend: {
                    labels: {
                      usePointStyle: true, // Enables point styles in the legend instead of colored boxes
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return context.raw.label;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    type: "linear",
                    position: "bottom",
                  },
                },
              }}
            />
          ) : (
            "No data available for scatter plot"
          )}
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Query Country Distribution</h3>
          {countryCountsPieData ? (
            <Pie
              data={countryCountsPieData}
              options={{
                plugins: {
                  legend: {
                    display: true,
                    position: "right", // This sets the legend position to the right
                  },
                },
              }}
            />
          ) : (
            <div></div>
          )}
        </div>

        <div className="table-container">
          <h3 className="chart-title">Top Categories</h3>
          {topCategories ? (
            <DataGrid
              rows={topCategories.map((category, index) => ({
                id: index,
                rank: index + 1,
                category: category.category,
                total_queries: category.total_queries,
              }))}
              columns={[
                { field: "rank", headerName: "Rank", flex: 0.5 },
                { field: "category", headerName: "Category", flex: 3 },
                {
                  field: "total_queries",
                  headerName: "Total Queries",
                  flex: 1,
                },
              ]}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              hideFooterPagination
            />
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardContainer;
