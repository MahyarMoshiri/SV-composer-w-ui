import React, { useState, useEffect, useCallback } from 'react';
import { apiEndpoints } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const SchemasBrowser = () => {
  const { bankset } = useApp();
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [validate, setValidate] = useState(false);
  const [source, setSource] = useState('current');
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [summary, setSummary] = useState(null);

  const fetchSchemas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (validate) params.validate = 'true';
      if (source !== 'current') params.source = source;
      
      const response = await apiEndpoints.getSchemas(params);
      if (response.data && response.data.data) {
        setSchemas(response.data.data.schemas || []);
        setSummary(response.data.data.summary || null);
      }
    } catch (error) {
      console.error('Failed to fetch schemas:', error);
    } finally {
      setLoading(false);
    }
  }, [validate, source]);

  useEffect(() => {
    fetchSchemas();
  }, [fetchSchemas, bankset]);

  const filteredSchemas = schemas.filter((schema) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    const matchesId = schema.id?.toLowerCase().includes(search);
    const lexiconEn = schema.lexicon?.en || [];
    const lexiconFa = schema.lexicon?.fa || [];
    const matchesLexicon = [...lexiconEn, ...lexiconFa].some((entry) =>
      entry.lemma?.toLowerCase().includes(search)
    );
    return matchesId || matchesLexicon;
  });

  const viewSchema = (schema) => {
    setSelectedSchema(schema);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schemas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant={validate ? 'default' : 'outline'}
          onClick={() => setValidate(!validate)}
        >
          {validate ? 'Validation On' : 'Validation Off'}
        </Button>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="current">Current</option>
          <option value="normalized">Normalized</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading schemas...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>English Lexicon</TableHead>
                <TableHead>Farsi Lexicon</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchemas.map((schema) => (
                <TableRow key={schema.id}>
                  <TableCell className="font-medium">{schema.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(schema.lexicon?.en || []).slice(0, 3).map((lex, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {lex.lemma}
                        </Badge>
                      ))}
                      {(schema.lexicon?.en || []).length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(schema.lexicon?.en || []).length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(schema.lexicon?.fa || []).slice(0, 2).map((lex, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {lex.lemma}
                        </Badge>
                      ))}
                      {(schema.lexicon?.fa || []).length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(schema.lexicon?.fa || []).length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => viewSchema(schema)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schema: {selectedSchema?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedSchema && (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                <TabsTrigger value="lexicon">Lexicon</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Version</h4>
                  <p className="text-sm">{summary?.version || '0.1.0'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">English Lexemes</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedSchema.lexicon?.en || []).map((lex, i) => (
                      <Badge key={i}>{lex.lemma}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Farsi Lexemes</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedSchema.lexicon?.fa || []).map((lex, i) => (
                      <Badge key={i}>{lex.lemma}</Badge>
                    ))}
                  </div>
                </div>

                {selectedSchema.roles?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSchema.roles.map((role, i) => (
                        <Badge key={i} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSchema.coactivate?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Coactivate Schemas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSchema.coactivate.map((id, i) => (
                        <Badge key={i} variant="outline">{id}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="items">
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
                  {JSON.stringify(selectedSchema, null, 2)}
                </pre>
              </TabsContent>

              <TabsContent value="compatibility">
                <div className="text-sm text-muted-foreground">
                  Compatibility visualisation will be displayed here
                </div>
              </TabsContent>

              <TabsContent value="lexicon">
                <div className="space-y-2">
                  <h4 className="font-semibold">Lexicon Matches</h4>
                  <div className="text-sm text-muted-foreground">
                    Lexicon mapping visualisation will be displayed here
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchemasBrowser;
