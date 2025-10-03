import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { apiEndpoints } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, Legend, XAxis, YAxis } from 'recharts';

const DEFAULT_BEATS = 'hook,setup,development,turn,reveal,settle';

const textToArray = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const safeJson = (value) => JSON.stringify(value, null, 2);

const normalizeCurve = (curve) => {
  if (!Array.isArray(curve)) return [];
  return curve.map((entry, index) => {
    if (typeof entry === 'number') {
      return { beat: String(index + 1), value: entry };
    }
    if (entry && typeof entry === 'object') {
      const beat = entry.beat ?? entry.name ?? entry.step ?? entry.label ?? index + 1;
      const rawValue = entry.value ?? entry.expectation ?? entry.score ?? entry.delta;
      const value = typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0;
      return { beat: String(beat), value };
    }
    const value = Number(entry);
    return { beat: String(index + 1), value: Number.isFinite(value) ? value : 0 };
  });
};

const buildCurveDataset = (before, after, beats) => {
  const normalizedBefore = normalizeCurve(before);
  const normalizedAfter = normalizeCurve(after);
  const explicitBeats = Array.isArray(beats)
    ? beats.map((entry, index) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object') {
          return entry.beat ?? entry.name ?? entry.label ?? index + 1;
        }
        return index + 1;
      })
    : [];

  const beatSet = new Set(explicitBeats.map((beat) => String(beat)));
  normalizedBefore.forEach((item) => beatSet.add(String(item.beat)));
  normalizedAfter.forEach((item) => beatSet.add(String(item.beat)));

  return Array.from(beatSet).map((beat) => {
    const beforePoint = normalizedBefore.find((item) => String(item.beat) === beat);
    const afterPoint = normalizedAfter.find((item) => String(item.beat) === beat);
    return {
      beat,
      before: beforePoint?.value ?? null,
      after: afterPoint?.value ?? null,
    };
  });
};

const CurveChart = ({ result }) => {
  const data = useMemo(
    () => buildCurveDataset(result?.curve_before, result?.curve_after, result?.beats),
    [result?.curve_before, result?.curve_after, result?.beats],
  );

  if (!data.length) {
    return (
      <Alert variant="warning">
        <AlertTitle>No curve data</AlertTitle>
        <AlertDescription>
          The expectation response did not include curve values. Raw payload is available below for inspection.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ChartContainer
      config={{
        before: { label: 'Before', color: 'hsl(var(--chart-1))' },
        after: { label: 'After', color: 'hsl(var(--chart-2))' },
      }}
      className="h-[260px] w-full"
    >
      <LineChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
        <CartesianGrid strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="beat" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={32} domain={['auto', 'auto']} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Line type="monotone" dataKey="before" stroke="var(--color-before)" strokeWidth={2} dot={false} connectNulls />
        <Line type="monotone" dataKey="after" stroke="var(--color-after)" strokeWidth={2} dot={false} connectNulls />
      </LineChart>
    </ChartContainer>
  );
};

const ControlPage = () => {
  const [expectationForm, setExpectationForm] = useState({
    metaphors: '',
    beats: DEFAULT_BEATS,
    poles: '',
    base: 'linear',
  });
  const [expectationResult, setExpectationResult] = useState(null);
  const [expectationError, setExpectationError] = useState(null);
  const [expectationLoading, setExpectationLoading] = useState(false);

  const [viewpointForm, setViewpointForm] = useState({
    prompt: '',
    frameId: '',
    lang: 'en',
  });
  const [viewpointResult, setViewpointResult] = useState(null);
  const [viewpointError, setViewpointError] = useState(null);
  const [viewpointLoading, setViewpointLoading] = useState(false);

  const [attentionForm, setAttentionForm] = useState({
    text: '',
    lang: 'en',
    topK: 5,
  });
  const [attentionResult, setAttentionResult] = useState(null);
  const [attentionError, setAttentionError] = useState(null);
  const [attentionLoading, setAttentionLoading] = useState(false);

  const submitExpectation = async () => {
    const metaphors = textToArray(expectationForm.metaphors);
    const beats = textToArray(expectationForm.beats);
    const poles = expectationForm.poles
      .split(',')
      .map((pair) => pair.trim())
      .filter(Boolean)
      .reduce((acc, pair) => {
        const [axis, pole] = pair.split(':').map((token) => token.trim());
        if (axis && pole) acc[axis] = pole;
        return acc;
      }, {});

    if (!metaphors.length) {
      setExpectationError('Provide at least one active metaphor');
      return;
    }

    setExpectationLoading(true);
    setExpectationError(null);
    try {
      const response = await apiEndpoints.expectation({
        active_metaphors: metaphors,
        beats,
        base: expectationForm.base || 'linear',
        poles,
      });
      const data = response.data?.data;
      if (data) {
        setExpectationResult(data);
      } else {
        setExpectationError('No expectation data returned');
      }
    } catch (err) {
      console.error('Expectation request failed:', err);
      setExpectationError(err?.response?.data?.errors?.join(', ') || err.message || 'Expectation request failed');
    } finally {
      setExpectationLoading(false);
    }
  };

  const submitViewpoint = async () => {
    if (!viewpointForm.prompt.trim()) {
      setViewpointError('Prompt is required');
      return;
    }

    setViewpointLoading(true);
    setViewpointError(null);
    try {
      const response = await apiEndpoints.viewpoint({
        prompt: viewpointForm.prompt,
        frame_id: viewpointForm.frameId || undefined,
        lang: viewpointForm.lang,
      });
      const data = response.data?.data;
      if (data) {
        setViewpointResult(data);
      } else {
        setViewpointError('No viewpoint data returned');
      }
    } catch (err) {
      console.error('Viewpoint request failed:', err);
      setViewpointError(err?.response?.data?.errors?.join(', ') || err.message || 'Viewpoint request failed');
    } finally {
      setViewpointLoading(false);
    }
  };

  const submitAttention = async () => {
    if (!attentionForm.text.trim()) {
      setAttentionError('Text is required');
      return;
    }

    setAttentionLoading(true);
    setAttentionError(null);
    try {
      const response = await apiEndpoints.attention({
        text: attentionForm.text,
        lang: attentionForm.lang,
        top_k: attentionForm.topK,
      });
      const data = response.data?.data;
      if (data) {
        setAttentionResult(data);
      } else {
        setAttentionError('No attention data returned');
      }
    } catch (err) {
      console.error('Attention request failed:', err);
      setAttentionError(err?.response?.data?.errors?.join(', ') || err.message || 'Attention request failed');
    } finally {
      setAttentionLoading(false);
    }
  };

  const renderAlert = (message) => (
    <Alert variant="destructive">
      <AlertTitle>Request failed</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Control</h2>
        <p className="text-muted-foreground mt-1">
          Expectation curves, viewpoint inference, and attention analysis on live data
        </p>
      </div>

      <Tabs defaultValue="expectation" className="w-full">
        <TabsList>
          <TabsTrigger value="expectation">Expectation Curves</TabsTrigger>
          <TabsTrigger value="viewpoint">Viewpoint</TabsTrigger>
          <TabsTrigger value="attention">Attention</TabsTrigger>
        </TabsList>

        <TabsContent value="expectation" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expectation Curve</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Active metaphors (comma separated)</label>
                  <Input
                    placeholder="e.g., vegas_is_mirage, scarcity_abundance"
                    value={expectationForm.metaphors}
                    onChange={(event) =>
                      setExpectationForm((prev) => ({ ...prev, metaphors: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Beats order</label>
                  <Input
                    placeholder={DEFAULT_BEATS}
                    value={expectationForm.beats}
                    onChange={(event) =>
                      setExpectationForm((prev) => ({ ...prev, beats: event.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use the default beat ordering returned by the API.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pole overrides (axis:pole)</label>
                  <Input
                    placeholder="honesty:truth, illumination:light"
                    value={expectationForm.poles}
                    onChange={(event) =>
                      setExpectationForm((prev) => ({ ...prev, poles: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Baseline</label>
                  <Input
                    placeholder="linear"
                    value={expectationForm.base}
                    onChange={(event) =>
                      setExpectationForm((prev) => ({ ...prev, base: event.target.value }))
                    }
                  />
                </div>
              </div>

              <Button onClick={submitExpectation} disabled={expectationLoading} className="w-full md:w-auto">
                {expectationLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Compute curve
              </Button>

              {expectationError && renderAlert(expectationError)}

              {expectationResult && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Bankset: {expectationResult.bankset?.join(', ') || 'n/a'}</Badge>
                    <Badge variant="outline">Fire beat: {expectationResult.fire?.beat || 'n/a'}</Badge>
                    <Badge variant="outline">
                      Fire expectation delta: {expectationResult.fire?.expectation_delta ?? 'n/a'}
                    </Badge>
                  </div>

                  <CurveChart result={expectationResult} />

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Active metaphors</h4>
                    <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[200px]">
                      {safeJson(expectationResult.active_metaphors)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="viewpoint" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Viewpoint inference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt</label>
                <Textarea
                  placeholder="Paste the generated lines here"
                  value={viewpointForm.prompt}
                  onChange={(event) =>
                    setViewpointForm((prev) => ({ ...prev, prompt: event.target.value }))
                  }
                  rows={6}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Frame ID (optional)</label>
                  <Input
                    value={viewpointForm.frameId}
                    onChange={(event) =>
                      setViewpointForm((prev) => ({ ...prev, frameId: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Input
                    value={viewpointForm.lang}
                    onChange={(event) =>
                      setViewpointForm((prev) => ({ ...prev, lang: event.target.value }))
                    }
                  />
                </div>
              </div>

              <Button onClick={submitViewpoint} disabled={viewpointLoading} className="w-full md:w-auto">
                {viewpointLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Infer viewpoint
              </Button>

              {viewpointError && renderAlert(viewpointError)}

              {viewpointResult && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Viewpoint</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[240px]">
                        {safeJson(viewpointResult.viewpoint)}
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Attention</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[240px]">
                        {safeJson(viewpointResult.attention)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attention" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attention peaks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Text</label>
                <Textarea
                  placeholder="Paste the composed text here"
                  value={attentionForm.text}
                  onChange={(event) =>
                    setAttentionForm((prev) => ({ ...prev, text: event.target.value }))
                  }
                  rows={6}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Input
                    value={attentionForm.lang}
                    onChange={(event) =>
                      setAttentionForm((prev) => ({ ...prev, lang: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Top K</label>
                  <Input
                    type="number"
                    min={1}
                    value={attentionForm.topK}
                    onChange={(event) =>
                      setAttentionForm((prev) => ({ ...prev, topK: parseInt(event.target.value, 10) || 5 }))
                    }
                  />
                </div>
              </div>

              <Button onClick={submitAttention} disabled={attentionLoading} className="w-full md:w-auto">
                {attentionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Analyse attention
              </Button>

              {attentionError && renderAlert(attentionError)}

              {attentionResult && (
                <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[360px]">
                  {safeJson(attentionResult.attention)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ControlPage;
