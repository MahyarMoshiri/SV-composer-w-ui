import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { apiEndpoints } from '@/lib/api';
import { Sparkles, Copy, Download } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GeneratePage = () => {
  const [frameId, setFrameId] = useState('');
  const [query, setQuery] = useState('');
  const [beats, setBeats] = useState('hook,setup,development,turn');
  const { harness, updateHarness } = useApp();
  const [llmSelection, setLlmSelection] = useState('echo');
  const [customHarness, setCustomHarness] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const harnessOptions = useMemo(() => ['echo', 'openai', 'custom'], []);

  useEffect(() => {
    if (!harness) {
      setLlmSelection('echo');
      setCustomHarness('');
      return;
    }

    if (harnessOptions.includes(harness)) {
      setLlmSelection(harness);
      setCustomHarness('');
    } else {
      setLlmSelection('custom');
      setCustomHarness(harness);
    }
  }, [harness, harnessOptions]);

  const resolveLlm = () => {
    if (llmSelection === 'custom') {
      return customHarness.trim();
    }
    return llmSelection;
  };

  const handleGenerate = async () => {
    setFormError(null);

    if (!frameId || !query) {
      setFormError('Frame ID and query are required');
      return;
    }

    const effectiveLlm = resolveLlm();
    if (!effectiveLlm) {
      setFormError('Provide a harness identifier before generating');
      return;
    }

    setLoading(true);
    try {
      const response = await apiEndpoints.generate({
        frame_id: frameId,
        query,
        beats: beats.split(',').map(b => b.trim()),
        llm: effectiveLlm,
      });
      
      if (response.data && response.data.data) {
        setResult(response.data.data);
        updateHarness(effectiveLlm);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Generate</h2>
        <p className="text-muted-foreground mt-1">
          End-to-end orchestrator for full piece generation
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Frame ID</label>
                <Input
                  placeholder="e.g., journey"
                  value={frameId}
                  onChange={(e) => setFrameId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Query</label>
                <Textarea
                  placeholder="Enter your generation query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Beats (comma-separated)</label>
                <Input
                  placeholder="hook,setup,turn"
                  value={beats}
                  onChange={(e) => setBeats(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">LLM Harness</label>
                <select
                  value={llmSelection}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLlmSelection(value);
                    if (value !== 'custom') {
                      updateHarness(value);
                      setCustomHarness('');
                      setFormError(null);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="echo">Echo (Test)</option>
                  <option value="openai">OpenAI</option>
                  <option value="custom">Custom</option>
                </select>
                {llmSelection === 'custom' && (
                  <Input
                    className="mt-2"
                    placeholder="Enter harness identifier"
                    value={customHarness}
                    onChange={(e) => {
                      setCustomHarness(e.target.value);
                      setFormError(null);
                    }}
                  />
                )}
              </div>

              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Run Generation'}
              </Button>

              {formError && (
                <Alert variant="destructive">
                  <AlertTitle>Cannot generate</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2 space-y-6">
          {result && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Final Assembly</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(result.final || '')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {result.final || 'No final output'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Per-Beat Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.beats && Object.entries(result.beats).map(([beat, data]) => (
                      <div key={beat} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 capitalize">{beat}</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Candidate:</span>
                            <p className="text-muted-foreground mt-1">{data.candidate || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Final:</span>
                            <p className="text-muted-foreground mt-1">{data.final || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Trace</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(result.trace, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'trace.json';
                      a.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
                    {JSON.stringify(result.trace, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </>
          )}

          {!result && (
            <Card>
              <CardContent className="py-16">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configure and run generation to see results</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratePage;
