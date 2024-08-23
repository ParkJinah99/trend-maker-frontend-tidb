import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as AddIcon } from "./icons/AddIcon.svg";
import { ReactComponent as DeleteIcon } from "./icons/DeleteIcon.svg";
import { ReactComponent as MoreIcon } from "./icons/MoreIcon.svg";
import { ReactComponent as RenameIcon } from "./icons/RenameIcon.svg";
import { ReactComponent as CameraIcon } from "./icons/CameraIcon.svg";

import { Tooltip, Dropdown } from "flowbite-react";

import { useDebouncedResizeObserver } from "./ResizeObserver";
import "./Sidebar.css";

function Sidebar({
  links,
  addNew,
  takeSnapshot,
  currentSelection,
  onDelete,
  onNameChange,
  isLoadingFetching,
  isDeletingLinkId,
  isChangingNameId,
  isAddingLinkId,
}) {
  const sidebarRef = useRef(null);
  const resizeObserver = useDebouncedResizeObserver((entries) => {
    entries.forEach((entry) => {
      console.log("Sidebar resized:", entry.target);
    });
  });

  useEffect(() => {
    if (sidebarRef.current) {
      resizeObserver.observe(sidebarRef.current);
    }
    return () => {
      if (sidebarRef.current) {
        resizeObserver.unobserve(sidebarRef.current);
      }
    };
  }, [sidebarRef, resizeObserver]);

  const [isVisible, setIsVisible] = useState(true);
  const [editingLinkId, setEditingLinkId] = useState(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    console.log("Current Selection:", currentSelection);
  }, [currentSelection]);

  const handleRenameClick = (link) => {
    setEditingLinkId(link.id);
    setNewName(link.name);
  };

  const handleInputChange = (event) => {
    setNewName(event.target.value);
  };

  const handleInputBlur = () => {
    if (editingLinkId !== null) {
      onNameChange(editingLinkId, newName); // Call the onNameChange function passed from props
      setEditingLinkId(null);
    }
  };

  const handleInputKeyPress = (event) => {
    if (event.key === "Enter") {
      handleInputBlur();
    }
  };

  return (
    <div
      ref={sidebarRef}
      className={`relative bg-gray-100 shrink-0 ${
        isVisible ? "w-[150px] md:w-[250px]" : "w-0"
      } md:flex md:items-start md:flex-col dark:bg-[rgb(18,18,18)] transition-width duration-300 ease-in-out`}
    >

      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute top-1/2 right-[-12px] -translate-y-1/2 bg-[var(--button-bg)] border dark:bg-[rgb(18,18,18)] p-1 rounded-full focus:outline-none focus:ring z-10"
      >
        <i
          className={`fas ${
            isVisible ? "fa-chevron-left" : "fa-chevron-right"
          }`}
        ></i>
      </button>

      {isVisible && (
        <>
          {addNew && (
            <div className="flex flex-col items-end px-4 pt-2 w-full">
              <Tooltip content="New Query" placement="right">
                <button
                  onClick={addNew}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 focus:outline-none flex items-end ml-2 bg-transparent"
                >
                  <AddIcon className="w-5 h-5 ml-1 fill-white text-white-500 dark:text-white-400" />
                </button>
              </Tooltip>
            </div>
          )}
          {takeSnapshot && (
            <div className="flex flex-col items-end px-4 pt-2 w-full">
              <Tooltip content="Save Current Statistics" placement="right">
                <button
                  onClick={takeSnapshot}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 focus:outline-none flex items-end ml-2 bg-transparent"
                  disabled={isLoadingFetching} // Disable the button while loading
                >
                  <CameraIcon className="w-5 h-5 ml-1 fill-white text-white-500 dark:text-white-400" />
                </button>
              </Tooltip>
            </div>
          )}

          <nav className="flex-1 flex flex-col items-start px-4 pb-4 text-sm w-full">
            {links.map((link, index) =>
              link.isHeader ? (
                <div
                  key={index}
                  className="sidebar-header w-full flex items-center px-3 py-2 text-gray-900 dark:text-gray-50"
                >
                  {link.icon}
                  <span className="ml-2">{link.name}</span>
                </div>
              ) : (
                <div
                  key={index}
                  className={`flex my-2 items-center w-full rounded-lg px-3 py-2 transition-all 
                    ${
                      currentSelection && currentSelection.id === link.id
                        ? "bg-blue-100 dark:bg-blue-700 text-gray-900 dark:text-gray-50"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
                    }`}
                >
                  {editingLinkId === link.id ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      onKeyPress={handleInputKeyPress}
                      autoFocus
                      className="flex-1 truncate px-2 py-1 bg-gray-100 border rounded"
                    />
                  ) : (
                    <Link
                      to="#"
                      className="flex-1 truncate"
                      onClick={() => link.onClick()}
                    >
                      {isAddingLinkId === link.id ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-3"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="M12 22c5.421 0 10-4.579 10-10S17.421 2 12 2 2 6.579 2 12s4.579 10 10 10zm0-2c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-14a6 6 0 00-6 6h12a6 6 0 00-6-6zm0 10a6 6 0 006-6H6a6 6 0 006 6z"
                            />
                          </svg>
                          Loading...
                        </div>
                      ) : isDeletingLinkId === link.id ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-3"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="M12 22c5.421 0 10-4.579 10-10S17.421 2 12 2 2 6.579 2 12s4.579 10 10 10zm0-2c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-14a6 6 0 00-6 6h12a6 6 0 00-6-6zm0 10a6 6 0 006-6H6a6 6 0 006 6z"
                            />
                          </svg>
                          Deleting...
                        </div>
                      ) : isChangingNameId === link.id ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-3"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="M12 22c5.421 0 10-4.579 10-10S17.421 2 12 2 2 6.579 2 12s4.579 10 10 10zm0-2c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 8-8 8zm0-14a6 6 0 00-6 6h12a6 6 0 00-6-6zm0 10a6 6 0 006-6H6a6 6 0 006 6z"
                            />
                          </svg>
                          Renaming...
                        </div>
                      ) : (
                        <span className="ml-2 flex-1 truncate">
                          {link.name}
                        </span>
                      )}
                    </Link>
                  )}
                  {link.name !== "Current" && (
                    <Tooltip content="More Actions" placement="right">
                      <Dropdown
                        label=""
                        class="dropdown"
                        dismissOnClick={false}
                        renderTrigger={() => (
                          <span>
                            {<MoreIcon className="w-4 h-4 flex-shrink-0" />}
                          </span>
                        )}
                      >
                        <Dropdown.Item className="tap-dropdown-item"
                          icon={DeleteIcon}
                          onClick={() => onDelete(link.id)}
                        >
                          Delete
                        </Dropdown.Item>
                        {link.onRename && (
                          <Dropdown.Item
                            className="tap-dropdown-item"
                            icon={RenameIcon}
                            onClick={() => handleRenameClick(link)}
                          >
                            Rename
                          </Dropdown.Item>
                        )}
                      </Dropdown>
                    </Tooltip>
                  )}
                </div>
              )
            )}
          </nav>
        </>
      )}
    </div>
  );
}

export default Sidebar;
