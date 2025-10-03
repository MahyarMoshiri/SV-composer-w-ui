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
import { Search, Eye } from 'lucide-react';

const MetaphorsBrowser = () => {
  const [metaphors, setMetaphors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [validate, setValidate] = useState(false);

  const fetchMetaphors = useCallback(async () => {
    setLoading(true);
    try {
      const params = validate ? { validate: 'true' } : {};
      const response = await apiEndpoints.getMetaphors(params);
      if (response.data && response.data.data) {
        setMetaphors(response.data.data.metaphors || []);
      }
    } catch (error) {
      console.error('Failed to fetch metaphors:', error);
    } finally {
      setLoading(false);
    }
  }, [validate]);

  useEffect(() => {
    fetchMetaphors();
  }, [fetchMetaphors]);

  const filteredMetaphors = metaphors.filter((metaphor) =>
    metaphor.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search metaphors..."
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
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading metaphors...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMetaphors.map((metaphor) => (
                <TableRow key={metaphor.id}>
                  <TableCell className="font-medium">{metaphor.id}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{metaphor.source || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{metaphor.target || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{metaphor.version || '0.1.0'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MetaphorsBrowser;
