import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/lib/auth';
import { useValuesStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { LogOut, TrendingUp, Calendar, PlayCircle, RefreshCw, ClipboardList } from 'lucide-react';

interface ValuesSession {
  id: string;
  createdAt: string;
  completedAt?: string;
  topValues: Array<{
    id: number;
    name: string;
    description: string;
    rating: number;
    score: number;
    isCustom: boolean;
  }>;
  progress?: {
    phase: 'screening' | 'refinement' | 'rating';
    completedSets: number;
    totalSets: number;
  };
}

export function UserProfile() {
  const [, navigate] = useLocation();
  const { user, logout, getValuesSessions, isAuthenticated } = useAuthStore();
  const { reset } = useValuesStore();
  const [sessions, setSessions] = useState<ValuesSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ValuesSession | null>(null);
  
  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated]);
  
  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getValuesSessions();
      setSessions(data);
      // Select the most recent completed session by default
      const completedSessions = data.filter(s => s.completedAt);
      if (completedSessions.length > 0 && !selectedSession) {
        setSelectedSession(completedSessions[0]);
      } else if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0]);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
    setLoading(false);
  };
  
  if (!isAuthenticated || !user) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Values History</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>Your completed values exercises</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : sessions.length === 0 ? (
                <p className="text-muted-foreground">No sessions yet</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div key={session.id} className="relative">
                      <Button
                        variant={selectedSession?.id === session.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedSession(session)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        <span className="flex-1 text-left">
                          {format(new Date(session.createdAt), 'MMM d, yyyy')}
                        </span>
                        {!session.completedAt && session.progress && (
                          <span className="text-xs text-orange-600 ml-2">
                            {Math.round((session.progress.completedSets / session.progress.totalSets) * 100)}% complete
                          </span>
                        )}
                      </Button>
                      {!session.completedAt && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/comparison');
                          }}
                        >
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        
        {selectedSession && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedSession.completedAt 
                  ? `Values from ${format(new Date(selectedSession.createdAt), 'MMMM d, yyyy')}`
                  : `In Progress - Started ${format(new Date(selectedSession.createdAt), 'MMMM d, yyyy')}`
                }
              </CardTitle>
              <CardDescription>
                {selectedSession.completedAt 
                  ? 'Your top 10 values and how well you were living by them'
                  : `${selectedSession.progress?.completedSets || 0} of ${selectedSession.progress?.totalSets || 71} rounds completed`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedSession.completedAt ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    This assessment is still in progress. Resume to complete it and see your results.
                  </p>
                  <Button onClick={() => navigate('/comparison')}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Resume Assessment
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex flex-col sm:flex-row gap-3">
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/reassess')}
                      className="flex-1 sm:flex-none"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reassess Values
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => {
                        reset();
                        navigate('/');
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Retake Full Test
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedSession.topValues.map((value, index) => (
                      <div key={value.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm font-bold">
                                {index + 1}
                              </span>
                              <h4 className="font-semibold text-lg">{value.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground ml-11">{value.description}</p>
                          </div>
                          <div className="text-center min-w-[80px]">
                            <div className="text-2xl font-bold text-primary">
                              {value.rating}
                              <span className="text-lg text-muted-foreground">/10</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Rating</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {sessions.length > 1 && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm">
                        <strong>Tip:</strong> Use the session list on the left to view your progress over time and see how your values and ratings have evolved.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}