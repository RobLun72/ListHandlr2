import { useEffect } from "react";

interface UseUnsavedChangesWarningProps {
  isDirty: boolean;
  message?: string;
}

export function useUnsavedChangesWarning({
  isDirty,
  message = "You have unsaved changes. Are you sure you want to leave?",
}: UseUnsavedChangesWarningProps) {
  useEffect(() => {
    if (!isDirty) return;

    // Prevent page refresh/close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    // Prevent browser back/forward navigation
    const handlePopState = (event: PopStateEvent) => {
      if (event === undefined) {
        console.log("PopStateEvent is undefined");
      }
      if (confirm(message)) {
        // User confirmed, allow navigation
        return;
      } else {
        // User cancelled, prevent navigation
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Push state to enable popstate detection
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty, message]);
}
