import { useState, useEffect, useRef, createContext, useContext, useCallback, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useProgressWarning } from '@/hooks/useProgressWarning';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';

// Pages where quiz progress exists - don't warn when navigating between these
const QUIZ_PAGES = ['/comparison', '/customize', '/rating'];

const isQuizPage = (path: string) => QUIZ_PAGES.some(p => path.startsWith(p));

interface NavigationGuardContextType {
  guardedNavigate: (to: string) => void;
}

const NavigationGuardContext = createContext<NavigationGuardContextType | null>(null);

export function useGuardedNavigation() {
  const context = useContext(NavigationGuardContext);
  if (!context) {
    throw new Error('useGuardedNavigation must be used within NavigationGuard');
  }
  return context;
}

interface NavigationGuardProps {
  children: ReactNode;
}

export function NavigationGuard({ children }: NavigationGuardProps) {
  const [location, navigate] = useLocation();
  const { shouldWarn, completedSets } = useProgressWarning();
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const previousLocation = useRef(location);

  // Intercept navigation
  const guardedNavigate = useCallback((to: string) => {
    const currentPath = previousLocation.current;
    const leavingQuiz = isQuizPage(currentPath) && !isQuizPage(to);

    if (shouldWarn && leavingQuiz) {
      setPendingNavigation(to);
      setShowWarningDialog(true);
    } else {
      navigate(to);
    }
  }, [shouldWarn, navigate]);

  const handleConfirmLeave = () => {
    setShowWarningDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleSignUp = () => {
    setShowWarningDialog(false);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Progress will auto-save via AuthModal, then navigate if there was a pending navigation
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowWarningDialog(false);
    setPendingNavigation(null);
  };

  // Update previous location ref
  useEffect(() => {
    previousLocation.current = location;
  }, [location]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const newLocation = window.location.pathname;
      const leavingQuiz = isQuizPage(previousLocation.current) && !isQuizPage(newLocation);

      if (shouldWarn && leavingQuiz) {
        // Push the previous location back to prevent navigation
        window.history.pushState(null, '', previousLocation.current);
        setPendingNavigation(newLocation);
        setShowWarningDialog(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [shouldWarn]);

  return (
    <NavigationGuardContext.Provider value={{ guardedNavigate }}>
      {children}

      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your progress is not saved!</AlertDialogTitle>
            <AlertDialogDescription>
              You've completed {completedSets} round{completedSets !== 1 ? 's' : ''} but your progress will be lost
              if you leave without signing up. Would you like to create an account
              to save your work?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={handleCancelNavigation}>
              Stay Here
            </AlertDialogCancel>
            <Button variant="outline" onClick={handleConfirmLeave}>
              Leave Anyway
            </Button>
            <AlertDialogAction onClick={handleSignUp}>
              Sign Up to Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </NavigationGuardContext.Provider>
  );
}
