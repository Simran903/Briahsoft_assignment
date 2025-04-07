import { FC, useState, ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Github, Search, AlertCircle, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface UserProfileAnalyzerProps {}

const UserProfileAnalyzer: FC<UserProfileAnalyzerProps> = () => {
  const [username, setUsername] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);
  const [repos, setRepos] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [commitData, setCommitData] = useState<Record<string, number>>({});

  const fetchUserData = async (): Promise<void> => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const userResponse: Response = await fetch(`https://api.github.com/users/${username}`);
      if (!userResponse.ok) {
        throw new Error('User not found');
      }
      const userDataJson: any = await userResponse.json();
      
      const reposResponse: Response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
      const reposData: Array<any> = await reposResponse.json();
      
      const mockCommitData: Record<string, number> = generateMockCommitData();
      
      setUserData(userDataJson);
      setRepos(reposData);
      setCommitData(mockCommitData);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch GitHub data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockCommitData = (): Record<string, number> => {
    const data: Record<string, number> = {};
    const today: Date = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date: Date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString: string = date.toISOString().split('T')[0];
      data[dateString] = Math.floor(Math.random() * 10);
    }
    
    return data;
  };

  // Improved commit chart rendering function with fixed blue colors
  const renderCommitChart = (): ReactElement => {
    const dates: string[] = Object.keys(commitData).sort();
    const maxCommits: number = Math.max(...Object.values(commitData), 1);
    
    // Calculate total commits
    const totalCommits = Object.values(commitData).reduce((sum, current) => sum + current, 0);
    
    // Find day with most commits
    const mostActiveDay = Object.entries(commitData).reduce(
      (max, [date, count]) => (count > max.count ? { date, count } : max),
      { date: '', count: 0 }
    );
    
    // Group by week for weekly summary
    const weeks: Record<string, number> = {};
    dates.forEach(date => {
      const d = new Date(date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) weeks[weekKey] = 0;
      weeks[weekKey] += commitData[date];
    });
    
    // Format date for display
    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    // Get commit bar color based on commit count - fixed to use predefined Tailwind classes
    const getCommitBarColor = (commits: number): string => {
      if (commits === 0) return 'bg-gray-100';
      if (commits <= maxCommits * 0.2) return 'bg-blue-100';
      if (commits <= maxCommits * 0.4) return 'bg-blue-200';
      if (commits <= maxCommits * 0.6) return 'bg-blue-300';
      if (commits <= maxCommits * 0.8) return 'bg-blue-400';
      return 'bg-blue-500';
    };
    
    return (
      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Total Commits</div>
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold mt-2">{totalCommits}</div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Most Active Day</div>
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold mt-2">
                {mostActiveDay.count > 0 ? formatDate(mostActiveDay.date) : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {mostActiveDay.count} commits
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Average Per Day</div>
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold mt-2">
                {(totalCommits / dates.length).toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 mt-1">commits per day</div>
            </CardContent>
          </Card>
        </div>
      
        <h3 className="text-lg font-medium mb-3">Commit Activity (Last 30 Days)</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex flex-col">
            {/* Weekly labels */}
            <div className="flex justify-between mb-2 text-xs text-gray-500">
              {Object.keys(weeks).sort().map(week => (
                <div key={`week-${week}`} className="flex-1 text-center">
                  Week of {formatDate(week)}
                </div>
              ))}
            </div>
            
            {/* Commit chart */}
            <div className="flex items-end h-40 gap-1">
              {dates.map(date => {
                const commits = commitData[date];
                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                const isWeekend = ['Sat', 'Sun'].includes(dayName);
                const barColor = isWeekend ? 'bg-blue-200' : getCommitBarColor(commits);
                const barHeight = Math.max(5, (commits / maxCommits) * 100);
                
                return (
                  <div key={date} className="flex-1 flex flex-col items-center group">
                    <div className="text-xs px-1 py-0.5 bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                      {commits} on {formatDate(date)} ({dayName})
                    </div>
                    <div 
                      className={`w-full rounded ${barColor} hover:ring-2 hover:ring-blue-500 transition-all`}
                      style={{ height: `${barHeight}%` }}
                    ></div>
                  </div>
                );
              })}
            </div>
            
            {/* Date labels (show every 5th day for cleaner UI) */}
            <div className="flex justify-between mt-1">
              {dates.map((date, i) => (
                <div key={`label-${date}`} className="flex-1 text-center">
                  {i % 5 === 0 && (
                    <span className="text-xs text-gray-500">{formatDate(date).split(' ')[1]}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Color legend */}
          <div className="mt-4 flex items-center justify-end">
            <div className="text-xs text-gray-500 mr-2">Fewer</div>
            <div className="bg-blue-100 w-4 h-4 rounded"></div>
            <div className="bg-blue-200 w-4 h-4 rounded"></div>
            <div className="bg-blue-300 w-4 h-4 rounded"></div>
            <div className="bg-blue-400 w-4 h-4 rounded"></div>
            <div className="bg-blue-500 w-4 h-4 rounded"></div>
            <div className="text-xs text-gray-500 ml-2">More</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl p-4 mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-6 w-6" />
            GitHub User Profile Analyzer
          </CardTitle>
          <CardDescription>
            Enter a GitHub username to view their public activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchUserData()}
            />
            <Button onClick={fetchUserData} disabled={loading}>
              {loading ? 'Loading...' : <Search className="h-4 w-4 mr-2" />}
              {loading ? '' : 'Analyze'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {userData && (
            <div className="mt-6">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={userData.avatar_url} 
                  alt={`${username}'s avatar`} 
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h2 className="text-xl font-bold">{userData.name || username}</h2>
                  <p className="text-gray-500">{userData.bio || 'No bio available'}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-sm">Followers: {userData.followers}</span>
                    <span className="text-sm">Following: {userData.following}</span>
                    <span className="text-sm">Public Repos: {userData.public_repos}</span>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="repositories">
                <TabsList>
                  <TabsTrigger value="repositories">Repositories</TabsTrigger>
                  <TabsTrigger value="commits">Commits</TabsTrigger>
                </TabsList>
                <TabsContent value="repositories">
                  <div className="mt-4">
                    <h3 className="mb-2 font-medium">Repositories ({repos.length})</h3>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {repos.length > 0 ? (
                        repos.map(repo => (
                          <Card key={repo.id} className="overflow-hidden">
                            <CardHeader className="p-4">
                              <CardTitle className="text-lg font-medium">{repo.name}</CardTitle>
                              <CardDescription className="line-clamp-2">
                                {repo.description || 'No description available'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-sm flex justify-between">
                              <div className="flex gap-3">
                                <span>⭐ {repo.stargazers_count}</span>
                                <span>🍴 {repo.forks_count}</span>
                              </div>
                              <span>{repo.language || 'Unknown'}</span>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p>No repositories found</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="commits">
                  {renderCommitChart()}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileAnalyzer;