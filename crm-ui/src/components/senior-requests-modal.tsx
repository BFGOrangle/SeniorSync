"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  User,
  Loader2,
  RefreshCw,
  X,
  ExternalLink
} from "lucide-react";
import { SeniorDto } from "@/types/senior";
import { SeniorRequestDisplayView } from "@/types/request";
import { useSeniorRequests } from "@/hooks/use-requests";
import { requestUtils } from "@/services/request-api";

interface SeniorRequestsModalProps {
  senior: SeniorDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SeniorRequestsModal({ senior, isOpen, onClose }: SeniorRequestsModalProps) {
  const { requests, loading, error, refetch } = useSeniorRequests(senior?.id || null);
  const router = useRouter();

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityIcon = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Clock className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: 'todo' | 'in-progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'todo':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!senior) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl">
                  Requests for {senior.firstName} {senior.lastName}
                </DialogTitle>
                <DialogDescription>
                  View all service requests for this senior
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 min-h-0">
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
              <span className="text-sm">No requests found for this senior</span>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-4 p-1">
                {requests.map((request) => {
                  const priorityInfo = requestUtils.getPriorityInfo(request.frontendPriority);
                  const statusInfo = requestUtils.getStatusInfo(request.frontendStatus);

                  return (
                    <Card key={request.id} className="transition-all hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {getStatusIcon(request.frontendStatus)}
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
                                  Completed {formatDateTime(request.completedAt)}
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
                                {getPriorityIcon(request.frontendPriority)}
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

                        {(request.requestTypeName || request.assignedStaffName) && (
                          <>
                            <Separator />
                            <div className="flex gap-6 text-sm text-gray-600">
                              {request.requestTypeName && (
                                <div>
                                  <span className="font-medium">Type:</span> {request.requestTypeName}
                                </div>
                              )}
                              {request.assignedStaffName && (
                                <div>
                                  <span className="font-medium">Assigned to:</span> {request.assignedStaffName}
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                          <span>Request ID: {request.id}</span>
                          <div className="flex items-center gap-2">
                            <span>Last updated: {formatDateTime(request.updatedAt)}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                router.push(`/admin/requests/${request.id}`);
                                onClose();
                              }}
                              className="h-6 text-xs"
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
            </ScrollArea>
          )}
        </div>

        <Separator />
        
        <div className="flex-shrink-0 flex items-center justify-between text-sm text-gray-600 pt-2">
          <span>
            {requests.length} {requests.length === 1 ? 'request' : 'requests'} found
          </span>
          <span>
            {senior.contactPhone && (
              <>Contact: {senior.contactPhone}</>
            )}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}