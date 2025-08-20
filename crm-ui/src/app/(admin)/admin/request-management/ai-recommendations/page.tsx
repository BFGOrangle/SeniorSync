"use client";

import { useCurrentUser } from "@/contexts/user-context";
import { AIRecommendedRequests } from "@/components/ai-recommended-requests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, User } from "lucide-react";

export default function RequestManagementAIRecommendationsPage() {
  const { currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-2rem)] flex flex-col">
      <div className="space-y-2 flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          AI Request Recommendations
        </h1>
        <p className="text-gray-600">
          AI-powered request prioritization and recommendations for efficient request management.
        </p>
      </div>
      
      <div className="flex-1 min-h-0">
        {isAdmin ? (
          <Tabs defaultValue="all" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-4 flex-shrink-0">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Recommendations
              </TabsTrigger>
              <TabsTrigger value="mine" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                My Recommendations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="flex-1 min-h-0 mt-0">
              <AIRecommendedRequests showAllRequests={true} />
            </TabsContent>
            
            <TabsContent value="mine" className="flex-1 min-h-0 mt-0">
              <AIRecommendedRequests showAllRequests={false} />
            </TabsContent>
          </Tabs>
        ) : (
          // Staff only see their recommendations
          <AIRecommendedRequests showAllRequests={false} />
        )}
      </div>
    </div>
  );
}