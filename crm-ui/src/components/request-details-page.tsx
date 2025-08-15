"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  User,
  FileText,
  Phone,
  Mail,
  MapPin,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { SeniorRequestDisplayView } from "@/types/request";
import { ReminderSection } from "@/components/reminder-section";
import { CommentSection } from "@/components/comment-section";
import { useRequestDetails } from "@/hooks/use-requests";
import { useCurrentUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";
import InitialsAvatar from "@/components/initials-avatar";
import { SpamIndicatorBadge } from "@/components/spam-indicator-badge";
import { ErrorMessageCallout } from "@/components/error-message-callout";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "todo" | "in-progress" | "completed";

interface RequestDetailsPageProps {
  requestId: number;
}

export function RequestDetailsPage({ requestId }: RequestDetailsPageProps) {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [isEditing, setIsEditing] = useState(false);
  const [editedRequest, setEditedRequest] =
    useState<SeniorRequestDisplayView | null>(null);

  const {
    request,
    loading,
    error: hookError,
    updateRequest,
  } = useRequestDetails(requestId || null);

  const error = hookError?.message || null;

  // Update local state when request loads
  useEffect(() => {
    if (request) {
      setEditedRequest(request);
    }
  }, [request]);

  const handleSave = async () => {
    if (!editedRequest) return;

    try {
      await updateRequest(editedRequest);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update request:", err);
      // Handle error - maybe show a toast notification
    }
  };

  const handleCancel = () => {
    if (request) {
      setEditedRequest(request);
      setIsEditing(false);
    }
  };

  const priorityOptions: Priority[] = ["urgent", "high", "medium", "low"];
  const statusOptions: Status[] = ["todo", "in-progress", "completed"];

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "todo":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "in-progress":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (date: string | undefined): string => {
    if (!date) return "No date";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Determine if user can edit this request
  const canEdit = isAdmin || 
    (currentUser && editedRequest?.assignedStaffId === parseInt(currentUser.id));

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading request details...</span>
        </div>
      </div>
    );
  }

  if (error || !editedRequest) {
    return (
      <div className="container mx-auto p-6">
        <ErrorMessageCallout
          errorHeader="Request Details Error"
          errorMessage={error || "Request not found. This request may have been deleted or you may not have permission to view it."}
          errorCode={hookError?.status}
          statusText={hookError?.statusText}
          errors={hookError?.errors}
        />
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-8"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {isEditing ? "Edit Request" : "Request Details"}
            </h1>
            <Badge
              variant="secondary"
              className="text-xs font-mono bg-gray-50 text-gray-600"
            >
              {editedRequest.id}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Only show edit button if user has permission */}
          {canEdit && !isEditing ? (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : canEdit && isEditing ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="h-8">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Request Status, Priority & Spam Detection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {isEditing && canEdit ? (
                <Select
                  value={editedRequest.frontendStatus}
                  onValueChange={(value: Status) =>
                    setEditedRequest({
                      ...editedRequest,
                      frontendStatus: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              getStatusColor(status)
                            )}
                          />
                          {status
                            .split("-")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      getStatusColor(editedRequest.frontendStatus)
                    )}
                  >
                    {editedRequest.frontendStatus.replace("-", " ")}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              {isEditing && isAdmin ? (
                <Select
                  value={editedRequest.frontendPriority}
                  onValueChange={(value: Priority) =>
                    setEditedRequest({
                      ...editedRequest,
                      frontendPriority: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              getPriorityColor(priority)
                            )}
                          />
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      getPriorityColor(editedRequest.frontendPriority)
                    )}
                  >
                    {editedRequest.frontendPriority}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Spam Detection</Label>
              <div className="flex items-center gap-2">
                <SpamIndicatorBadge
                  isSpam={editedRequest.isSpam}
                  confidenceScore={editedRequest.spamConfidenceScore}
                  detectionReason={editedRequest.spamDetectionReason}
                  detectedAt={editedRequest.spamDetectedAt}
                  size="md"
                  showText={true}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Senior Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Senior Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seniorName">Senior Name</Label>
                <div className="flex items-center gap-2">
                  <InitialsAvatar name={editedRequest.seniorName || "N/A"}/>
                  <span className="font-medium">
                    {editedRequest.seniorName || "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{editedRequest.seniorPhone || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{editedRequest.seniorEmail || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="address">Address</Label>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <span>{editedRequest.seniorAddress || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Request Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Request Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                {isEditing && canEdit ? (
                  <Input
                    id="title"
                    value={editedRequest.title || ""}
                    onChange={(e) =>
                      setEditedRequest({
                        ...editedRequest,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter request title"
                  />
                ) : (
                  <span className="font-medium px-2">
                    {editedRequest.title || "N/A"}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestType">Request Type</Label>
                <Badge variant="secondary" className="px-2">
                  {editedRequest.requestTypeName || "N/A"}
                </Badge>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                {isEditing && canEdit ? (
                  <Textarea
                    id="description"
                    value={editedRequest.description || ""}
                    onChange={(e) =>
                      setEditedRequest({
                        ...editedRequest,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter request description"
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {editedRequest.description || "No description provided."}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assignment</h3>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assigned Staff</Label>
              <div className="flex items-center gap-2">
                <InitialsAvatar name={editedRequest.assignedStaffName || "Unassigned"}/>
                <span>{editedRequest.assignedStaffName || "Unassigned"}</span>
              </div>
            </div>
          </div>

          {/* Reminders */}
          <Separator />
          <ReminderSection requestId={editedRequest.id} isEditing={(isEditing && canEdit) || false} />

          {/* Comments & Follow-ups */}
          <Separator />
          <CommentSection 
            requestId={editedRequest.id} 
          />

          {/* System Information */}
          <Separator />
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{formatDate(editedRequest.createdAt)}</span>
            </div>
            {editedRequest.updatedAt && (
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{formatDate(editedRequest.updatedAt)}</span>
              </div>
            )}
            {editedRequest.completedAt && (
              <div className="flex justify-between">
                <span>Completed:</span>
                <span>{formatDate(editedRequest.completedAt)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}