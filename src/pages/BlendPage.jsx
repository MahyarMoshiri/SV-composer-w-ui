import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { apiEndpoints } from '@/lib/api';
import { Blend, AlertTriangle } from 'lucide-react';

const BlendPage = () => {
  const [activeState, setActiveState] = useState(JSON.stringify({
    schemas: ['path'],
    metaphors: ['time_is_motion'],
    poles: {},
    gates: []
  }, null, 2));
  const [explosionFired, setExplosionFired] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBlend = async () => {
    setLoading(true);
    try {
      const active = JSON.parse(activeState);
      const response = await apiEndpoints.blend({
        active,
        explosion_fired: explosionFired,
      });
      
      if (response.data && response.data.data) {
        setResult(response.data.data);
      }
    } catch (error) {
      console.error('Blend failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Blend</h2>
        <p className="text-muted-foreground mt-1">
          Test semantic blending with mental spaces and constrained rules
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Active State (JSON)</label>
              <Textarea
                value={activeState}
                onChange={(e) => setActiveState(e.target.value)}
                rows={12}
                className="font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={explosionFired}
                onChange={(e) => setExplosionFired(e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm font-medium">Explosion Fired</label>
            </div>

            <Button onClick={handleBlend} disabled={loading} className="w-full">
              <Blend className="h-4 w-4 mr-2" />
              {loading ? 'Blending...' : 'Run Blend'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blend Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                {result.audit?.penalties && result.audit.penalties.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      {result.audit.penalties.length} Penalties Detected
                    </span>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Blend Output</h4>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
                    {JSON.stringify(result.blend, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Audit Log</h4>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
                    {JSON.stringify(result.audit, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Blend className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Run blend to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlendPage;
