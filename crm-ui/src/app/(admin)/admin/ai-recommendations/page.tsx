"use client";

import { AIRecommendations } from "@/components/ai-recommendations";

export default function AdminAIRecommendationsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          AI Task Recommendations
        </h1>
        <p className="text-gray-600">
          Get intelligent task recommendations powered by AI to optimize workflow and prioritize the most important work across all staff members.
        </p>
      </div>
      
      <AIRecommendations />
    </div>
  );
}
