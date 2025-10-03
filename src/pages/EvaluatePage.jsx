import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { apiEndpoints } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const formatJson = (value) => JSON.stringify(value, null, 2);

const parseJson = (raw, fallback = {}) => {
  if (!raw.trim()) return fallback;
  return JSON.parse(raw);
};

const EvaluatePage = () => {
  const [singlePiece, setSinglePiece] = useState('');
  const [singleTrace, setSingleTrace] = useState('');
  const [singleResult, setSingleResult] = useState(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState(null);

  const [batchPayload, setBatchPayload] = useState('[\n  {"id": "sample", "piece": "", "trace": {}}\n]');
  const [batchResult, setBatchResult] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState(null);

  const [frameId, setFrameId] = useState('');
  const [frameActive, setFrameActive] = useState('');
  const [frameTrace, setFrameTrace] = useState('');
  const [frameResult, setFrameResult] = useState(null);
  const [frameLoading, setFrameLoading] = useState(false);
  const [frameError, setFrameError] = useState(null);

  const renderError = (message) => (
    <Alert variant="destructive">
      <AlertTitle>Request failed</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );

  const handleSingleEvaluate = async () => {
    if (!singlePiece.trim()) {
      setSingleError('Provide a piece to evaluate');
      return;
    }

    let tracePayload = {};
    try {
      tracePayload = parseJson(singleTrace, {});
    } catch (err) {
      setSingleError(`Trace JSON invalid: ${err.message}`);
      return;
    }

    setSingleLoading(true);
    setSingleError(null);

    try {
      const response = await apiEndpoints.evaluate({
        piece: singlePiece,
        trace: tracePayload,
      });
      const data = response.data?.data;
      if (data) {
        setSingleResult(data);
      } else {
        setSingleError('No evaluation data returned');
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
      setSingleError(err?.response?.data?.errors?.join(', ') || err.message || 'Evaluation failed');
    } finally {
      setSingleLoading(false);
    }
  };

  const handleBatchEvaluate = async () => {
    let payload;
    try {
      payload = parseJson(batchPayload, []);
    } catch (err) {
      setBatchError(`Batch JSON invalid: ${err.message}`);
      return;
    }

    if (!Array.isArray(payload) || !payload.length) {
      setBatchError('Batch payload must be a non-empty JSON array');
      return;
    }

    setBatchLoading(true);
    setBatchError(null);

    try {
      const response = await apiEndpoints.evaluateBatch(payload);
      const data = response.data;
      setBatchResult(data);
    } catch (err) {
      console.error('Batch evaluation failed:', err);
      setBatchError(err?.response?.data?.errors?.join(', ') || err.message || 'Batch evaluation failed');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleFrameCheck = async () => {
    if (!frameId.trim()) {
      setFrameError('Frame ID is required');
      return;
    }

    let activeState;
    let tracePayload;

    try {
      activeState = frameActive.trim() ? parseJson(frameActive, {}) : undefined;
    } catch (err) {
      setFrameError(`Active JSON invalid: ${err.message}`);
      return;
    }

    try {
      tracePayload = frameTrace.trim() ? parseJson(frameTrace, {}) : undefined;
    } catch (err) {
      setFrameError(`Trace JSON invalid: ${err.message}`);
      return;
    }

    if (!activeState && !tracePayload) {
      setFrameError('Provide either an active state or a trace payload');
      return;
    }

    setFrameLoading(true);
    setFrameError(null);

    try {
      const response = await apiEndpoints.framecheck({
        frame_id: frameId,
        active: activeState,
        trace: tracePayload,
      });
      const data = response.data?.data;
      if (data) {
        setFrameResult(data);
      } else {
        setFrameError('No framecheck data returned');
      }
    } catch (err) {
      console.error('Framecheck failed:', err);
      setFrameError(err?.response?.data?.errors?.join(', ') || err.message || 'Framecheck failed');
    } finally {
      setFrameLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Evaluate</h2>
        <p className="text-muted-foreground mt-1">
          Validate pieces, batch scores, and frame coherence using the live evaluator
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList>
          <TabsTrigger value="single">Single evaluate</TabsTrigger>
          <TabsTrigger value="batch">Batch evaluate</TabsTrigger>
          <TabsTrigger value="framecheck">Frame check</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Single evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Piece</label>
                <Textarea
                  placeholder="Paste the final composed text here"
                  rows={6}
                  value={singlePiece}
                  onChange={(event) => setSinglePiece(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trace JSON (optional)</label>
                <Textarea
                  placeholder="Paste the compose trace JSON"
                  rows={6}
                  value={singleTrace}
                  onChange={(event) => setSingleTrace(event.target.value)}
                />
              </div>

              <Button onClick={handleSingleEvaluate} disabled={singleLoading} className="w-full md:w-auto">
                {singleLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Evaluate
              </Button>

              {singleError && renderError(singleError)}

              {singleResult && (
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle className="text-sm">Result</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        Bankset: {singleResult.bankset?.join(', ') || 'n/a'}
                      </Badge>
                      <Badge variant={singleResult.ok ? 'default' : 'destructive'}>
                        {singleResult.ok ? 'OK' : 'FAIL'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[320px]">
                      {formatJson(singleResult)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                rows={10}
                value={batchPayload}
                onChange={(event) => setBatchPayload(event.target.value)}
              />

              <Button onClick={handleBatchEvaluate} disabled={batchLoading} className="w-full md:w-auto">
                {batchLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Evaluate batch
              </Button>

              {batchError && renderError(batchError)}

              {batchResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Batch response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[360px]">
                      {formatJson(batchResult)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="framecheck" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frame check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Frame ID</label>
                  <Input value={frameId} onChange={(event) => setFrameId(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Active JSON (optional)</label>
                  <Textarea
                    rows={6}
                    value={frameActive}
                    onChange={(event) => setFrameActive(event.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Trace JSON (optional)</label>
                  <Textarea
                    rows={6}
                    value={frameTrace}
                    onChange={(event) => setFrameTrace(event.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleFrameCheck} disabled={frameLoading} className="w-full md:w-auto">
                {frameLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Run frame check
              </Button>

              {frameError && renderError(frameError)}

              {frameResult && (
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle className="text-sm">Frame check result</CardTitle>
                    <Badge variant={frameResult.ok ? 'default' : 'destructive'}>
                      {frameResult.ok ? 'PASS' : 'FAIL'}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[360px]">
                      {formatJson(frameResult)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvaluatePage;
