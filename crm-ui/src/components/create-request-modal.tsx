"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";
import { CreateSeniorRequestDto } from "@/types/request";
import { SeniorDto } from "@/types/senior";
import { RequestManagementApiService } from "@/services/request-api";
import { seniorApiService } from "@/services/senior-api";
import { DateTimePicker } from "@/components/ui/date-time-picker";

// Hardcoded request types from database migration
const REQUEST_TYPES = [
  {
    id: 1,
    name: "Reading Assistance",
    description: "Help with reading books, mail, documents, or digital content",
  },
  {
    id: 2,
    name: "Physical Item Moving",
    description:
      "Assistance with moving, lifting, or rearranging furniture and belongings",
  },
  {
    id: 3,
    name: "Transportation",
    description:
      "Help with transportation to appointments, shopping, or social activities",
  },
  {
    id: 4,
    name: "Medication Reminders",
    description: "Reminders and assistance with medication schedules",
  },
  {
    id: 5,
    name: "Grocery Shopping",
    description: "Shopping for groceries and household necessities",
  },
  {
    id: 6,
    name: "Meal Preparation",
    description: "Assistance with preparing nutritious meals",
  },
  {
    id: 7,
    name: "Housekeeping",
    description: "Help with light cleaning, laundry, and household chores",
  },
  {
    id: 8,
    name: "Technology Support",
    description:
      "Assistance with computers, phones, tablets, or other digital devices",
  },
  {
    id: 9,
    name: "Social Visit",
    description: "Friendly visits for companionship and social interaction",
  },
  {
    id: 10,
    name: "Wellness Check",
    description: "Regular check-ins to ensure health and safety",
  },
  {
    id: 11,
    name: "Outdoor Assistance",
    description: "Help with gardening, yard work, or outdoor maintenance",
  },
  {
    id: 12,
    name: "Administrative Help",
    description: "Assistance with paperwork, bills, forms, or applications",
  },
  {
    id: 13,
    name: "Personal Care",
    description: "Help with hygiene, dressing, or other personal care tasks",
  },
  {
    id: 14,
    name: "Exercise Support",
    description:
      "Assistance with prescribed exercises or physical activity routines",
  },
  {
    id: 15,
    name: "Errands",
    description: "Help with miscellaneous errands outside the home",
  },
];

// Form validation schema matching backend API
const createRequestSchema = z.object({
  seniorId: z.number({ required_error: "Please select a senior" }),
  requestTypeId: z.number({ required_error: "Please select a request type" }),
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  priority: z
    .number()
    .min(1)
    .max(5, { message: "Priority must be between 1 and 5" }),
  dueDate: z
    .string()
    .optional()
    .refine(
      (date) => !date || new Date(date) > new Date(),
      { message: "Due date must be in the future" }
    ),
});

type CreateRequestFormData = z.infer<typeof createRequestSchema>;

interface CreateRequestModalProps {
  onRequestCreated: () => void;
  trigger?: React.ReactNode;
}

export function CreateRequestModal({
  onRequestCreated,
  trigger,
}: CreateRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seniors, setSeniors] = useState<SeniorDto[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const { toast } = useToast();
  const requestApi = new RequestManagementApiService();

  const form = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      seniorId: undefined,
      requestTypeId: undefined,
      priority: 3,
      dueDate: undefined,

    },
  });

  const loadInitialData = useCallback(async () => {
    setLoadingData(true);
    try {
      // Load initial seniors
      const seniorsData = await seniorApiService.getSeniorsPaginated({
        page: 0,
        size: 50,
      });
      setSeniors(seniorsData.content);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast({
        title: "Error",
        description: "Failed to load seniors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  }, [toast]);

  // Load seniors when modal opens
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open, loadInitialData]);

  const onSubmit = async (data: CreateRequestFormData) => {
    setIsLoading(true);
    try {
      const createDto: CreateSeniorRequestDto = {
        seniorId: data.seniorId,
        requestTypeId: data.requestTypeId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate || undefined,
      };

      await requestApi.createRequest(createDto);

      toast({
        title: "Success",
        description: "Request created successfully!",
      });

      form.reset();
      setOpen(false);
      onRequestCreated();
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityLabel = (priority: number) => {
    const labels = {
      1: { label: "Low", color: "text-green-600" },
      2: { label: "Medium-Low", color: "text-yellow-500" },
      3: { label: "Medium", color: "text-yellow-600" },
      4: { label: "High", color: "text-orange-600" },
      5: { label: "Urgent", color: "text-red-600" },
    };
    return labels[priority as keyof typeof labels] || labels[3];
  };

  const defaultTrigger = (
    <Button className="bg-blue-600 hover:bg-blue-700">
      <Plus className="h-4 w-4 mr-2" />
      Create Request
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Request</DialogTitle>
          <DialogDescription>
            Create a new senior care request. Fill in all required information
            below.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading form data...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Senior Selection with integrated search */}
              <FormField
                control={form.control}
                name="seniorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Senior</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={seniors.map((senior) => ({
                          value: senior.id.toString(),
                          label: `${senior.firstName} ${senior.lastName}`,
                          subtitle:
                            senior.contactPhone ||
                            senior.contactEmail ||
                            undefined,
                        }))}
                        value={field.value?.toString()}
                        onValueChange={(value) =>
                          field.onChange(value ? parseInt(value) : undefined)
                        }
                        placeholder="Select a senior..."
                        searchPlaceholder="Search seniors by name, phone, or email..."
                        emptyMessage="No seniors found matching your search"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Request Type */}
              <FormField
                control={form.control}
                name="requestTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Type</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={REQUEST_TYPES.map((type) => ({
                          value: type.id.toString(),
                          label: type.name,
                          subtitle: type.description,
                        }))}
                        value={field.value?.toString()}
                        onValueChange={(value) =>
                          field.onChange(value ? parseInt(value) : undefined)
                        }
                        placeholder="Select request type..."
                        searchPlaceholder="Search request types..."
                        emptyMessage="No request types found matching your search"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief title for the request..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed information about the assistance needed..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level (1-5)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((priority) => {
                          const info = getPriorityLabel(priority);
                          return (
                            <SelectItem
                              key={priority}
                              value={priority.toString()}
                            >
                              <span className={info.color}>
                                {priority} - {info.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              

              {/* Due Date */}
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={(value) => {
                          console.log("Form received value from DateTimePicker:", value);
                          field.onChange(value);
                        }}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      When should this request be completed?
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />


              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Request"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
