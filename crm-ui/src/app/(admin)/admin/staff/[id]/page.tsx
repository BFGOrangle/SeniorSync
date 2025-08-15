"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  User,
  UserCheck,
  UserX,
  Clock,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { useStaff, useStaffManagement } from '@/hooks/use-staff';
import { useCurrentUser } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StaffFormDialog } from '@/components/staff-form-dialog';
import { 
  StaffDisplayView, 
  StaffUtils, 
  ROLE_TYPE_DISPLAY 
} from '@/types/staff';

export default function StaffProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  
  const staffId = params.id ? parseInt(params.id as string) : null;
  const { staff, loading, error, updateStaff, refetch } = useStaff({ staffId });
  const { deleteStaff, toggleStaffStatus } = useStaffManagement();
  
  const [isEditing, setIsEditing] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [toggleStatusAlert, setToggleStatusAlert] = useState<{
    open: boolean;
    newStatus: boolean;
  }>({ open: false, newStatus: false });

  if (loading) {
    return <StaffProfileSkeleton />;
  }

  if (error || !staff) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Staff Member Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The staff member you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const displayStaff = StaffUtils.toDisplayView(staff);
  const canEdit = currentUser?.role === 'ADMIN' || parseInt(currentUser?.id || '0') === staff.id;

  const handleEdit = async (formData: any) => {
    const success = await updateStaff(formData);
    if (success) {
      setIsEditing(false);
      refetch();
    }
    return success;
  };

  const handleDelete = async () => {
    if (!staff) return;
    
    const success = await deleteStaff(staff.id);
    if (success) {
      setDeleteAlert(false);
      router.push('/admin/staff');
    }
  };

  const handleToggleStatus = async () => {
    if (!staff) return;
    
    const success = await toggleStaffStatus(staff.id, toggleStatusAlert.newStatus);
    if (success) {
      setToggleStatusAlert({ open: false, newStatus: false });
      refetch();
    }
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  const getRoleBadgeVariant = (roleType: string) => {
    return roleType === 'ADMIN' ? 'destructive' : 'outline';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{staff.fullName}</h1>
            <p className="text-muted-foreground">Staff Profile</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDeleteAlert(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Staff Member
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => 
                    setToggleStatusAlert({ open: true, newStatus: !staff.isActive })
                  }
                >
                  {staff.isActive ? (
                    <UserX className="h-4 w-4 mr-2 text-red-600" />
                  ) : (
                    <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                  )}
                  {staff.isActive ? 'Deactivate' : 'Activate'} Staff Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarFallback className="text-2xl">
                {StaffUtils.getInitials(staff.fullName)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{staff.fullName}</CardTitle>
            <CardDescription className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Badge variant={getRoleBadgeVariant(staff.roleType)}>
                  {ROLE_TYPE_DISPLAY[staff.roleType]}
                </Badge>
                <Badge variant={getStatusBadgeVariant(staff.isActive)}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-lg font-medium">{staff.jobTitle}</p>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Contact Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{staff.contactEmail}</p>
                </div>
              </div>
              
              {staff.contactPhone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{staff.contactPhone}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">
                    {ROLE_TYPE_DISPLAY[staff.roleType]}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {staff.isActive ? (
                  <UserCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <UserX className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Staff ID</p>
                  <p className="text-sm text-muted-foreground">{staff.id}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {StaffUtils.formatDate(staff.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-sm text-muted-foreground">
                    {displayStaff.lastLoginDisplay}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Center Information */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Center Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Center</p>
                <p className="text-sm text-muted-foreground">
                  {staff.centerName || `Center ID: ${staff.centerId}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      {canEdit && (
        <StaffFormDialog
          open={isEditing}
          onOpenChange={setIsEditing}
          mode="edit"
          initialData={StaffUtils.dtoToFormData(staff)}
          onSubmit={handleEdit}
          title="Edit Staff Member"
          description={`Update ${staff.fullName}'s information and permissions.`}
        />
      )}

      {/* Delete Alert Dialog */}
      <AlertDialog open={deleteAlert} onOpenChange={setDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this staff member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="text-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Alert Dialog */}
      <AlertDialog open={toggleStatusAlert.open} onOpenChange={() => setToggleStatusAlert({ open: false, newStatus: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {toggleStatusAlert.newStatus ? 'activate' : 'deactivate'} this staff member?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setToggleStatusAlert({ open: false, newStatus: false })}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus} className={toggleStatusAlert.newStatus ? 'text-green-600' : 'text-red-600'}>
              {toggleStatusAlert.newStatus ? 'Activate' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StaffProfileSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-20" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Skeleton */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-5 w-28 mx-auto" />
            </div>
          </CardHeader>
        </Card>

        {/* Contact Information Skeleton */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-5 w-5" />
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Information Skeleton */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-5 w-5" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}