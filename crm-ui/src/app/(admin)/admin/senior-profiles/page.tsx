import { Users, UserPlus, Search, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientsPage() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Senior Profiles</h2>
        <p className="text-muted-foreground">
          Manage client information and contact details for senior care services.
        </p>
      </div>

      <Card className="border-dashed border-2 border-indigo-300 bg-indigo-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
          <CardTitle className="text-xl text-indigo-800">Senior Profiles</CardTitle>
          <CardDescription className="text-indigo-700">
            Senior Profile features are in development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-2 text-sm text-indigo-700">
              <UserPlus className="h-4 w-4" />
              <span>Add new senior profiles</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-indigo-700">
              <Search className="h-4 w-4" />
              <span>Search and filter</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-indigo-700">
              <Phone className="h-4 w-4" />
              <span>View Past Requests</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-indigo-700">
              <Users className="h-4 w-4" />
              <span>Things to know</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 