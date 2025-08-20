import { AIRecommendedRequests } from "@/components/ai-recommended-requests";

export default function RequestManagementAIRecommendationsPage() {
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
        {/* Staff only see their own recommendations */}
        <AIRecommendedRequests showAllRequests={false} />
      </div>
    </div>
  );
}