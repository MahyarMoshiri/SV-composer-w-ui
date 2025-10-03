import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiEndpoints } from '@/lib/api';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StatusPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await apiEndpoints.status();
      if (response.data) {
        setStatus({
          envelope: response.data,
          data: response.data?.data || {},
        });
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">System Status</h2>
          <p className="text-muted-foreground mt-1">
            Runtime information, SDK version, and system health
          </p>
        </div>
        <Button onClick={fetchStatus} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {status ? (
        (() => {
          const payload = status.data || {};
          const envelope = status.envelope || {};
          return (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">SDK Version</h4>
                <Badge variant="outline">{payload.sdk_version || 'N/A'}</Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Default LLM Harness</h4>
                <Badge>{payload.llm_default || 'N/A'}</Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Embedder</h4>
                <Badge variant="secondary">{payload.embedder || 'N/A'}</Badge>
              </div>

              {payload.uptime_sec !== undefined && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Uptime</h4>
                  <p className="text-sm">{`${payload.uptime_sec}s`}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank Versions</CardTitle>
            </CardHeader>
            <CardContent>
              {payload.bible_versions ? (
                <div className="space-y-2">
                  {Object.entries(payload.bible_versions).map(([bank, version]) => (
                    <div key={bank} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{bank}</span>
                      <Badge variant="outline">{version}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No bank version information</p>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Full Status Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
                {JSON.stringify(envelope, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
          );
        })()
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{loading ? 'Loading status...' : 'No status information available'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatusPage;
