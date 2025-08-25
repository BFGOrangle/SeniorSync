import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Plus,
  Trash2,
  X,
  Clock,
  CheckCircle,
  Circle,
} from "lucide-react";
import { Reminder, CreateReminderDto } from "@/types/reminder";
import { useRequestReminders } from "@/hooks/use-reminders";
import { cn } from "@/lib/utils";

interface ReminderSectionProps {
  requestId: number;
  isEditing: boolean;
  className?: string;
}

export function ReminderSection({
  requestId,
  isEditing,
  className,
}: ReminderSectionProps) {
  const {
    reminders,
    isLoading,
    error,
    createReminder,
    deleteReminder,
    clearError,
  } = useRequestReminders(requestId);

  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<CreateReminderDto>>({
    title: "",
    description: "",
    reminderDate: "",
  });

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTimeLocal = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";

      // Convert to YYYY-MM-DDTHH:MM format for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const isOverdue = (dateString: string): boolean => {
    try {
      const reminderDate = new Date(dateString);
      return reminderDate < new Date();
    } catch {
      return false;
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.reminderDate) return;

    try {
      // Convert datetime-local format to ISO string
      const reminderDateTime = new Date(newReminder.reminderDate).toISOString();

      await createReminder({
        title: newReminder.title,
        description: newReminder.description || "",
        reminderDate: reminderDateTime,
      });

      // Reset form
      setNewReminder({
        title: "",
        description: "",
        reminderDate: "",
      });
      setIsAddingReminder(false);
    } catch (error) {
      console.error("Failed to add reminder:", error);
    }
  };

  const handleDeleteReminder = async (reminderId: number) => {
    try {
      await deleteReminder(reminderId);
    } catch (error) {
      console.error("Failed to delete reminder:", error);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Reminders</h3>
          <Badge variant="secondary" className="text-xs">
            {reminders.length}
          </Badge>
        </div>
          <Button
            size="sm"
            onClick={() => setIsAddingReminder(!isAddingReminder)}
            className="h-8"
          >
            {isAddingReminder ? "Cancel" : "Add Reminder"}
          </Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearError}
            className="ml-auto h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Add reminder form */}
      {isAddingReminder && (
        <div className="bg-gray-50 p-4 rounded-md border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reminderTitle">Title</Label>
              <Input
                id="reminderTitle"
                value={newReminder.title || ""}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, title: e.target.value })
                }
                placeholder="Enter reminder title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderDate">Date & Time</Label>
              <Input
                id="reminderDate"
                type="datetime-local"
                value={newReminder.reminderDate || ""}
                onChange={(e) =>
                  setNewReminder({
                    ...newReminder,
                    reminderDate: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="reminderDescription">Description</Label>
            <Textarea
              id="reminderDescription"
              value={newReminder.description || ""}
              onChange={(e) =>
                setNewReminder({ ...newReminder, description: e.target.value })
              }
              placeholder="Enter reminder description (optional)"
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              size="sm"
              onClick={handleAddReminder}
              className="h-8"
              disabled={!newReminder.title || !newReminder.reminderDate}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Reminder
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          Loading reminders...
        </div>
      )}

      {/* Reminders list */}
      {!isLoading && reminders.length > 0 ? (
        <div className="space-y-2">
          {reminders.map((reminder) => {
            const overdue = isOverdue(reminder.reminderDateTime);

            return (
              <div
                key={reminder.id}
                className={cn(
                  "flex items-start justify-between p-4 rounded-md border transition-colors",
                  overdue && "border-green-200 bg-green-50",
                  !overdue && "border-gray-200 bg-white hover:bg-gray-50"
                )}
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {overdue ? (
                        <AlertCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="font-medium">{reminder.title}</span>
                      {overdue && (
                        <Badge variant="default" className="text-xs">
                          Done
                        </Badge>
                      )}
                    </div>
                  </div>

                  {reminder.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {reminder.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatDate(reminder.reminderDateTime)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="h-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No reminders set for this request.</p>
              <p className="text-xs mt-1">
                Click "Add Reminder" to create one.
              </p>
          </div>
        )
      )}
    </div>
  );
}
