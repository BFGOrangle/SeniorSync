import { Settings, User, Bell, Shield, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure system settings and user preferences.
        </p>
      </div>

      <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Settings className="h-8 w-8 text-gray-600" />
          </div>
          <CardTitle className="text-xl text-gray-800">System Settings</CardTitle>
          <CardDescription className="text-gray-700">
            Settings and configuration options are being developed by your colleague.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span>User preferences</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Shield className="h-4 w-4" />
              <span>Security settings</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Palette className="h-4 w-4" />
              <span>Theme customization</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 