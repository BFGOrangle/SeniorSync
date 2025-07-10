import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default function StaffRequestDetailsPage({ params }: PageProps) {
  const requestId = params.id;

  if (!requestId) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Request Details</h2>
        <p className="text-muted-foreground">
          View and manage request #{requestId}
        </p>
      </div>
      
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Request Details Page
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Request details page for ID: {requestId}. 
                This will show the full request information and allow status updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 