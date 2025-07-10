"use client";

export default function CreateSeniorRequestForm() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Create Senior Request</h2>
        <p className="text-muted-foreground">
          Create a new request for senior care services
        </p>
      </div>
      
      <div className="rounded-lg bg-green-50 p-4 border border-green-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Create Request Form
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Create senior request form will be available here. 
                This will include all necessary fields for creating a new request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 