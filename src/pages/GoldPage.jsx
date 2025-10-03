import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiEndpoints } from '@/lib/api';
import { Award } from 'lucide-react';

const GoldPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await apiEndpoints.goldStats();
      if (response.data && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch gold stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Gold Corpus</h2>
        <p className="text-muted-foreground mt-1">
          Gold-standard evaluation data statistics and metrics
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center text-muted-foreground">Loading statistics...</div>
          </CardContent>
        </Card>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Count</h4>
                <p className="text-2xl font-bold">{stats.count || 0}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Bankset</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.bankset?.map((bank, i) => (
                    <Badge key={i}>{bank}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Bible Version</h4>
                <Badge variant="outline">{stats.bible_version || 'N/A'}</Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">SHA-256 Digest</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {stats.sha256 || 'N/A'}
                </code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
                {JSON.stringify(stats, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No statistics available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoldPage;
