import { FileText, Upload, Download, FolderOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TicketPage() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tickets</h2>
        <p className="text-muted-foreground">
          Manage Tickets for Senior Care Services.
        </p>
      </div>

      <Card className="border-dashed border-2 border-green-300 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl text-green-800">Ticket Management</CardTitle>
          <CardDescription className="text-green-700">
            Ticket management system is in development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Upload className="h-4 w-4" />
              <span>Assign Tickets</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Download className="h-4 w-4" />
              <span>Track Tickets</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 