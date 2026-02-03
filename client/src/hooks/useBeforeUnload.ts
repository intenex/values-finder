import { useEffect } from 'react';
import { useProgressWarning } from './useProgressWarning';

export function useBeforeUnload() {
  const { shouldWarn } = useProgressWarning();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldWarn) {
        e.preventDefault();
        // Modern browsers show their own generic message
        // The return value is required for some browsers
        e.returnValue = 'You have unsaved progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldWarn]);
}
