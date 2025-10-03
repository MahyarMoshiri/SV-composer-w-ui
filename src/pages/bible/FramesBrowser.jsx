import React, { useState, useEffect } from 'react';
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
import { Search, Eye } from 'lucide-react';

const FramesBrowser = () => {
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchFrames();
  }, []);

  const fetchFrames = async () => {
    setLoading(true);
    try {
      const response = await apiEndpoints.getFrames();
      if (response.data && response.data.data) {
        setFrames(response.data.data.frames || []);
        setSummary(response.data.data.summary || null);
      }
    } catch (error) {
      console.error('Failed to fetch frames:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFrames = frames.filter((frame) =>
    frame.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewFrame = (frame) => {
    setSelectedFrame(frame);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search frames..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading frames...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Core Roles</TableHead>
                <TableHead>Allowed Schemas</TableHead>
                <TableHead>Allowed Metaphors</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFrames.map((frame) => (
                <TableRow key={frame.id}>
                  <TableCell className="font-medium">{frame.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {frame.core_roles?.slice(0, 4).map((role, index) => (
                        <Badge key={role || index} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                      {frame.core_roles?.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{frame.core_roles.length - 4}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {frame.allowed_schemas?.slice(0, 4).map((schemaId, index) => (
                        <Badge key={schemaId || index} variant="outline" className="text-xs">
                          {schemaId}
                        </Badge>
                      ))}
                      {frame.allowed_schemas?.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{frame.allowed_schemas.length - 4}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {frame.allowed_metaphors?.slice(0, 4).map((metaphorId, index) => (
                        <Badge key={metaphorId || index} variant="outline" className="text-xs">
                          {metaphorId}
                        </Badge>
                      ))}
                      {frame.allowed_metaphors?.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{frame.allowed_metaphors.length - 4}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => viewFrame(frame)}>
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
            <DialogTitle>Frame: {selectedFrame?.id}</DialogTitle>
          </DialogHeader>

          {selectedFrame && (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="schemas">Schemas</TabsTrigger>
                <TabsTrigger value="metaphors">Metaphors</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Definition</h4>
                  <p className="text-sm text-muted-foreground">{selectedFrame.definition}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Viewpoint Defaults</h4>
                  <div className="flex gap-2 text-sm">
                    <Badge variant="outline">{selectedFrame.viewpoint_defaults?.person}</Badge>
                    <Badge variant="outline">{selectedFrame.viewpoint_defaults?.tense}</Badge>
                    <Badge variant="outline">{selectedFrame.viewpoint_defaults?.distance}</Badge>
                  </div>
                </div>

                {summary?.version && (
                  <div>
                    <h4 className="font-semibold mb-2">Bank Version</h4>
                    <Badge variant="outline">{summary.version}</Badge>
                  </div>
                )}

                {selectedFrame.provenance && (
                  <div>
                    <h4 className="font-semibold mb-2">Provenance</h4>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                      {JSON.stringify(selectedFrame.provenance, null, 2)}
                    </pre>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="roles" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Core Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFrame.core_roles?.map((role) => (
                      <Badge key={role} variant="secondary">{role}</Badge>
                    ))}
                  </div>
                </div>

                {selectedFrame.optional_roles?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Optional Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFrame.optional_roles.map((role) => (
                        <Badge key={role} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFrame.role_notes && Object.keys(selectedFrame.role_notes).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Role Notes</h4>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                      {JSON.stringify(selectedFrame.role_notes, null, 2)}
                    </pre>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schemas" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Allowed Schemas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFrame.allowed_schemas?.map((schemaId) => (
                      <Badge key={schemaId} variant="outline">{schemaId}</Badge>
                    ))}
                  </div>
                </div>

                {selectedFrame.required_schemas?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Required Schemas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFrame.required_schemas.map((schemaId) => (
                        <Badge key={schemaId} variant="secondary">{schemaId}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFrame.disallowed_schemas?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Disallowed Schemas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFrame.disallowed_schemas.map((schemaId) => (
                        <Badge key={schemaId} variant="destructive">{schemaId}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="metaphors" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Allowed Metaphors</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFrame.allowed_metaphors?.map((metaphorId) => (
                      <Badge key={metaphorId} variant="outline">{metaphorId}</Badge>
                    ))}
                  </div>
                </div>

                {selectedFrame.disallowed_metaphors?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Disallowed Metaphors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFrame.disallowed_metaphors.map((metaphorId) => (
                        <Badge key={metaphorId} variant="destructive">{metaphorId}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFrame.metaphor_bias && Object.keys(selectedFrame.metaphor_bias).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Metaphor Bias</h4>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                      {JSON.stringify(selectedFrame.metaphor_bias, null, 2)}
                    </pre>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FramesBrowser;
