"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  Loader2,
  RefreshCw,
  ExternalLink,
  Filter,
  ChevronLeft,
  AlertTriangle,
} from "lucide-react";
import { SeniorDto } from "@/types/senior";
import { SeniorRequestDto } from "@/types/request";
import { SeniorProfileRequestFilterOptions } from "@/types/senior-profile-requests";
import { useSeniorProfileRequests } from "@/hooks/use-senior-profile-requests";
import { SeniorProfileQuickFilters } from "@/components/senior-profile/SeniorProfileQuickFilters";
import { SeniorProfileRequestFilters } from "@/components/senior-profile/SeniorProfileRequestFilters";
import { requestUtils } from "@/services/request-api";

interface SeniorRequestsModalProps {
  senior: SeniorDto | null;
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: Partial<SeniorProfileRequestFilterOptions>;
}

export function SeniorRequestsModal({
  senior,
  isOpen,
  onClose,
  initialFilters = {},
}: SeniorRequestsModalProps) {
  const [filters, setFilters] = useState<SeniorProfileRequestFilterOptions>(() => 
    initialFilters as SeniorProfileRequestFilterOptions
  );
  const [showFilters, setShowFilters] = useState(false);

  const { 
    requests, 
    allRequests, 
    loading, 
    error, 
    refetch 
  } = useSeniorProfileRequests(senior?.id || null, filters);

  const router = useRouter();

  // Get unique request types and staff from all requests for filter options
  const filterOptions = useMemo(() => {
    const requestTypes = new Map<number, string>();
    const staff = new Map<number, string>();

    allRequests.forEach(request => {
      if (request.requestTypeId && request.requestTypeName) {
        requestTypes.set(request.requestTypeId, request.requestTypeName);
      }
      if (request.assignedStaffId && request.assignedStaffName) {
        staff.set(request.assignedStaffId, request.assignedStaffName);
      }
    });

    return {
      requestTypes: Array.from(requestTypes.entries()).map(([id, name]) => ({ id, name })),
      staff: Array.from(staff.entries()).map(([id, name]) => ({ id, name })),
    };
  }, [allRequests]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityIcon = (priority: "low" | "medium" | "high" | "urgent") => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <Clock className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: "todo" | "in-progress" | "completed") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "todo":
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Convert backend priority/status for display
  const convertBackendToFrontend = (request: SeniorRequestDto) => {
    const mapPriorityToFrontend = (priority: number): "low" | "medium" | "high" | "urgent" => {
      if (priority >= 5) return "urgent";
      if (priority >= 4) return "high";
      if (priority >= 3) return "medium";
      return "low";
    };

    const mapStatusToFrontend = (status: string): "todo" | "in-progress" | "completed" => {
      switch (status) {
        case "TODO": return "todo";
        case "IN_PROGRESS": return "in-progress";
        case "COMPLETED": return "completed";
        default: return "todo";
      }
    };

    return {
      ...request,
      frontendPriority: mapPriorityToFrontend(request.priority),
      frontendStatus: mapStatusToFrontend(request.status),
    };
  };

  const handleOpenRequestManagement = () => {
    // Navigate to request management with current filters
    const params = new URLSearchParams();
    
    if (filters.priority?.length) {
      params.set('priority', filters.priority.join(','));
    }
    if (filters.status?.length) {
      params.set('status', filters.status.join(','));
    }
    if (filters.searchTerm) {
      params.set('search', filters.searchTerm);
    }
    if (senior?.id) {
      params.set('seniorId', senior.id.toString());
    }

    const url = `/admin/requests${params.toString() ? '?' + params.toString() : ''}`;
    router.push(url);
    onClose();
  };

  if (!senior) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0">
        <div className="flex h-full min-h-0">
          {/* Sidebar - Filter Panel */}
          <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${showFilters ? 'w-80 flex-shrink-0' : 'w-0 overflow-hidden'}`}>
            <div className="h-full flex flex-col">
              <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Senior Profile Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <SeniorProfileQuickFilters
                  allRequests={allRequests}
                  currentFilters={filters}
                  onFilterChange={setFilters}
                />
                
                <SeniorProfileRequestFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableRequestTypes={filterOptions.requestTypes}
                  availableStaff={filterOptions.staff}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <DialogHeader className="flex-shrink-0 p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-blue-600" />
                  <div>
                    <DialogTitle className="text-xl">
                      Requests for {senior.firstName} {senior.lastName}
                    </DialogTitle>
                    <DialogDescription>
                      View and filter service requests for this senior
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!showFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(true)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <Separator />

            <div className="flex-1 min-h-0 p-6 pt-4">
              {loading && requests.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading requests...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-32 text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Failed to load requests</span>
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <FileText className="h-8 w-8 mb-2" />
                  <span className="text-sm">
                    {allRequests.length === 0 
                      ? "No requests found for this senior"
                      : "No requests match your current filters"
                    }
                  </span>
                  {allRequests.length > 0 && requests.length === 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setFilters({})}
                      className="text-blue-600 mt-2"
                    >
                      Clear filters to see all requests
                    </Button>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-full rounded-md">
                  <div className="space-y-4 p-1 pr-3">
                    {requests.map((request) => {
                      const convertedRequest = convertBackendToFrontend(request);
                      const priorityInfo = requestUtils.getPriorityInfo(
                        convertedRequest.frontendPriority
                      );
                      const statusInfo = requestUtils.getStatusInfo(
                        convertedRequest.frontendStatus
                      );

                      return (
                        <Card
                          key={request.id}
                          className="transition-all hover:shadow-md"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {getStatusIcon(convertedRequest.frontendStatus)}
                                  {request.title}
                                </CardTitle>
                                <CardDescription className="mt-1 flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Created {formatDateTime(request.createdAt)}
                                  </span>
                                  {request.completedAt && (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <CheckCircle className="h-3 w-3" />
                                      Completed{" "}
                                      {formatDateTime(request.completedAt)}
                                    </span>
                                  )}
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Badge
                                  variant="outline"
                                  className={`${priorityInfo.bgColor} ${priorityInfo.color} border-current`}
                                >
                                  <span className="flex items-center gap-1">
                                    {getPriorityIcon(convertedRequest.frontendPriority)}
                                    {priorityInfo.label}
                                  </span>
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`${statusInfo.bgColor} ${statusInfo.color} border-current`}
                                >
                                  {statusInfo.label}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {request.description}
                              </p>
                            </div>

                            {(request.requestTypeName ||
                              request.assignedStaffName) && (
                              <>
                                <Separator />
                                <div className="flex gap-6 text-sm text-gray-600">
                                  {request.requestTypeName && (
                                    <div>
                                      <span className="font-medium">Type:</span>{" "}
                                      {request.requestTypeName}
                                    </div>
                                  )}
                                  {request.assignedStaffName && (
                                    <div>
                                      <span className="font-medium">
                                        Assigned to:
                                      </span>{" "}
                                      {request.assignedStaffName}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}

                            <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                              <span>Request ID: {request.id}</span>
                              <div className="flex items-center gap-3">
                                <span>
                                  Last updated: {formatDateTime(request.updatedAt)}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    router.push(`/admin/requests/${request.id}`);
                                    onClose();
                                  }}
                                  className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  <ScrollBar />
                </ScrollArea>
              )}
            </div>

            <Separator />

            <div className="flex-shrink-0 flex items-center justify-between text-sm text-gray-600 p-6 pt-4">
              <div className="flex items-center gap-4">
                <span>
                  Showing {requests.length} of {allRequests.length} {allRequests.length === 1 ? "request" : "requests"}
                </span>
                {requests.length !== allRequests.length && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleOpenRequestManagement}
                    className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                  >
                    View all in Request Management →
                  </Button>
                )}
              </div>
              <span>
                {senior.contactPhone && <>Contact: {senior.contactPhone}</>}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
