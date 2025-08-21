import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T | null = null): [T | null, (value: T | null) => void] {
  // Initialize the state with the current value in localStorage
  const [value, setValue] = useState<T | null>(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  });

  useEffect(() => {
    function listener(event: StorageEvent) {
      if (event.storageArea === localStorage && event.key === key) {
        setValue(event.newValue ? JSON.parse(event.newValue) : null); // Use event.newValue to get the updated value
      }
    }

    function customListener(event: CustomEvent) {
      if (event.detail.key === key) {
        setValue(event.detail.newValue ? JSON.parse(event.detail.newValue) : null);
      }
    }

    window.addEventListener("storage", listener);
    window.addEventListener("localStorageChange", customListener as EventListener);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener("storage", listener);
      window.removeEventListener("localStorageChange", customListener as EventListener);
    };
  }, [key]); // Add key as a dependency

  const setLocalStorageValue = (newValue: T | null) => {
    if (newValue !== null) {
      const stringValue = JSON.stringify(newValue);
      localStorage.setItem(key, stringValue);
      setValue(newValue); // Update state immediately after setting in localStorage
      window.dispatchEvent(
        new CustomEvent("localStorageChange", {
          detail: { key, newValue: stringValue },
        })
      );
    } else {
      localStorage.removeItem(key);
      setValue(null); // Update state to null
      window.dispatchEvent(
        new CustomEvent("localStorageChange", {
          detail: { key, newValue: null },
        })
      );
    }
  };

  return [value, setLocalStorageValue] as const; // Use 'as const' for better type inference
}
