"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Heart,
  Shield,
  Edit3,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";
import { Ticket, Priority, Status } from "@/types/ticket";
import {
  getPriorityColor,
  getStatusColor,
  formatDate,
  isOverdue,
} from "@/lib/ticket-utils";
import { REQUEST_TYPES } from "@/services/senior-request-api";
import { assignees } from "@/lib/ticket-data";
import { cn } from "@/lib/utils";

interface TicketModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedTicket: Ticket) => void;
  children?: React.ReactNode;
}

export function TicketModal({
  ticket,
  isOpen,
  onOpenChange,
  onUpdate,
  children,
}: TicketModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState<Ticket>(ticket);

  // Update editedTicket when ticket prop changes
  useEffect(() => {
    setEditedTicket(ticket);
  }, [ticket]);

  const handleSave = () => {
    onUpdate(editedTicket);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTicket(ticket);
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
                {ticket.id}
              </Badge>
              {isOverdue(ticket.dueDate) && ticket.status !== "completed" && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
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
          <DialogDescription>
            {isEditing
              ? "Make changes to the senior care request below."
              : "View and manage senior care request details."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Status and Priority Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {isEditing ? (
                <Select
                  value={editedTicket.status}
                  onValueChange={(value: Status) =>
                    setEditedTicket({ ...editedTicket, status: value })
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
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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
                    className={cn("capitalize", getStatusColor(ticket.status))}
                  >
                    {ticket.status.replace("-", " ")}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              {isEditing ? (
                <Select
                  value={editedTicket.priority}
                  onValueChange={(value: Priority) =>
                    setEditedTicket({ ...editedTicket, priority: value })
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
                    className={cn("capitalize", getPriorityColor(ticket.priority))}
                  >
                    {ticket.priority}
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
                {isEditing ? (
                  <Input
                    id="seniorName"
                    value={editedTicket.seniorName || ""}
                    onChange={(e) =>
                      setEditedTicket({ ...editedTicket, seniorName: e.target.value })
                    }
                    placeholder="Enter senior's name"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(ticket.seniorName || "N/A")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{ticket.seniorName || "N/A"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phoneNumber"
                    value={editedTicket.phoneNumber || ""}
                    onChange={(e) =>
                      setEditedTicket({ ...editedTicket, phoneNumber: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{ticket.phoneNumber || "N/A"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedTicket.email || ""}
                    onChange={(e) =>
                      setEditedTicket({ ...editedTicket, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{ticket.email || "N/A"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={editedTicket.address || ""}
                    onChange={(e) =>
                      setEditedTicket({ ...editedTicket, address: e.target.value })
                    }
                    placeholder="Enter address"
                    className="min-h-[60px]"
                  />
                ) : (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <span>{ticket.address || "N/A"}</span>
                  </div>
                )}
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
                    value={editedTicket.title || ""}
                    onChange={(e) =>
                      setEditedTicket({ ...editedTicket, title: e.target.value })
                    }
                    placeholder="Enter request title"
                  />
                ) : (
                  <span className="font-medium">{ticket.title || "N/A"}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestType">Request Type</Label>
                {isEditing ? (
                  <Select
                    value={editedTicket.requestType || ""}
                    onValueChange={(value) =>
                      setEditedTicket({ ...editedTicket, requestType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUEST_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">{ticket.requestType || "N/A"}</Badge>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={editedTicket.description || ""}
                    onChange={(e) =>
                      setEditedTicket({ ...editedTicket, description: e.target.value })
                    }
                    placeholder="Enter request description"
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {ticket.description || "No description provided."}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred Date</Label>
                {isEditing ? (
                  <Input
                    id="preferredDate"
                    type="date"
                    value={editedTicket.preferredDate || ""}
                    onChange={(e) =>
                      setEditedTicket({ ...editedTicket, preferredDate: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {ticket.preferredDate
                        ? formatDate(new Date(ticket.preferredDate))
                        : "N/A"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred Time</Label>
                {isEditing ? (
                  <Input
                    id="preferredTime"
                    type="time"
                    value={editedTicket.preferredTime || ""}
                    onChange={(e) =>
                      setEditedTicket({ ...editedTicket, preferredTime: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{ticket.preferredTime || "N/A"}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mobility Assistance Required</Label>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mobilityAssistance"
                    checked={editedTicket.mobilityAssistance || false}
                    onCheckedChange={(checked) =>
                      setEditedTicket({
                        ...editedTicket,
                        mobilityAssistance: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="mobilityAssistance" className="text-sm font-normal">
                    This senior requires mobility assistance
                  </Label>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge
                    variant={ticket.mobilityAssistance ? "default" : "secondary"}
                  >
                    {ticket.mobilityAssistance ? "Required" : "Not Required"}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Medical Information
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                {isEditing ? (
                  <Textarea
                    id="medicalConditions"
                    value={editedTicket.medicalConditions || ""}
                    onChange={(e) =>
                      setEditedTicket({
                        ...editedTicket,
                        medicalConditions: e.target.value,
                      })
                    }
                    placeholder="Enter medical conditions"
                    className="min-h-[60px]"
                  />
                ) : (
                  <p className="text-gray-700">
                    {ticket.medicalConditions || "No medical conditions specified."}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                {isEditing ? (
                  <Textarea
                    id="medications"
                    value={editedTicket.medications || ""}
                    onChange={(e) =>
                      setEditedTicket({ ...editedTicket, medications: e.target.value })
                    }
                    placeholder="Enter current medications"
                    className="min-h-[60px]"
                  />
                ) : (
                  <p className="text-gray-700">
                    {ticket.medications || "No medications specified."}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Emergency Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                {isEditing ? (
                  <Input
                    id="emergencyContact"
                    value={editedTicket.emergencyContact || ""}
                    onChange={(e) =>
                      setEditedTicket({
                        ...editedTicket,
                        emergencyContact: e.target.value,
                      })
                    }
                    placeholder="Enter emergency contact name"
                  />
                ) : (
                  <span>{ticket.emergencyContact || "N/A"}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                {isEditing ? (
                  <Input
                    id="emergencyPhone"
                    value={editedTicket.emergencyPhone || ""}
                    onChange={(e) =>
                      setEditedTicket({
                        ...editedTicket,
                        emergencyPhone: e.target.value,
                      })
                    }
                    placeholder="Enter emergency contact phone"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{ticket.emergencyPhone || "N/A"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assignment</h3>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assigned Agent</Label>
              {isEditing ? (
                <Select
                  value={editedTicket.assignee || editedTicket.agentName || ""}
                  onValueChange={(value) =>
                    setEditedTicket({
                      ...editedTicket,
                      assignee: value,
                      agentName: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                    {assignees.map((agent) => (
                      <SelectItem key={agent} value={agent}>
                        {agent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(ticket.assignee || ticket.agentName || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <span>{ticket.assignee || ticket.agentName || "Unassigned"}</span>
                </div>
              )}
            </div>
          </div>

          {/* System Information */}
          <Separator />
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{formatDate(new Date(ticket.createdAt))}</span>
            </div>
            {ticket.updatedAt && (
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{formatDate(new Date(ticket.updatedAt))}</span>
              </div>
            )}
            {ticket.dueDate && (
              <div className="flex justify-between">
                <span>Due Date:</span>
                <span
                  className={cn(
                    isOverdue(ticket.dueDate) && ticket.status !== "completed"
                      ? "text-red-600 font-medium"
                      : ""
                  )}
                >
                  {formatDate(ticket.dueDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
