"use client";

import { AIRecommendedRequests } from "@/components/ai-recommended-requests";

export default function AIRecommendationsPage() {
  return (
    <div className="container mx-auto p-6 h-[calc(100vh-2rem)] flex flex-col">
      <div className="space-y-2 flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          My AI Recommended Requests
        </h1>
        <p className="text-gray-600">
          Get AI-ranked requests to help you prioritize and focus on your most important work.
        </p>
      </div>
      
      <div className="flex-1 min-h-0">
        <AIRecommendedRequests showAllRequests={false} />
      </div>
    </div>
  );
}
