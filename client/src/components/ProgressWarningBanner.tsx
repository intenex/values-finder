import { useState } from 'react';
import { AlertTriangle, Cloud } from 'lucide-react';
import { useProgressWarning } from '@/hooks/useProgressWarning';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';

interface ProgressWarningBannerProps {
  currentRoundNumber: number;
}

export function ProgressWarningBanner({ currentRoundNumber }: ProgressWarningBannerProps) {
  const { isAuthenticated } = useProgressWarning();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Don't show anything if no progress yet
  if (currentRoundNumber === 0) return null;

  // Authenticated users see the "saved" message
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Cloud className="h-3 w-3" />
        <span>Progress saved automatically</span>
      </div>
    );
  }

  // Unauthenticated users with progress see the warning
  return (
    <>
      <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-md px-3 py-2">
        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
        <span>Your progress is not saved.</span>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs text-amber-700 dark:text-amber-400 underline"
          onClick={() => setShowAuthModal(true)}
        >
          Sign up to save
        </Button>
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </>
  );
}
