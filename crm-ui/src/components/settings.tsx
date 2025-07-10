"use client";

export default function Settings() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage application settings and preferences
        </p>
      </div>
      
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Coming Soon
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Settings panel is under development. 
                Configuration options will be available here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 