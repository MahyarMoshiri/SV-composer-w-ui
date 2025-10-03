import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { apiEndpoints } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const formatJson = (value) => JSON.stringify(value, null, 2);

const FilmPlanPage = () => {
  const [prompt, setPrompt] = useState('');
  const [frameId, setFrameId] = useState('');
  const [beats, setBeats] = useState('hook,setup,development,turn,reveal,settle');
  const [totalDuration, setTotalDuration] = useState(60);
  const [sceneLength, setSceneLength] = useState(10);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [allocationMode, setAllocationMode] = useState('CurveWeighted');
  const [stylePack, setStylePack] = useState('');
  const [temperature, setTemperature] = useState('0.35');
  const [seed, setSeed] = useState('');
  const [llmEnrich, setLlmEnrich] = useState(false);

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const beatList = useMemo(
    () =>
      beats
        .split(',')
        .map((beat) => beat.trim())
        .filter(Boolean),
    [beats],
  );

  const submitPlan = async () => {
    if (!prompt.trim()) {
      setError('Prompt is required');
      return;
    }

    if (![5, 10].includes(Number(sceneLength))) {
      setError('Scene length must be 5 or 10 seconds as required by the API');
      return;
    }

    setLoading(true);
    setError(null);
    setPlan(null);

    const payload = {
      prompt,
      frame_id: frameId || undefined,
      beats: beatList.length ? beatList : undefined,
      total_duration_sec: Number(totalDuration) || 60,
      scene_length_sec: Number(sceneLength) || 10,
      aspect_ratio: aspectRatio,
      allocation_mode: allocationMode,
      style_pack: stylePack || undefined,
      llm_enrich: llmEnrich,
      temperature: llmEnrich ? Number(temperature) || undefined : undefined,
      seed: seed ? Number(seed) : undefined,
    };

    try {
      const response = await apiEndpoints.filmPlan(payload);
      const body = response.data;
      if (body?.ok === false) {
        const messages = Array.isArray(body?.errors) ? body.errors.join(', ') : null;
        setError(messages || 'Film plan failed');
        return;
      }

      const data = body?.data ?? body;
      if (data) {
        setPlan(data);
      } else {
        setError('No plan returned');
      }
    } catch (err) {
      console.error('Film plan failed:', err);
      setError(err?.response?.data?.errors?.join(', ') || err.message || 'Film plan failed');
    } finally {
      setLoading(false);
    }
  };

  const renderSequence = (sequence) => (
    <Card key={sequence.beat}>
      <CardHeader>
        <CardTitle className="text-base font-semibold capitalize">
          {sequence.beat} <span className="text-xs text-muted-foreground">({sequence.intent})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sequence.scenes.map((scene) => (
          <Card key={scene.scene_id}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Scene {scene.scene_id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="font-semibold">Prompt:</span>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{scene.prompt}</p>
              </div>
              {scene.negative_prompt && (
                <div>
                  <span className="font-semibold">Negative:</span>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{scene.negative_prompt}</p>
                </div>
              )}
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <span className="font-semibold">Camera:</span>
                  <p className="text-muted-foreground">{scene.camera}</p>
                </div>
                <div>
                  <span className="font-semibold">Lighting:</span>
                  <p className="text-muted-foreground">{scene.lighting}</p>
                </div>
                <div>
                  <span className="font-semibold">Color:</span>
                  <p className="text-muted-foreground">{scene.color}</p>
                </div>
                <div>
                  <span className="font-semibold">Motion:</span>
                  <p className="text-muted-foreground">{scene.motion}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">Duration: {scene.duration_sec}s</Badge>
                <Badge variant="outline">Aspect: {scene.aspect_ratio}</Badge>
                {scene.safety_tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Film Plan (P12)</h2>
        <p className="text-muted-foreground mt-1">
          Generate beat-aligned video prompts and scene metadata from a single description
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt</label>
            <Textarea
              rows={5}
              placeholder="A hush before dawn: a thin door of light."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Frame ID (optional)</label>
              <Input value={frameId} onChange={(event) => setFrameId(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Beats (comma separated)</label>
              <Input value={beats} onChange={(event) => setBeats(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total duration (sec)</label>
              <Input
                type="number"
                min={10}
                value={totalDuration}
                onChange={(event) => setTotalDuration(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Scene length (5 or 10 sec)</label>
              <Input
                type="number"
                value={sceneLength}
                onChange={(event) => setSceneLength(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Aspect ratio</label>
              <Input value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Allocation mode</label>
              <Input value={allocationMode} onChange={(event) => setAllocationMode(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Style pack (optional)</label>
              <Input value={stylePack} onChange={(event) => setStylePack(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Seed (optional)</label>
              <Input value={seed} onChange={(event) => setSeed(event.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="llm-enrich" checked={llmEnrich} onCheckedChange={(checked) => setLlmEnrich(Boolean(checked))} />
            <label htmlFor="llm-enrich" className="text-sm font-medium">
              Enable LLM enrichment
            </label>
          </div>

          {llmEnrich && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Temperature</label>
              <Input value={temperature} onChange={(event) => setTemperature(event.target.value)} />
            </div>
          )}

          <Button onClick={submitPlan} disabled={loading} className="w-full md:w-auto">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create plan
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {plan && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Overview</CardTitle>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">Frame: {plan.frame_id}</Badge>
                <Badge variant="outline">Duration: {plan.total_duration_sec}s</Badge>
                <Badge variant="outline">Scene length: {plan.scene_length_sec}s</Badge>
                <Badge variant="outline">Aspect: {plan.aspect_ratio}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.warnings?.length > 0 && (
                <Alert variant="warning">
                  <AlertTitle>Warnings</AlertTitle>
                  <AlertDescription className="space-y-1">
                    {plan.warnings.map((warning, index) => (
                      <div key={`warning-${index}`}>{warning}</div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}
              <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[320px]">
                {formatJson(plan.provenance)}
              </pre>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sequences</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              {plan.sequences.map(renderSequence)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilmPlanPage;
