"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Info } from 'lucide-react';

export default function SeniorRequestsPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push('/admin/request-management');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleRedirect = () => {
    router.push('/admin/request-management');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Info className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Feature Moved</CardTitle>
          <CardDescription>
            The create request form has been integrated into the Request Management page
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            You can now create new requests directly from the Request Management page using the &quot;Create Request&quot; button.
          </p>
          
          <Button 
            onClick={handleRedirect}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Go to Request Management
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <p className="text-xs text-gray-500">
            Redirecting automatically in 3 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 