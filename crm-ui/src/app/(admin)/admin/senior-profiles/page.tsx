"use client"

import type React from "react"
import { useState } from "react"
import {
  Search,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  Edit,
  Trash2,
  Loader2,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import our backend integration with pagination
import { SeniorDto, SeniorFilterDto } from "@/types/senior"
import { useSeniorsPaginated, useSeniorForm, useLoadingStates } from "@/hooks/use-seniors"
import { seniorUtils } from "@/services/senior-api"
import { SeniorRequestsModal } from "@/components/senior-requests-modal"
import InitialsAvatar from "@/components/initials-avatar"

export default function SeniorProfilesPage() {
  // Backend integration hooks with pagination
  const {
    seniors,
    paginationInfo,
    loading: seniorsLoading,
    error: seniorsError,
    createSenior,
    updateSenior,
    deleteSenior,
    goToPage,
    changePageSize,
    applyFilter,
    clearFilter,
    applySorting,
    currentFilter
  } = useSeniorsPaginated({
    page: 0,
    size: 20,
    sort: ["lastName,asc", "firstName,asc"]
  });

  const { setLoading, isLoading } = useLoadingStates();

  // UI state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSenior, setEditingSenior] = useState<SeniorDto | null>(null);
  const [deletingSenior, setDeletingSenior] = useState<SeniorDto | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  
  // State for senior requests modal
  const [selectedSeniorForRequests, setSelectedSeniorForRequests] = useState<SeniorDto | null>(null);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);

  // Local filter state (before applying to backend)
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localAgeFilter, setLocalAgeFilter] = useState<string>("all");

  // Form hooks
  const createForm = useSeniorForm();
  const editForm = useSeniorForm();

  // Function to open requests modal for a senior
  const handleViewRequests = (senior: SeniorDto) => {
    setSelectedSeniorForRequests(senior);
    setIsRequestsModalOpen(true);
  };

  // Function to close requests modal
  const handleCloseRequestsModal = () => {
    setIsRequestsModalOpen(false);
    setSelectedSeniorForRequests(null);
  };

  // Apply filters to backend
  const handleApplyFilters = () => {
    const filter: SeniorFilterDto = {};
    
    if (localSearchTerm.trim()) {
      if (localSearchTerm.includes('@')) {
        filter.contactEmail = localSearchTerm.trim();
      } else if (/^\d/.test(localSearchTerm)) {
        filter.contactPhone = localSearchTerm.trim();
      } else {
        const nameParts = localSearchTerm.trim().split(' ');
        if (nameParts.length >= 2) {
          filter.firstName = nameParts[0];
          filter.lastName = nameParts.slice(1).join(' ');
        } else {
          filter.firstName = nameParts[0];
        }
      }
    }

    // Age filter converted to date ranges
    if (localAgeFilter !== "all") {
      const today = new Date();
      const currentYear = today.getFullYear();
      
      switch (localAgeFilter) {
        case "under-60":
          filter.minDateOfBirth = `${currentYear - 59}-01-01`;
          break;
        case "60-69":
          filter.minDateOfBirth = `${currentYear - 69}-01-01`;
          filter.maxDateOfBirth = `${currentYear - 60}-12-31`;
          break;
        case "70-79":
          filter.minDateOfBirth = `${currentYear - 79}-01-01`;
          filter.maxDateOfBirth = `${currentYear - 70}-12-31`;
          break;
        case "80-plus":
          filter.maxDateOfBirth = `${currentYear - 80}-12-31`;
          break;
      }
    }

    applyFilter(filter);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setLocalSearchTerm("");
    setLocalAgeFilter("all");
    clearFilter();
  };

  // Handle create senior
  const handleCreateSenior = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.isValid) return;

    setLoading('create', true);
    const result = await createSenior(createForm.toCreateDto());
    setLoading('create', false);

    if (result) {
      createForm.reset();
      setIsCreateDialogOpen(false);
    }
  };

  // Handle edit senior
  const handleEditSenior = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.isValid || !editingSenior) return;

    setLoading('update', true);
    const result = await updateSenior(editForm.toUpdateDto(editingSenior.id));
    setLoading('update', false);

    if (result) {
      setEditingSenior(null);
      editForm.reset();
    }
  };

  // Handle delete senior
  const handleDeleteSenior = async () => {
    if (!deletingSenior) return;

    setLoading('delete', true);
    const success = await deleteSenior(deletingSenior.id, seniorUtils.getFullName(deletingSenior));
    setLoading('delete', false);

    if (success) {
      setDeletingSenior(null);
    }
  };

  // Start editing a senior
  const startEdit = (senior: SeniorDto) => {
    setEditingSenior(senior);
    editForm.reset(seniorUtils.dtoToFormData(senior));
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingSenior(null);
    editForm.reset();
  };

  // Pagination component
  const PaginationControls = () => {
    if (!paginationInfo) return null;

    const { currentPage, totalPages, hasPrevious, hasNext, startItem, endItem, totalItems } = paginationInfo;

    return (
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={currentFilter.size?.toString() || "20"}
              onValueChange={(value) => changePageSize(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <div className="text-sm text-muted-foreground">
            {totalItems > 0 ? `Showing ${startItem}-${endItem} of ${totalItems} seniors` : 'No seniors found'}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => goToPage(0)}
            disabled={!hasPrevious || seniorsLoading}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => goToPage(currentPage - 2)} // Convert to 0-based
            disabled={!hasPrevious || seniorsLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => goToPage(currentPage)} // Convert to 0-based
            disabled={!hasNext || seniorsLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => goToPage(totalPages - 1)}
            disabled={!hasNext || seniorsLoading}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (seniorsLoading && seniors.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading seniors...</span>
        </div>
      </div>
    );
  }

  if (seniorsError) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800">Error Loading Seniors</h3>
              <p className="text-red-600 mt-2">{seniorsError.message}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Senior Profiles</h1>
          {paginationInfo && (
            <p className="text-sm text-muted-foreground mt-1">
              {paginationInfo.totalItems} total seniors
            </p>
          )}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-blue-700 hover:bg-blue-600">
              <PlusCircle className="mr-2 h-5 w-5"/>
              Create Senior Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Senior Profile</DialogTitle>
              <DialogDescription>
                Create a new profile for a senior member.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSenior} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-firstName">First Name *</Label>
                  <Input
                    id="create-firstName"
                    value={createForm.formData.firstName}
                    onChange={(e) => createForm.updateField('firstName', e.target.value)}
                    placeholder="John"
                    disabled={isLoading('create')}
                  />
                  {createForm.errors.firstName && createForm.touched.firstName && (
                    <p className="text-sm text-red-600">{createForm.errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-lastName">Last Name *</Label>
                  <Input
                    id="create-lastName"
                    value={createForm.formData.lastName}
                    onChange={(e) => createForm.updateField('lastName', e.target.value)}
                    placeholder="Doe"
                    disabled={isLoading('create')}
                  />
                  {createForm.errors.lastName && createForm.touched.lastName && (
                    <p className="text-sm text-red-600">{createForm.errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-dateOfBirth">Date of Birth</Label>
                <Input
                  id="create-dateOfBirth"
                  type="date"
                  value={createForm.formData.dateOfBirth}
                  onChange={(e) => createForm.updateField('dateOfBirth', e.target.value)}
                  disabled={isLoading('create')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-contactPhone">Phone Number</Label>
                <Input
                  id="create-contactPhone"
                  value={createForm.formData.contactPhone}
                  onChange={(e) => createForm.updateField('contactPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={isLoading('create')}
                />
                {createForm.errors.contactPhone && createForm.touched.contactPhone && (
                  <p className="text-sm text-red-600">{createForm.errors.contactPhone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-contactEmail">Email Address</Label>
                <Input
                  id="create-contactEmail"
                  type="email"
                  value={createForm.formData.contactEmail}
                  onChange={(e) => createForm.updateField('contactEmail', e.target.value)}
                  placeholder="john.doe@example.com"
                  disabled={isLoading('create')}
                />
                {createForm.errors.contactEmail && createForm.touched.contactEmail && (
                  <p className="text-sm text-red-600">{createForm.errors.contactEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-address">Address</Label>
                <Input
                  id="create-address"
                  value={createForm.formData.address}
                  onChange={(e) => createForm.updateField('address', e.target.value)}
                  placeholder="123 Main St, City, State"
                  disabled={isLoading('create')}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isLoading('create')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-700 hover:bg-blue-600"
                  disabled={!createForm.isValid || isLoading('create')}
                >
                  {isLoading('create') ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Profile'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Seniors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search by Name, Phone, or Email</Label>
              <Input
                id="search"
                placeholder="Search seniors..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Age Group</Label>
              <Select value={localAgeFilter} onValueChange={setLocalAgeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="under-60">Under 60</SelectItem>
                  <SelectItem value="60-69">60-69 years</SelectItem>
                  <SelectItem value="70-79">70-79 years</SelectItem>
                  <SelectItem value="80-plus">80+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
              <Button onClick={handleApplyFilters}>
                Search
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {paginationInfo ? (
                `Showing ${paginationInfo.startItem}-${paginationInfo.endItem} of ${paginationInfo.totalItems} seniors`
              ) : (
                'Loading...'
              )}
            </p>
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Sort by:</Label>
              <Select
                value={currentFilter.sort?.[0]?.split(',')[0] || 'lastName'}
                onValueChange={(value) => {
                  const direction = currentFilter.sort?.[0]?.split(',')[1] || 'asc';
                  applySorting(value, direction as 'asc' | 'desc');
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastName">Last Name</SelectItem>
                  <SelectItem value="firstName">First Name</SelectItem>
                  <SelectItem value="dateOfBirth">Age</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentSort = currentFilter.sort?.[0] || 'lastName,asc';
                  const [field, direction] = currentSort.split(',');
                  const newDirection = direction === 'asc' ? 'desc' : 'asc';
                  applySorting(field, newDirection);
                }}
              >
                {currentFilter.sort?.[0]?.includes('desc') ? '↓' : '↑'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle and Results */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "cards" | "table")}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="cards">Card View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          {seniorsLoading && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </div>
          )}
        </div>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {seniors.map((senior) => (
              <Card 
                key={senior.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex gap-3 pb-2">
                        <InitialsAvatar name={seniorUtils.getFullName(senior)}/>
                        <CardTitle className="text-lg">{seniorUtils.getFullName(senior)}</CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-base">
                        <Calendar className="h-4 w-4" />
                        {senior.dateOfBirth ? (
                          `Age ${seniorUtils.calculateAge(senior.dateOfBirth)} • ${seniorUtils.formatDate(senior.dateOfBirth)}`
                        ) : (
                          'Age unknown'
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(senior)}
                        disabled={isLoading('update') || isLoading('delete')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeletingSenior(senior)}
                        disabled={isLoading('update') || isLoading('delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {senior.contactPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{senior.contactPhone}</span>
                      </div>
                    )}
                    {senior.contactEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{senior.contactEmail}</span>
                      </div>
                    )}
                    {senior.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{senior.address}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Created: {seniorUtils.formatDateTime(senior.createdAt)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRequests(senior);
                      }}
                    >
                      View Requests
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Age</TableHead>
                  <TableHead className="font-bold">Contact</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">Address</TableHead>
                  <TableHead className="font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seniors.map((senior) => (
                  <TableRow key={senior.id}>
                    <TableCell className="font-medium">
                      {seniorUtils.getFullName(senior)}
                    </TableCell>
                    <TableCell>
                      {senior.dateOfBirth ? seniorUtils.calculateAge(senior.dateOfBirth) : 'N/A'}
                    </TableCell>
                    <TableCell>{senior.contactPhone || 'N/A'}</TableCell>
                    <TableCell>{senior.contactEmail || 'N/A'}</TableCell>
                    <TableCell>{senior.address || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(senior)}
                          disabled={isLoading('update') || isLoading('delete')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeletingSenior(senior)}
                          disabled={isLoading('update') || isLoading('delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination Controls */}
      <PaginationControls />

      {/* Empty State */}
      {seniors.length === 0 && !seniorsLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-2">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">No seniors found</h3>
              <p className="text-muted-foreground">
                {paginationInfo?.totalItems === 0
                  ? "Get started by adding your first senior profile."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingSenior} onOpenChange={(open) => !open && cancelEdit()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Senior Profile</DialogTitle>
            <DialogDescription>
              Update the information for {editingSenior && seniorUtils.getFullName(editingSenior)}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSenior} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input
                  id="edit-firstName"
                  value={editForm.formData.firstName}
                  onChange={(e) => editForm.updateField('firstName', e.target.value)}
                  disabled={isLoading('update')}
                />
                {editForm.errors.firstName && editForm.touched.firstName && (
                  <p className="text-sm text-red-600">{editForm.errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input
                  id="edit-lastName"
                  value={editForm.formData.lastName}
                  onChange={(e) => editForm.updateField('lastName', e.target.value)}
                  disabled={isLoading('update')}
                />
                {editForm.errors.lastName && editForm.touched.lastName && (
                  <p className="text-sm text-red-600">{editForm.errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
              <Input
                id="edit-dateOfBirth"
                type="date"
                value={editForm.formData.dateOfBirth}
                onChange={(e) => editForm.updateField('dateOfBirth', e.target.value)}
                disabled={isLoading('update')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contactPhone">Phone Number</Label>
              <Input
                id="edit-contactPhone"
                value={editForm.formData.contactPhone}
                onChange={(e) => editForm.updateField('contactPhone', e.target.value)}
                disabled={isLoading('update')}
              />
              {editForm.errors.contactPhone && editForm.touched.contactPhone && (
                <p className="text-sm text-red-600">{editForm.errors.contactPhone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contactEmail">Email Address</Label>
              <Input
                id="edit-contactEmail"
                type="email"
                value={editForm.formData.contactEmail}
                onChange={(e) => editForm.updateField('contactEmail', e.target.value)}
                disabled={isLoading('update')}
              />
              {editForm.errors.contactEmail && editForm.touched.contactEmail && (
                <p className="text-sm text-red-600">{editForm.errors.contactEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editForm.formData.address}
                onChange={(e) => editForm.updateField('address', e.target.value)}
                disabled={isLoading('update')}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={cancelEdit}
                disabled={isLoading('update')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!editForm.isValid || isLoading('update')}
              >
                {isLoading('update') ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSenior} onOpenChange={(open) => !open && setDeletingSenior(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Senior Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the profile for{' '}
              <strong>{deletingSenior && seniorUtils.getFullName(deletingSenior)}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading('delete')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSenior}
              disabled={isLoading('delete')}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading('delete') ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Profile'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Senior Requests Modal */}
      <SeniorRequestsModal
        senior={selectedSeniorForRequests}
        isOpen={isRequestsModalOpen}
        onClose={handleCloseRequestsModal}
      />
    </div>
  )
}