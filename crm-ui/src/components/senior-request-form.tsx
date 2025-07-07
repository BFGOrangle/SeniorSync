"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, ClockIcon, UserIcon, PhoneIcon, MapPinIcon, AlertTriangleIcon, HeartHandshakeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import { SeniorRequestAPI, REQUEST_TYPES, PRIORITY_LEVELS } from "@/services/senior-request-api";
import { SeniorRequest } from "@/types/senior-request";

// Form validation schema
const formSchema = z.object({
  // Personal Information
  seniorName: z.string().min(2, { message: "Senior's name must be at least 2 characters." }),
  phoneNumber: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, { message: "Please enter a valid phone number." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal("")),
  address: z.string().min(10, { message: "Please provide a complete address." }),
  emergencyContact: z.string().min(2, { message: "Emergency contact name is required." }),
  emergencyPhone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, { message: "Please enter a valid emergency phone number." }),
  
  // Request Details
  requestType: z.string().min(1, { message: "Please select a request type." }),
  priority: z.enum(["low", "medium", "high", "urgent"], { required_error: "Please select a priority level." }),
  description: z.string().min(10, { message: "Please provide a detailed description (minimum 10 characters)." }),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  
  // Medical Information
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  mobilityAssistance: z.boolean(),
  
  // Agent Information
  agentName: z.string().min(2, { message: "Agent name is required." }),
  agentId: z.string().min(3, { message: "Agent ID is required." }),
});

type FormData = z.infer<typeof formSchema>;

export function SeniorRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentValidated, setAgentValidated] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seniorName: "",
      phoneNumber: "",
      email: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      requestType: "",
      priority: "medium",
      description: "",
      preferredDate: "",
      preferredTime: "",
      medicalConditions: "",
      medications: "",
      mobilityAssistance: false,
      agentName: "",
      agentId: "",
    },
  });

  const validateAgent = async (agentId: string) => {
    if (agentId.length < 3) return;
    
    try {
      const response = await SeniorRequestAPI.validateAgent(agentId);
      if (response.success && response.data) {
        form.setValue("agentName", response.data.name);
        setAgentValidated(true);
        toast({
          title: "Agent Validated",
          description: `Welcome, ${response.data.name}!`,
        });
      } else {
        setAgentValidated(false);
        form.setValue("agentName", "");
        toast({
          title: "Invalid Agent ID",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setAgentValidated(false);
      toast({
        title: "Validation Error",
        description: "Unable to validate agent ID. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!agentValidated) {
      toast({
        title: "Agent Validation Required",
        description: "Please enter a valid agent ID before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const requestData: Omit<SeniorRequest, 'createdAt' | 'status'> = {
        ...data,
        mobilityAssistance: data.mobilityAssistance || false,
      };

      const response = await SeniorRequestAPI.submitRequest(requestData);
      
      if (response.success) {
        toast({
          title: "Request Submitted Successfully!",
          description: response.message,
        });
        form.reset();
        setAgentValidated(false);
      } else {
        toast({
          title: "Submission Failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <HeartHandshakeIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Senior Care Request Form</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Submit detailed information about senior care requests to ensure proper assistance and support.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Agent Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Agent Information
              </CardTitle>
              <CardDescription>
                Please verify your agent credentials before proceeding.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your agent ID (e.g., AGT001)"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          validateAgent(e.target.value);
                        }}
                        className={agentValidated ? "border-green-500" : ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your agent ID to validate your credentials.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Will be filled automatically"
                        {...field}
                        disabled
                        className="bg-gray-50"
                      />
                    </FormControl>
                    <FormDescription>
                      This field will be populated after agent ID validation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Senior's Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Senior's Personal Information
              </CardTitle>
              <CardDescription>
                Basic information about the senior requesting assistance.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="seniorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senior's Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter senior's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 (555) 123-4567"
                        {...field}
                        className="flex items-center"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="senior@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Complete Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter complete address including apartment/unit number"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Emergency Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5" />
                Emergency Contact Information
              </CardTitle>
              <CardDescription>
                Contact information for emergencies or urgent situations.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter emergency contact name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangleIcon className="h-5 w-5" />
                Request Details
              </CardTitle>
              <CardDescription>
                Detailed information about the assistance needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="requestType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Request</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select request type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REQUEST_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITY_LEVELS.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <span className={priority.color}>{priority.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide a detailed description of the assistance needed, including any specific requirements or concerns..."
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      The more details you provide, the better we can assist the senior.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="preferredDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferredTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time (Optional)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartHandshakeIcon className="h-5 w-5" />
                Medical Information (Optional)
              </CardTitle>
              <CardDescription>
                Medical information that may be relevant to the request.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="medicalConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List any relevant medical conditions, disabilities, or health concerns..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Medications</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List current medications and dosages..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobilityAssistance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Requires Mobility Assistance</FormLabel>
                      <FormDescription>
                        Check if the senior requires assistance with walking, wheelchair, or other mobility aids.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setAgentValidated(false);
              }}
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !agentValidated}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}