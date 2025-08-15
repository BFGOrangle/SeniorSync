import { AlertCircle, Clock, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

type ErrorDetails = {
  message: string;
  timestamp?: string;
  field?: string;
  rejectedValue?: any;
};

type ErrorMessageCalloutProps = {
  errorHeader?: string;
  errorMessage: string;
  errorCode?: number;
  statusText?: string;
  errors?: ErrorDetails[];
  showDetails?: boolean;
}

export function ErrorMessageCallout(props: ErrorMessageCalloutProps) {
  const {
    errorHeader = "Error",
    errorMessage,
    errorCode,
    statusText,
    errors = [],
    showDetails = true,
  } = props;

  // Format timestamp for display
  const formatTimestamp = (ts?: string) => {
    if (!ts) return null;
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-bold flex items-center gap-2">
        {errorHeader}
        {errorCode && (
          <Badge variant="destructive" className="text-xs">
            <Code className="h-3 w-3 mr-1" />
            {errorCode} {statusText}
          </Badge>
        )}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <div>{errorMessage}</div>
        
        {showDetails && (errorCode || errors.length > 0) && (
          <>
            <Separator className="my-2" />
            <div className="space-y-2 text-sm">
              {/* Show detailed error messages */}
              {errors.length > 0 && (
                <div className="space-y-1">
                  <div className="font-medium text-destructive">Error Details:</div>
                  {errors.map((error, index) => (
                    <div key={index} className="pl-4 border-l-2 border-destructive/20 space-y-1">
                      <div>{error.message}</div>
                      {error.field && (
                        <div className="text-xs text-muted-foreground">
                          Field: <code className="bg-muted px-1 rounded">{error.field}</code>
                        </div>
                      )}
                      {error.rejectedValue !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          Value: <code className="bg-muted px-1 rounded">{String(error.rejectedValue)}</code>
                        </div>
                      )}
                      {error.timestamp && (
                        <div className="text-xs text-muted-foreground">
                          Time: {formatTimestamp(error.timestamp)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
