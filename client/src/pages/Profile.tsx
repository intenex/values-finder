import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/lib/auth';
import { useValuesStore } from '@/lib/store';
import { UserProfile } from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';

export default function Profile() {
  const [, navigate] = useLocation();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { reset } = useValuesStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Sign in to view your values history</h1>
            <p className="text-muted-foreground">
              Track how your values change over time and see your progress.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setShowAuthModal(true)}>
                Sign In / Sign Up
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
        
        <AuthModal 
          open={showAuthModal} 
          onOpenChange={setShowAuthModal}
          onSuccess={() => setShowAuthModal(false)}
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <UserProfile />
        
        <div className="mt-8 flex justify-center">
          <Button onClick={() => {
            reset();
            navigate('/');
          }}>
            Start New Values Exercise
          </Button>
        </div>
      </div>
    </div>
  );
}