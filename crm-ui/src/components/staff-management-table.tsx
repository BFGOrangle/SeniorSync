"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Shield,
  User
} from 'lucide-react';
import { useStaffManagement } from '@/hooks/use-staff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { StaffFormDialog } from './staff-form-dialog';
import { StaffDisplayView, StaffFilterOptions, StaffUtils, ROLE_TYPE_DISPLAY } from '@/types/staff';
import { cn } from '@/lib/utils';

interface StaffManagementTableProps {
  className?: string;
}

export function StaffManagementTable({ className }: StaffManagementTableProps) {
  const router = useRouter();
  const {
    staff,
    pagination,
    loading,
    error,
    lastUpdated,
    loadStaff,
    createStaff,
    updateStaff,
    toggleStaffStatus,
    deleteStaff,
    refresh,
    searchStaff,
    filterAndSortStaff,
  } = useStaffManagement();

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<StaffFilterOptions>({});
  const [sortBy, setSortBy] = useState<keyof StaffDisplayView>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffDisplayView | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffDisplayView | null>(null);
  const [toggleStatusStaff, setToggleStatusStaff] = useState<{
    staff: StaffDisplayView;
    newStatus: boolean;
  } | null>(null);

  // Filtered and sorted staff
  const filteredStaff = useMemo(() => {
    let result = staff;
    
    // Apply search
    if (searchTerm) {
      result = result.filter(member => {
        const searchLower = searchTerm.toLowerCase();
        return (
          member.fullName.toLowerCase().includes(searchLower) ||
          member.contactEmail.toLowerCase().includes(searchLower) ||
          member.jobTitle.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply filters
    result = StaffUtils.filterStaff(result, filters);
    
    // Apply sorting
    result = StaffUtils.sortStaff(result, sortBy, sortDirection);
    
    return result;
  }, [staff, searchTerm, filters, sortBy, sortDirection]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle sort
  const handleSort = (column: keyof StaffDisplayView) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof StaffFilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle create staff
  const handleCreateStaff = async (formData: any) => {
    const success = await createStaff(formData);
    if (success) {
      setShowCreateDialog(false);
    }
    return success;
  };

  // Handle edit staff
  const handleEditStaff = async (formData: any) => {
    if (!editingStaff) return false;
    
    const success = await updateStaff(editingStaff.id, formData);
    if (success) {
      setEditingStaff(null);
    }
    return success;
  };

  // Handle delete staff
  const handleDeleteStaff = async () => {
    if (!deletingStaff) return;
    
    const success = await deleteStaff(deletingStaff.id);
    if (success) {
      setDeletingStaff(null);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async () => {
    if (!toggleStatusStaff) return;
    
    const success = await toggleStaffStatus(
      toggleStatusStaff.staff.id,
      toggleStatusStaff.newStatus
    );
    if (success) {
      setToggleStatusStaff(null);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadStaff(page, pagination?.size || 20);
  };

  // Handle row click to navigate to staff profile
  const handleRowClick = (staffId: number, event: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons or dropdowns
    if ((event.target as HTMLElement).closest('button, [role="menuitem"]')) {
      return;
    }
    router.push(`/admin/staff/${staffId}`);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  // Get role badge variant
  const getRoleBadgeVariant = (roleType: string) => {
    return roleType === 'ADMIN' ? 'destructive' : 'outline';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage your center's staff members and their access permissions.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {staff.filter(s => s.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {staff.filter(s => !s.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {staff.filter(s => s.roleType === 'ADMIN').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
          <CardDescription>
            Use the filters below to find specific staff members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or job title..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <Select
              value={filters.roleType?.[0] || 'all'}
              onValueChange={(value) => 
                handleFilterChange('roleType', value === 'all' ? undefined : [value])
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Administrator</SelectItem>
                <SelectItem value="STAFF">Staff Member</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
              onValueChange={(value) => 
                handleFilterChange('isActive', value === 'all' ? undefined : value === 'true')
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilters({});
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>
                {filteredStaff.length} of {staff.length} staff members
                {lastUpdated && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    • Last updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]"></TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('fullName')}
                  >
                    Name
                    {sortBy === 'fullName' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('jobTitle')}
                  >
                    Job Title
                    {sortBy === 'jobTitle' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('roleType')}
                  >
                    Role
                    {sortBy === 'roleType' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('isActive')}
                  >
                    Status
                    {sortBy === 'isActive' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Loading staff members...</span>
                      </div>Job
                    </TableCell>
                  </TableRow>
                ) : filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="text-muted-foreground">
                        {searchTerm || Object.keys(filters).length > 0 
                          ? 'No staff members match your filters.'
                          : 'No staff members found.'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => (
                    <TableRow 
                      key={member.id} 
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={(e) => handleRowClick(member.id, e)}
                    >
                      <TableCell>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {StaffUtils.getInitials(member.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{member.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {member.id}
                        </div>
                      </TableCell>
                      <TableCell>{member.jobTitle}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.contactEmail}
                          </div>
                          {member.contactPhone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {member.contactPhone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.roleType)}>
                          {ROLE_TYPE_DISPLAY[member.roleType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(member.isActive)}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setEditingStaff(member)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setToggleStatusStaff({
                                staff: member,
                                newStatus: !member.isActive
                              })}
                            >
                              {member.isActive ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingStaff(member)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.numberOfElements} of {pagination.totalElements} staff members
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.first || loading}
                  onClick={() => handlePageChange(pagination.number - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = pagination.number - 2 + i;
                    if (pageNum < 0 || pageNum >= pagination.totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.number ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.last || loading}
                  onClick={() => handlePageChange(pagination.number + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Staff Dialog */}
      <StaffFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
        onSubmit={handleCreateStaff}
        title="Add New Staff Member"
        description="Create a new staff member account with appropriate permissions."
      />

      {/* Edit Staff Dialog */}
      {editingStaff && (
        <StaffFormDialog
          open={!!editingStaff}
          onOpenChange={(open) => !open && setEditingStaff(null)}
          mode="edit"
          initialData={StaffUtils.dtoToFormData(editingStaff)}
          onSubmit={handleEditStaff}
          title="Edit Staff Member"
          description={`Update ${editingStaff.fullName}'s information and permissions.`}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingStaff} onOpenChange={(open) => !open && setDeletingStaff(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingStaff?.fullName}? This action cannot be undone
              and will permanently remove their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStaff}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog 
        open={!!toggleStatusStaff} 
        onOpenChange={(open) => !open && setToggleStatusStaff(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleStatusStaff?.newStatus ? 'Activate' : 'Deactivate'} Staff Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {toggleStatusStaff?.newStatus ? 'activate' : 'deactivate'}{' '}
              {toggleStatusStaff?.staff.fullName}? This will {toggleStatusStaff?.newStatus ? 'grant' : 'revoke'} their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {toggleStatusStaff?.newStatus ? 'Activate' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}