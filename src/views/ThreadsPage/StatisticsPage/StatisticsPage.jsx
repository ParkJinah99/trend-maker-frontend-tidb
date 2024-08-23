import React, { useEffect, useState } from "react";
import { Pie, Line, Bar } from "react-chartjs-2";
import { DataGrid } from "@mui/x-data-grid";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import config from "../../../config";
import "./StatisticsPage.css"; // Import the CSS file

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const fetchStatistics = async (threadId, snapshotId) => {
  try {
    const url =
      snapshotId === 0
        ? `${config.backendUrl}/threads/statistics/${threadId}`
        : `${config.backendUrl}/threads/snapshot/statistics/${threadId}/${snapshotId}`;

    const statisticsResponse = await fetch(url);

    let statisticsData = {};

    if (statisticsResponse.ok) {
      const statisticsResponseData = await statisticsResponse.json();
      if (statisticsResponseData.status === "success") {
        statisticsData = statisticsResponseData.data;
      } else {
        console.error(
          "Failed to retrieve statistics:",
          statisticsResponseData.message
        );
      }
    } else {
      console.error(
        "Failed to fetch statistics",
        statisticsResponse.status,
        statisticsResponse.statusText
      );
    }

    return statisticsData;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {};
  }
};

function StatisticsPage({ thread, snapshot, hasFetched }) {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (thread && snapshot && !hasFetched) {
      setLoading(true);
      fetchStatistics(thread.id, snapshot.id).then((data) => {
        setStatistics(data);
        setLoading(false);
        hasFetched = true;
      });
    }
  }, [thread, snapshot, hasFetched]);

  if (loading) {
    return <div className="loading-spinner-statistics">
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
    </div>;
  }

  if (!statistics) {
    return <div>No statistics available.</div>;
  }

  const renderPieCharts = () => {
    if (
      !statistics ||
      !Array.isArray(statistics.ComparedBreakdownByRegion) ||
      statistics.ComparedBreakdownByRegion.length === 0
    ) {
      console.error("ComparedBreakdownByRegion is undefined or empty");
      return <div></div>;
    }

    const pieChartData = {
      labels: Object.keys(statistics.ComparedBreakdownByRegion[0]).filter(
        (key) => key !== "Location"
      ),
      datasets: statistics.ComparedBreakdownByRegion.map((region) => ({
        label: region.Location,
        data: Object.keys(region)
          .filter((key) => key !== "Location")
          .map((key) => region[key]),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      })),
    };

    return (
      <div className="global-piechart-container">
        <h3 className="global-piechart-title">Comparison by Regions</h3>
        <div className="chart-grid">
          {statistics.ComparedBreakdownByRegion.map((region, index) => (
            <div key={index} className="chart-item">
              <div className="pie-chart">
                <Pie
                  data={{
                    labels: pieChartData.labels,
                    datasets: [pieChartData.datasets[index]],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false, // Hide individual legends
                      },
                    },
                    layout: {
                      padding: {
                        top: 10,
                        bottom: 10,
                      },
                    },
                  }}
                />
              </div>
              <div className="pie-chart-title">{region.Location}</div>
            </div>
          ))}
        </div>
        {/* Global Legend */}
        <div className="global-legend">
          {pieChartData.labels.map((label, index) => (
            <span key={index} className="legend-item">
              <span
                className="legend-color"
                style={{
                  backgroundColor:
                    pieChartData.datasets[0].backgroundColor[index],
                }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderInterestByRegionBarChart = () => {
    if (!statistics || !statistics.InterestByRegion || !statistics.InterestByRegion.Total_Interest) {
      return <div></div>;
    }

    const regions = Object.entries(statistics.InterestByRegion.Total_Interest)
      .sort((a, b) => b[1] - a[1])
      .map(([region, interest]) => ({ region, interest }));

    if (regions.length === 0) {
      return <div></div>;
    }

    const labels = regions.map((item) => item.region);
    const data = regions.map((item) => item.interest);

    const barChartData = {
      labels,
      datasets: [
        {
          label: "Interest by Region",
          data,
          backgroundColor: "#36A2EB",
          borderColor: "#36A2EB",
          borderWidth: 1,
        },
      ],
    };

    return (
      <div className="bar-chart-container">
        <h3 className="chart-title">Most Interested Regions</h3>
        <div className="chart-wrapper">
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false, // Allow dynamic resizing
              plugins: {
                legend: {
                  position: "bottom",
                },
              },
              scales: {
                x: {
                  ticks: {
                    font: {
                      family: "Poppins",
                      size: 12,
                      weight: "600",
                      color: "#555",
                    },
                  },
                },
                y: {
                  ticks: {
                    font: {
                      family: "Poppins",
                      size: 12,
                      weight: "600",
                      color: "#555",
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>
    );
  };


  const renderCombinedInterestOverTimeLineChart = () => {
    if (!statistics || !statistics.InterestOverTime) {
      return <div></div>;
    }

    const interestOverTime = statistics.InterestOverTime;

    if (Object.keys(interestOverTime).length === 0) {
      return <div></div>;
    }

    const firstCategory = Object.keys(interestOverTime)[0];
    const labels = Object.keys(interestOverTime[firstCategory]).map(
      (dateTime) => dateTime.split(" ")[0] // Extract only the date part (YYYY-MM-DD)
    );

    const datasets = Object.keys(interestOverTime).map((category, index) => {
      const data = Object.values(interestOverTime[category]);

      return {
        label: category,
        data,
        fill: false,
        borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
        tension: 0.2,
      };
    });

    const lineChartData = {
      labels,
      datasets,
    };

    return (
      <div className="line-chart-container">
        <h3 className="chart-title">Interest Over Time</h3>
        <div className="chart-wrapper">
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false, // Allow dynamic resizing
              scales: {
                x: {
                  ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,
                    font: {
                      family: "Poppins", // Apply consistent font
                      size: 12,
                      weight: "600",
                      color: "#555",
                    },
                  },
                },
                y: {
                  ticks: {
                    font: {
                      family: "Poppins",
                      size: 12,
                      weight: "600",
                      color: "#555",
                    },
                  },
                },
              },
              plugins: {
                legend: {
                  display: true,
                  position: "bottom", // Move the legend to the bottom
                  labels: {
                    font: {
                      family: "Poppins",
                      size: 14,
                      weight: "bold",
                      color: "#333",
                    },
                    usePointStyle: true, // Use circle or square style for legend items
                    padding: 20,
                  },
                },
              },
            }}
          />
        </div>
      </div>
    );
  };


  const renderYouTubeTable = () => {
    if (!statistics || !statistics.YouTubeSearch) {
      console.error("YouTubeSearch data is undefined or null");
      return <div></div>;
    }

    const {
      Title,
      Views,
      trend_score,
      "Published Date": PublishedDate,
    } = statistics.YouTubeSearch;

    if (!Title || !Views || !trend_score || !PublishedDate) {
      console.error("YouTubeSearch fields are undefined or null");
      return <div></div>;
    }

    const columns = [
      { field: "rank", headerName: "Rank", flex: 0.5 }, // Add ranking as the first column
      { field: "title", headerName: "Title", flex: 3 }, // Increase flex to occupy more space
      { field: "publishedDate", headerName: "Published Date", flex: 1 }, // Use flex instead of width for better scaling
      { field: "views", headerName: "Views", flex: 1 },
      { field: "trendScore", headerName: "Trend Score", flex: 1 },
    ];

    const rankedRows = Object.keys(Title)
      .map((index) => ({
        id: index,
        title: Title[index],
        publishedDate: PublishedDate[index],
        views: Views[index],
        trendScore: trend_score[index],
      }))
      .sort((a, b) => b.trendScore - a.trendScore) // Sort by trend score in descending order
      .map((row, index) => ({
        ...row,
        rank: index + 1, // Add rank based on sorted position
      }))
      .slice(0, 10); // Only show the top 10

    if (rankedRows.length === 0) {
      return <div></div>;
    }

    return (
      <div className="table-container" style={{ height: 400, width: "90%" }}>
        <h3 className="chart-title">Top YouTube Videos</h3>
        <DataGrid
          rows={rankedRows}
          columns={columns}
          pageSize={10} // Set the page size to 10 to show all rows without pagination
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          hideFooterPagination // Hide pagination controls
        />
      </div>
    );
  };

  const renderShoppingTable = () => {
    if (!statistics || !statistics.ShoppingResults) {
      console.error("ShoppingResults data is undefined or null");
      return <div></div>;
    }

    const { Title, Price, Rating, Reviews, Source } =
      statistics.ShoppingResults;

    if (!Title || !Price || !Rating || !Reviews || !Source) {
      console.error("ShoppingResults fields are undefined or null");
      return <div></div>;
    }

    const columns = [
      { field: "rank", headerName: "Rank", flex: 0.5 }, // Add ranking as the first column
      { field: "title", headerName: "Title", flex: 3 }, // Increase flex to occupy more space
      { field: "price", headerName: "Price", flex: 1 }, // Use flex instead of width for better scaling
      { field: "rating", headerName: "Rating", flex: 1 },
      { field: "reviews", headerName: "Reviews", flex: 1 },
      { field: "source", headerName: "Source", flex: 1 },
    ];

    const rankedRows = Object.keys(Title)
      .map((index) => ({
        id: index,
        title: Title[index],
        price: Price[index],
        rating: Rating[index],
        reviews: Reviews[index],
        source: Source[index],
      }))
      .sort((a, b) => b.reviews - a.reviews) // Sort by reviews in descending order
      .map((row, index) => ({
        ...row,
        rank: index + 1, // Add rank based on sorted position
      }))
      .slice(0, 10); // Only show the top 10

    if (rankedRows.length === 0) {
      return <div></div>;
    }

    return (
      <div className="table-container" style={{ height: 400, width: "90%" }}>
        <h3 className="chart-title">Top Shopping Items</h3>
        <DataGrid
          rows={rankedRows}
          columns={columns}
          pageSize={10} // Set the page size to 10 to show all rows without pagination
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          hideFooterPagination // Hide pagination controls
        />
      </div>
    );
  };

  return (
    <div className="statistics-page">
      {renderPieCharts()}
      {renderInterestByRegionBarChart()}
      {renderCombinedInterestOverTimeLineChart()}
      {renderYouTubeTable()}
      {renderShoppingTable()}
    </div>
  );
}

export default StatisticsPage;
