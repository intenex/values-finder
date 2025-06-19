import { useLocation } from 'wouter';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';
import { useState } from 'react';
import { AuthModal } from './AuthModal';

export function Navigation() {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  return (
    <>
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="text-xl font-bold hover:opacity-80 transition-opacity"
          >
            Values Compass
          </button>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user?.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAuthModal(true)}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </>
  );
}