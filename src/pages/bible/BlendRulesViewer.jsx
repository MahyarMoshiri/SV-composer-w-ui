import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BlendRulesViewer = () => {
  const [blendRules, setBlendRules] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBlendRules();
  }, []);

  const fetchBlendRules = async () => {
    setLoading(true);
    try {
      const response = await apiEndpoints.getBlendRules();
      if (response.data && response.data.data) {
        setBlendRules(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch blend rules:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading blend rules...</div>;
  }

  if (!blendRules) {
    return <div className="text-center py-8 text-muted-foreground">No blend rules found</div>;
  }

  const summary = blendRules.summary || {};
  const rules = blendRules.rules || {};
  const bankset = blendRules.bankset || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Blend Rules Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bankset.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Bankset</h4>
              <div className="flex flex-wrap gap-2">
                {bankset.map((bank) => (
                  <Badge key={bank}>{bank}</Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">Version</h4>
            <Badge>{summary.version || '0.1.0'}</Badge>
          </div>

          {typeof summary.vital_relations === 'number' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-1 text-sm">Vital Relations</h4>
                <p className="text-sm text-muted-foreground">{summary.vital_relations}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-sm">Operators</h4>
                <p className="text-sm text-muted-foreground">{summary.operators}</p>
              </div>
            </div>
          )}

          {Array.isArray(rules.vital_relations) && rules.vital_relations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Vital Relations</h4>
              <div className="flex flex-wrap gap-2">
                {rules.vital_relations.slice(0, 10).map((relation) => (
                  <Badge key={relation.id} variant="secondary">{relation.id}</Badge>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(rules.operators) && rules.operators.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Operators</h4>
              <div className="flex flex-wrap gap-2">
                {rules.operators.slice(0, 10).map((operator) => (
                  <Badge key={operator.id} variant="outline">{operator.id}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
            {JSON.stringify(rules, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlendRulesViewer;
