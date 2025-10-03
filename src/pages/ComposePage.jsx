import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { apiEndpoints } from '@/lib/api';
import { FileEdit, Loader2, Download, RefreshCw } from 'lucide-react';

const DEFAULT_BEATS = ['hook', 'setup', 'development', 'turn', 'reveal', 'settle'];

const toList = (value) =>
  value
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);

const formatJson = (value) => JSON.stringify(value, null, 2);

const ComposePage = () => {
  const [frameId, setFrameId] = useState('');
  const [query, setQuery] = useState('');
  const [k, setK] = useState(6);
  const [beatsInput, setBeatsInput] = useState(DEFAULT_BEATS.join(','));

  const [planData, setPlanData] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState(null);

  const [composeResult, setComposeResult] = useState(null);
  const [composeLoading, setComposeLoading] = useState(false);
  const [composeError, setComposeError] = useState(null);

  const [selectedBeat, setSelectedBeat] = useState('');
  const [beatResult, setBeatResult] = useState(null);
  const [beatLoading, setBeatLoading] = useState(false);
  const [beatError, setBeatError] = useState(null);

  const planBeats = useMemo(() => {
    if (planData?.plan) {
      const beats = planData.plan
        .map((entry) => entry?.beat)
        .filter(Boolean);
      if (beats.length) {
        return beats;
      }
    }
    return DEFAULT_BEATS;
  }, [planData]);

  const resolveBeats = () => {
    const fromInput = toList(beatsInput);
    return fromInput.length ? fromInput : planBeats;
  };

  const handlePlan = async () => {
    if (!frameId || !query) {
      setPlanError('Frame ID and query are required');
      return;
    }

    setPlanLoading(true);
    setPlanError(null);
    setComposeResult(null);
    setBeatResult(null);

    try {
      const response = await apiEndpoints.composePlan({
        frame_id: frameId,
        query,
        k,
      });

      const payload = response.data?.data;
      if (payload) {
        setPlanData(payload);
        if (payload.plan) {
          const beats = payload.plan
            .map((entry) => entry?.beat)
            .filter(Boolean);
          if (beats?.length) {
            setBeatsInput(beats.join(','));
          }
        }
      } else {
        setPlanError('No plan data returned');
      }
    } catch (err) {
      console.error('Plan failed:', err);
      setPlanError(err?.response?.data?.errors?.join(', ') || err.message || 'Planning failed');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleCompose = async () => {
    if (!frameId || !query) {
      setComposeError('Frame ID and query are required');
      return;
    }

    const beats = resolveBeats();
    if (!beats.length) {
      setComposeError('At least one beat is required to compose');
      return;
    }

    setComposeLoading(true);
    setComposeError(null);
    setBeatResult(null);

    try {
      const payload = {
        frame_id: frameId,
        query,
        beats,
      };
      if (planData?.active) {
        payload.active = planData.active;
      }

      const response = await apiEndpoints.compose(payload);
      const data = response.data?.data;
      if (data) {
        setComposeResult(data);
      } else {
        setComposeError('No compose data returned');
      }
    } catch (err) {
      console.error('Compose failed:', err);
      setComposeError(err?.response?.data?.errors?.join(', ') || err.message || 'Compose failed');
    } finally {
      setComposeLoading(false);
    }
  };

  const handleBeat = async (beat) => {
    if (!frameId || !query) {
      setBeatError('Frame ID and query are required');
      return;
    }
    const active = planData?.active || composeResult?.active;
    if (!active) {
      setBeatError('No active selections found. Create a plan first.');
      return;
    }

    setSelectedBeat(beat);
    setBeatLoading(true);
    setBeatError(null);
    try {
      const response = await apiEndpoints.composeBeat({
        frame_id: frameId,
        beat,
        query,
        active,
      });
      const data = response.data?.data;
      if (data) {
        setBeatResult({ beat, ...data });
      } else {
        setBeatError('No data returned for the selected beat');
      }
    } catch (err) {
      console.error('Compose beat failed:', err);
      setBeatError(err?.response?.data?.errors?.join(', ') || err.message || 'Compose beat failed');
    } finally {
      setBeatLoading(false);
    }
  };

  const downloadTrace = (trace) => {
    const blob = new Blob([formatJson(trace)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compose-trace.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderWarnings = (warnings) =>
    warnings?.length ? (
      <Alert variant="warning">
        <AlertTitle>Warnings</AlertTitle>
        <AlertDescription className="space-y-1">
          {warnings.map((warning, idx) => (
            <div key={`warning-${idx}`}>{warning}</div>
          ))}
        </AlertDescription>
      </Alert>
    ) : null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Compose</h2>
        <p className="text-muted-foreground mt-1">
          Plan and orchestrate poetic beats with live prompts and traces
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Frame ID</label>
            <Input
              placeholder="e.g., journey"
              value={frameId}
              onChange={(event) => setFrameId(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Query</label>
            <Input
              placeholder="Enter your composition query..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">K (retrieval results)</label>
            <Input
              type="number"
              min={1}
              value={k}
              onChange={(event) => setK(parseInt(event.target.value, 10) || 6)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Beats (comma separated)</label>
            <Input
              placeholder="hook,setup,development,turn,..."
              value={beatsInput}
              onChange={(event) => setBeatsInput(event.target.value)}
            />
          </div>

          <div className="flex gap-3 col-span-full">
            <Button onClick={handlePlan} disabled={planLoading} className="flex-1">
              {planLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileEdit className="h-4 w-4 mr-2" />
              )}
              {planLoading ? 'Planning…' : 'Generate Plan'}
            </Button>
            <Button onClick={handleCompose} disabled={composeLoading} variant="secondary">
              {composeLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {composeLoading ? 'Composing…' : 'Compose Beats'}
            </Button>
          </div>

          {planError && (
            <Alert variant="destructive" className="col-span-full">
              <AlertTitle>Plan Error</AlertTitle>
              <AlertDescription>{planError}</AlertDescription>
            </Alert>
          )}

          {composeError && (
            <Alert variant="destructive" className="col-span-full">
              <AlertTitle>Compose Error</AlertTitle>
              <AlertDescription>{composeError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="plan" className="w-full">
        <TabsList>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="workspace">Beat Workspace</TabsTrigger>
          <TabsTrigger value="prompts">Prompts & Trace</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="mt-6 space-y-6">
          {renderWarnings(planData?.warnings)}

          {planData ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[380px]">
                    {formatJson(planData.plan)}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Selections</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[380px]">
                    {formatJson(planData.active)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                Generate a plan to inspect retrieved selections and beat guidance.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workspace" className="mt-6 space-y-6">
          {beatError && (
            <Alert variant="destructive">
              <AlertTitle>Beat Error</AlertTitle>
              <AlertDescription>{beatError}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Beats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {resolveBeats().map((beat) => (
                  <Button
                    key={beat}
                    size="sm"
                    variant={selectedBeat === beat ? 'default' : 'outline'}
                    onClick={() => handleBeat(beat)}
                    disabled={beatLoading && selectedBeat === beat}
                    className="capitalize"
                  >
                    {beatLoading && selectedBeat === beat ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      beat
                    )}
                  </Button>
                ))}
              </div>

              {beatResult && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Prompts for beat “{beatResult.beat}”</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    {beatResult.prompts &&
                      Object.entries(beatResult.prompts).map(([key, value]) => (
                        <Card key={key}>
                          <CardHeader>
                            <CardTitle className="capitalize text-sm">{key}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Textarea value={value} readOnly className="h-40 text-xs" />
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {beatResult.trace_beat && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Trace Snapshot</h4>
                      <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[240px]">
                        {formatJson(beatResult.trace_beat)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="mt-6 space-y-6">
          {composeResult ? (
            <>
              {renderWarnings(composeResult.warnings)}

              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Prompts</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">Frame: {frameId || 'n/a'}</Badge>
                    <Badge variant="outline">Bankset: {composeResult.bankset?.join(', ') || 'n/a'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {composeResult.prompts?.beats ? (
                    Object.entries(composeResult.prompts.beats).map(([beat, prompts]) => (
                      <div key={beat} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold capitalize">{beat}</h4>
                          <Badge variant="secondary">{Object.keys(prompts).length} sections</Badge>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          {Object.entries(prompts).map(([section, text]) => (
                            <div key={section} className="space-y-1">
                              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {section}
                              </div>
                              <Textarea value={text} readOnly className="h-40 text-xs" />
                            </div>
                          ))}
                        </div>
                        <Separator className="my-4" />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No prompts found.</p>
                  )}
                </CardContent>
              </Card>

              {composeResult.trace && (
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>Trace</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTrace(composeResult.trace)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download JSON
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[480px]">
                      {formatJson(composeResult.trace)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                Compose beats to inspect prompts and trace output.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComposePage;
