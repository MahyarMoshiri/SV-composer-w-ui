import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SchemasBrowser from './bible/SchemasBrowser';
import MetaphorsBrowser from './bible/MetaphorsBrowser';
import FramesBrowser from './bible/FramesBrowser';
import BlendRulesViewer from './bible/BlendRulesViewer';

const BiblePage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Bible</h2>
        <p className="text-muted-foreground mt-1">
          Browse and validate schemas, metaphors, frames, and blend rules
        </p>
      </div>

      <Tabs defaultValue="schemas" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
          <TabsTrigger value="metaphors">Metaphors</TabsTrigger>
          <TabsTrigger value="frames">Frames</TabsTrigger>
          <TabsTrigger value="blend-rules">Blend Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="schemas" className="mt-6">
          <SchemasBrowser />
        </TabsContent>

        <TabsContent value="metaphors" className="mt-6">
          <MetaphorsBrowser />
        </TabsContent>

        <TabsContent value="frames" className="mt-6">
          <FramesBrowser />
        </TabsContent>

        <TabsContent value="blend-rules" className="mt-6">
          <BlendRulesViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BiblePage;
