import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApp } from '@/contexts/AppContext';
import { Database, Info } from 'lucide-react';

const BanksPage = () => {
  const { availableBanks } = useApp();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Banks Registry</h2>
        <p className="text-muted-foreground mt-1">
          Manage and inspect available banks for schemas, metaphors, frames, and gold labels
        </p>
      </div>

      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Bank Selection:</strong> Use the bankset selector in the top bar to choose active banks.
            Banks can be specified via the <code className="bg-muted px-1 py-0.5 rounded text-xs">X-SV-Banks</code> header
            or <code className="bg-muted px-1 py-0.5 rounded text-xs">?banks=</code> query parameter.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          {availableBanks.map((bank) => (
            <Card key={bank.bank_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {bank.bank_id}
                  </CardTitle>
                  <Badge>{bank.version}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Root Path</h4>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    {bank.root}
                  </code>
                </div>

                {bank.files && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Files</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(bank.files).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium capitalize">{key}:</span>{' '}
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">{value}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {availableBanks.length === 0 && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No banks available</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BanksPage;
