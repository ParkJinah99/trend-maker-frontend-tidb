import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StatisticsPage from "./StatisticsPage/StatisticsPage";
import StrategiesPage from "./StrategiesPage/StrategiesPage";
import QueryContainer from "../../components/QueryContainer";
import { UserContext } from "../../contexts/UserContext";
import config from "../../config";
import "./ThreadsPage.css";
import { ReactComponent as ThreadIcon } from "../../components/icons/ThreadIcon.svg"; // Assuming you have an icon for threads
import { ReactComponent as SnapshotIcon } from "../../components/icons/SnapshotIcon.svg"; // Assuming you have an icon for snapshots

function ThreadsPage() {
  const { userId } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("statistics");
  const [selectedThread, setSelectedThread] = useState(null);
  const [threads, setThreads] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [isAddingLinkId, setIsAddingLinkId] = useState(null);
  const [isDeletingLinkId, setIsDeletingLinkId] = useState(null);
  const [isChangingNameId, setIsChangingNameId] = useState(null);
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false); // New state for snapshot loading
  const [hasFetchedStatistics, setHasFetchedStatistics] = useState(false);
  const [hasFetchedStrategies, setHasFetchedStrategies] = useState(false); // New state for strategies loading
  let currentData = {
    name: "Current",
    id: 0, // Set ID of current snapshot to 0
  };

  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    if (!userId) {
      console.error("userId is undefined. Redirecting to login.");
      navigate("/auth");
    } else {
      console.log("Fetching threads for user ID:", userId);
      fetchThreads();
    }
  }, [userId, navigate]);

  const fetchThreads = async () => {
    try {
      console.log("Fetching threads for user:", userId);
      const response = await fetch(
        `${config.backendUrl}/threads/user/${userId}`
      );
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.status === "success") {
          setThreads(responseData.data); // Assuming data is an array of threads
          console.log("Threads fetched successfully:", responseData.data);
        } else {
          console.error("Failed to retrieve threads:", responseData.message);
        }
      } else {
        console.error(
          "Failed to fetch threads",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  const handleDeleteThread = async (threadId) => {
    try {
      setIsDeletingLinkId(threadId);
      const response = await fetch(`${config.backendUrl}/threads/${threadId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setThreads(threads.filter((thread) => thread.id !== threadId));
        if (selectedThread && selectedThread.id === threadId) {
          setSelectedThread(null);
          setSnapshots([]);
        }
        console.log("Thread deleted successfully");
      } else {
        console.error("Failed to delete thread");
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
    } finally {
      setIsDeletingLinkId(null);
      fetchThreads();
    }
  };

  const handleRenameThread = async (threadId, newName) => {
    try {
      setIsChangingNameId(threadId); // Indicate that renaming is in progress
      const response = await fetch(
        `${config.backendUrl}/threads/rename/${threadId}/${newName}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.status === "success") {
          setThreads(
            threads.map((thread) =>
              thread.id === threadId ? { ...thread, name: newName } : thread
            )
          );
          if (selectedThread && selectedThread.id === threadId) {
            setSelectedThread({ ...selectedThread, name: newName });
          }
          console.log("Thread name updated successfully");
        } else {
          console.error("Failed to update thread name:", responseData.message);
        }
      } else {
        console.error("Failed to update thread name");
      }
    } catch (error) {
      console.error("Error updating thread name:", error);
    } finally {
      setIsChangingNameId(null); // Reset the renaming state
    }
  };

  const handleAddThread = () => {
    setSelectedSnapshot(null); // Reset selected snapshot
    setSelectedThread(null); // Reset selected thread
  };

  const fetchSnapshots = async (threadId) => {
    try {
      console.log("Fetching snapshots for thread:", threadId);

      // Fetch the snapshots
      const snapshotsResponse = await fetch(
        `${config.backendUrl}/threads/snapshot/${threadId}`
      );

      if (snapshotsResponse.ok) {
        const snapshotsResponseData = await snapshotsResponse.json();
        if (snapshotsResponseData.status === "success") {
          const fetchedSnapshots = snapshotsResponseData.data;
          console.log("Snapshots fetched successfully:", fetchedSnapshots);

          if (fetchedSnapshots.length > 0) {
            // Sort fetched snapshots by `timestamp_to` (most recent first)
            fetchedSnapshots.sort(
              (a, b) => new Date(b.timestamp_to) - new Date(a.timestamp_to)
            );

            // Append fetched snapshots to the predefined snapshotsData
            setSnapshots([currentData, ...fetchedSnapshots]);
          }
        } else {
          console.error(
            "Failed to retrieve snapshots:",
            snapshotsResponseData.message
          );
        }
      } else {
        console.error(
          "Failed to fetch snapshots",
          snapshotsResponse.status,
          snapshotsResponse.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching snapshots:", error);
      // If an error occurs, you might still want to set just the currentData
      setSnapshots([currentData]);
    }
  };

  const handleDeleteSnapshot = async (snapshotId) => {
    setIsDeletingLinkId(snapshotId);
    try {
      const response = await fetch(
        `${config.backendUrl}/threads/snapshot/${snapshotId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setSnapshots(
          snapshots.filter((snapshot) => snapshot.id !== snapshotId)
        );
        if (selectedSnapshot && selectedSnapshot.id === snapshotId) {
          setSelectedSnapshot(null);
        }
        console.log("Snapshot deleted successfully");
      } else {
        console.error("Failed to delete snapshot");
      }
    } catch (error) {
      console.error("Error deleting snapshot:", error);
    }
  };

  const handleTakeSnapshot = async () => {
    if (!selectedThread || isTakingSnapshot) {
      console.error("No thread selected or snapshot already in progress.");
      return;
    }

    setIsTakingSnapshot(true); // Lock the snapshot process

    // Add a temporary snapshot entry to the snapshots array
    const tempSnapshotId = "loading"; // Use a unique identifier
    const tempSnapshot = { id: tempSnapshotId, name: "" };
    setSnapshots((prevSnapshots) => [tempSnapshot, ...prevSnapshots]);
    setIsAddingLinkId(tempSnapshotId);

    let newSnapShot = null;

    try {
      const response = await fetch(
        `${config.backendUrl}/threads/snapshot/${selectedThread.id}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.status === "success") {
          console.log("Snapshot taken successfully:", responseData.data);
          newSnapShot = responseData.data.snapshot;
        } else {
          console.error("Failed to take snapshot:", responseData.message);
        }
      } else {
        console.error(
          "Failed to take snapshot",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error taking snapshot:", error);
    } finally {
      setIsTakingSnapshot(false); // Reset loading state
      setSnapshots((prevSnapshots) =>
        prevSnapshots.filter((snapshot) => snapshot.id !== tempSnapshotId)
      ); // Remove the temporary snapshot entry
      try {
        await fetchSnapshots(selectedThread.id); // Wait for fetchSnapshots to complete
        console.log("Snapshots refreshed successfully");
      } catch (error) {
        console.error("Error refreshing snapshots:", error);
      } finally {
        console.log("New Snapshot:", newSnapShot);
        setSelectedSnapshot(newSnapShot);
        console.log("selected");
        handleSnapshotClick(newSnapShot);
      }
      setIsAddingLinkId(null);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleThreadClick = (thread) => {
    if (!thread) return;
    console.log("Thread clicked:", thread);
    setSelectedThread(thread);
    setSnapshots([currentData]); // Reset snapshots
    setSelectedSnapshot(currentData); // Reset selected snapshot
    fetchSnapshots(thread.id); // Fetch snapshots for the selected thread
    console.log("Snapshots list:", snapshots);
    setHasFetchedStatistics(false);
    setActiveTab("statistics"); // Default to statistics when a thread is selected
  };

  const handleSnapshotClick = (snapshot) => {
    if (!snapshot) return;

    console.log("Snapshot clicked:", snapshot);
    setSelectedSnapshot(snapshot);

    // Fetch data according to the active tab
    if (activeTab === "statistics") {
      // Trigger fetching of statistics if it's the active tab
      setHasFetchedStatistics(false); // Reset the fetched flag to trigger re-fetch
    } else if (activeTab === "strategies") {
      // Trigger fetching of strategies if it's the active tab
      // You could add a similar flag for strategies if needed
      setHasFetchedStrategies(false); // Assuming you want to reset the fetch flag for strategies
    }
  };

  return (
    <div className="threads-page">
      <Sidebar
        links={[
          {
            name: "Threads",
            icon: <ThreadIcon className="h-4 w-4" />,
            isHeader: true,
          },
          ...threads.map((thread) => ({
            id: thread.id,
            name: thread.name,
            onClick: () => handleThreadClick(thread),
            onDelete: () => handleDeleteThread(thread.id), // Pass the onDelete function here
            onRename: (newName) => handleRenameThread(thread.id, newName),
          })),
        ]}
        addNew={handleAddThread}
        currentSelection={selectedThread}
        isDeletingLinkId={isDeletingLinkId}
        isChangingNameId={isChangingNameId}
        onNameChange={(id, newName) => handleRenameThread(id, newName)}
        onDelete={(id) => handleDeleteThread(id)} // Pass the onDelete function here
      />

      <Sidebar
        links={[
          {
            name: "Snapshots",
            icon: <SnapshotIcon className="h-4 w-4" />,
            isHeader: true,
          },
          ...snapshots.map((snapshot) => ({
            id: snapshot.id,
            name:
              snapshot.name === "Current" ? "Current" : snapshot.timestamp_to,
            onClick: () => handleSnapshotClick(snapshot),
            onDelete: () => handleDeleteSnapshot(snapshot.id),
          })),
        ]}
        takeSnapshot={handleTakeSnapshot}
        currentSelection={selectedSnapshot}
        isDeletingLinkId={isDeletingLinkId}
        isAddingLinkId={isAddingLinkId}
        isLoadingFetching={isTakingSnapshot} // Pass the loading state here
        onDelete={(id) => handleDeleteSnapshot(id)} // Pass the onDelete function here
      />

      <div className="main-content">
        {!selectedThread && !selectedSnapshot ? (
          <QueryContainer onSubmitSuccess={fetchThreads} />
        ) : (
          <>
            <div className="tabs">
              <button
                className={`tab-button ${
                  activeTab === "statistics" ? "active" : ""
                }`}
                onClick={() => handleTabClick("statistics")}
              >
                Statistics
              </button>
              {selectedSnapshot &&
                selectedSnapshot.id !== 0 &&
                selectedSnapshot.name !== "Current" && (
                  <button
                    className={`tab-button ${
                      activeTab === "strategies" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("strategies")}
                  >
                    Strategies
                  </button>
                )}
            </div>
            <div className="tab-content">
              {selectedThread && activeTab === "statistics" && (
                <StatisticsPage
                  thread={selectedThread}
                  snapshot={selectedSnapshot}
                  hasFetched={hasFetchedStatistics}
                />
              )}
              {selectedThread &&
                activeTab === "strategies" &&
                selectedSnapshot &&
                selectedSnapshot.id !== 0 &&
                selectedSnapshot.name !== "Current" && (
                  <StrategiesPage
                    thread={selectedThread}
                    snapshot={selectedSnapshot}
                    hasFetched={hasFetchedStrategies}
                  />
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ThreadsPage;
