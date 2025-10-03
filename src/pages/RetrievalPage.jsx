import React, { useState } from 'react';
import { apiEndpoints } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, X } from 'lucide-react';

const RetrievalPage = () => {
  const { activeSelections, addToActive, removeFromActive } = useApp();
  const [query, setQuery] = useState('');
  const [k, setK] = useState(8);
  const [kinds, setKinds] = useState(['schema', 'metaphor', 'frame']);
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(false);

  const availableKinds = ['schema', 'metaphor', 'frame', 'exemplar'];

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await apiEndpoints.search({
        query,
        k,
        kinds,
      });
      
      if (response.data && response.data.data) {
        setHits(response.data.data.hits || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleKind = (kind) => {
    setKinds((prev) =>
      prev.includes(kind)
        ? prev.filter((k) => k !== kind)
        : [...prev, kind]
    );
  };

  const handleAddToActive = (hit) => {
    const type = hit.kind === 'schema' ? 'schemas' : 
                 hit.kind === 'metaphor' ? 'metaphors' : 
                 hit.kind === 'frame' ? 'frames' : 'gates';
    addToActive(type, hit);
  };

  const isInActive = (hit) => {
    const type = hit.kind === 'schema' ? 'schemas' : 
                 hit.kind === 'metaphor' ? 'metaphors' : 
                 hit.kind === 'frame' ? 'frames' : 'gates';
    return activeSelections[type]?.some((item) => item.doc_id === hit.doc_id);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Retrieval Sandbox</h2>
        <p className="text-muted-foreground mt-1">
          Query the knowledge base and save promising results as active selections
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Query</label>
                <Input
                  placeholder="Enter your search query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kinds</label>
                <div className="flex flex-wrap gap-2">
                  {availableKinds.map((kind) => (
                    <Badge
                      key={kind}
                      variant={kinds.includes(kind) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleKind(kind)}
                    >
                      {kind}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Results (K)</label>
                <Input
                  type="number"
                  value={k}
                  onChange={(e) => setK(parseInt(e.target.value) || 8)}
                  min="1"
                  max="50"
                />
              </div>

              <Button onClick={handleSearch} disabled={loading} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Run Search'}
              </Button>
            </CardContent>
          </Card>

          {hits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Results ({hits.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Doc ID</TableHead>
                      <TableHead>Kind</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hits.map((hit, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{hit.doc_id}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{hit.kind}</Badge>
                        </TableCell>
                        <TableCell>{hit.score?.toFixed(3)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {hit.tags?.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isInActive(hit) ? (
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAddToActive(hit)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Active Selections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(activeSelections).map(([type, items]) => (
                <div key={type}>
                  <h4 className="font-semibold text-sm mb-2 capitalize">{type}</h4>
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No {type} selected</p>
                  ) : (
                    <div className="space-y-1">
                      {items.map((item) => (
                        <div
                          key={item.doc_id}
                          className="flex items-center justify-between p-2 bg-accent rounded-md text-sm"
                        >
                          <span className="truncate">{item.doc_id}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => removeFromActive(type, item.doc_id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RetrievalPage;
