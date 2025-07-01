import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  X,
  Edit3,
  User,
  FileText,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { SeniorRequestDisplayView } from "@/types/request";
import { cn } from "@/lib/utils";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "pending" | "in-progress" | "in-review" | "completed" | "cancelled";

interface RequestModalProps {
  request: SeniorRequestDisplayView;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedRequest: SeniorRequestDisplayView) => void;
  children?: React.ReactNode;
}

export function RequestModal({
  request,
  isOpen,
  onOpenChange,
  onUpdate,
  children,
}: RequestModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRequest, setEditedRequest] = useState<SeniorRequestDisplayView>(request);

  // Update editedRequest when request prop changes
  useEffect(() => {
    setEditedRequest(request);
  }, [request]);

  const handleSave = () => {
    onUpdate(editedRequest);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRequest(request);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const priorityOptions: Priority[] = ["urgent", "high", "medium", "low"];
  const statusOptions: Status[] = [
    "pending",
    "in-progress", 
    "in-review",
    "completed",
    "cancelled",
  ];

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
      case "pending":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "in-progress":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "in-review":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "cancelled":
        return "text-gray-600 bg-gray-50 border-gray-200";
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-semibold">
                {isEditing ? "Edit Request" : "Request Details"}
              </DialogTitle>
              <Badge
                variant="secondary"
                className="text-xs font-mono bg-gray-50 text-gray-600"
              >
                {request.id}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
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
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Request Status & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {isEditing ? (
                <Select
                  value={editedRequest.frontendStatus}
                  onValueChange={(value: Status) =>
                    setEditedRequest({ ...editedRequest, frontendStatus: value })
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
                    className={cn("capitalize", getStatusColor(request.frontendStatus))}
                  >
                    {request.frontendStatus.replace("-", " ")}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              {isEditing ? (
                <Select
                  value={editedRequest.frontendPriority}
                  onValueChange={(value: Priority) =>
                    setEditedRequest({ ...editedRequest, frontendPriority: value })
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
                      getPriorityColor(request.frontendPriority)
                    )}
                  >
                    {request.frontendPriority}
                  </Badge>
                </div>
              )}
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
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(request.seniorName || "N/A")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {request.seniorName || "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{request.seniorPhone || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{request.seniorEmail || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="address">Address</Label>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <span>{request.seniorAddress || "N/A"}</span>
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
                {isEditing ? (
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
                  <span className="font-medium">{request.title || "N/A"}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestType">Request Type</Label>
                <Badge variant="secondary">
                  {request.requestTypeName || "N/A"}
                </Badge>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
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
                    {request.description || "No description provided."}
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
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getInitials(request.assignedStaffName || "U")}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {request.assignedStaffName || "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          {/* System Information */}
          <Separator />
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{formatDate(request.createdAt)}</span>
            </div>
            {request.updatedAt && (
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{formatDate(request.updatedAt)}</span>
              </div>
            )}
            {request.completedAt && (
              <div className="flex justify-between">
                <span>Completed:</span>
                <span>{formatDate(request.completedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
