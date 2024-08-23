import { useState, useEffect } from "react";

export function useDebouncedResizeObserver(callback, delay = 100) {
  const [resizeObserver] = useState(
    () =>
      new ResizeObserver(
        debounce((entries) => {
          callback(entries);
        }, delay)
      )
  );

  useEffect(() => {
    return () => resizeObserver.disconnect();
  }, [resizeObserver]);

  return resizeObserver;
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
