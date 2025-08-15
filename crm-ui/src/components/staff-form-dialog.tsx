"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  StaffFormData, 
  StaffUpdateFormData, 
  COMMON_JOB_TITLES, 
} from '@/types/staff';

// Create form schema
const createStaffSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  jobTitle: z.string().min(1, 'Job title is required').max(100, 'Job title is too long'),
  contactPhone: z
    .string()
    .regex(/^$|^\+65\d{8}$/ , 'Phone must be in E.164 format e.g. +6581234567')
    .optional(),
  contactEmail: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  roleType: z.enum(['ADMIN', 'STAFF'] as const),
});

// Update form schema (no password required)
const updateStaffSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  jobTitle: z.string().min(1, 'Job title is required').max(100, 'Job title is too long'),
  contactPhone: z
    .string()
    .regex(/^$|^\+65\d{8}$/ , 'Phone must be in E.164 format e.g. +6581234567')
    .optional(),
  contactEmail: z.string().email('Invalid email address'),
  roleType: z.enum(['ADMIN', 'STAFF'] as const),
});

type CreateFormData = z.infer<typeof createStaffSchema>;
type UpdateFormData = z.infer<typeof updateStaffSchema>;

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: StaffUpdateFormData;
  onSubmit: (data: StaffFormData | StaffUpdateFormData) => Promise<boolean>;
  title: string;
  description: string;
}

// Create Staff Form Component
function CreateStaffForm({ 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  setIsSubmitting 
}: {
  onSubmit: (data: StaffFormData) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [localPhone, setLocalPhone] = useState(''); // store only the national number part
  
  const form = useForm<CreateFormData>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      jobTitle: '',
      contactPhone: '', // full E.164 stored here (+65XXXXXXXX)
      contactEmail: '',
      password: '',
      roleType: 'STAFF',
    },
  });

  // Keep form.contactPhone in sync when localPhone changes
  useEffect(() => {
    form.setValue('contactPhone', localPhone ? `+65${localPhone}` : '');
  }, [localPhone, form]);

  const handleSubmit = async (data: CreateFormData) => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(data as StaffFormData);
      if (success) {
        form.reset();
      }
    } catch (error) {
      console.error('Error submitting staff form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Personal Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job title" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COMMON_JOB_TITLES.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  If your job title is not listed, select "Other" and contact your administrator.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Enter email address" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  This will be used as the login username.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={() => (
              <FormItem>
                <FormLabel>Phone Number (E.164)</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <div className="flex items-center w-full">
                      <span className="text-sm text-muted-foreground mr-1 select-none">+65</span>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="81234567"
                        value={localPhone}
                        maxLength={8}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0,8);
                          setLocalPhone(digits);
                        }}
                        className="[&:not(:focus)]:pl-0"
                      />
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Enter 8-digit Singapore number. Will be saved as +65XXXXXXXX.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Security Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Security & Access</h3>
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter a secure password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff Member</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Administrators can manage staff and have full access. Staff members have limited access.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Staff Member'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Update Staff Form Component
function UpdateStaffForm({ 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  setIsSubmitting,
  initialData 
}: {
  onSubmit: (data: StaffUpdateFormData) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  initialData?: StaffUpdateFormData;
}) {
  const [localPhone, setLocalPhone] = useState('');
  const form = useForm<UpdateFormData>({
    resolver: zodResolver(updateStaffSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      jobTitle: initialData?.jobTitle || '',
      contactPhone: initialData?.contactPhone || '',
      contactEmail: initialData?.contactEmail || '',
      roleType: initialData?.roleType || 'STAFF',
    },
  });

  // Initialize localPhone from existing E.164 value
  useEffect(() => {
    const current = form.getValues('contactPhone');
    const match = current!.match(/^\+65(\d{8})$/);
    setLocalPhone(match ? match[1] : '');
  }, [initialData]);

  // Sync back to form when localPhone changes
  useEffect(() => {
    form.setValue('contactPhone', localPhone ? `+65${localPhone}` : '');
  }, [localPhone, form]);

  // Reset form when initial data changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        jobTitle: initialData.jobTitle,
        contactPhone: initialData.contactPhone,
        contactEmail: initialData.contactEmail,
        roleType: initialData.roleType,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: UpdateFormData) => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(data as StaffUpdateFormData);
      if (success) {
        form.reset();
      }
    } catch (error) {
      console.error('Error submitting staff form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Personal Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job title" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COMMON_JOB_TITLES.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  If your job title is not listed, select "Other" and contact your administrator.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Enter email address" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  This will be used as the login username.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={() => (
              <FormItem>
                <FormLabel>Phone Number (E.164)</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Select value={'+65'} disabled>
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+65">SG +65</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center w-full">
                      <span className="text-sm text-muted-foreground mr-1 select-none">+65</span>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="81234567"
                        value={localPhone}
                        maxLength={8}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0,8);
                          setLocalPhone(digits);
                        }}
                        className="[&:not(:focus)]:pl-0"
                      />
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Enter 8-digit Singapore number. Will be saved as +65XXXXXXXX.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Security Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Security & Access</h3>
          
          <FormField
            control={form.control}
            name="roleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff Member</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Administrators can manage staff and have full access. Staff members have limited access.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Staff Member'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function StaffFormDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
  title,
  description,
}: StaffFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmitWrapper = async (data: StaffFormData | StaffUpdateFormData) => {
    const success = await onSubmit(data);
    if (success) {
      onOpenChange(false);
    }
    return success;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {mode === 'create' ? (
          <CreateStaffForm
            onSubmit={handleSubmitWrapper}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        ) : (
          <UpdateStaffForm
            onSubmit={handleSubmitWrapper}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            initialData={initialData}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}