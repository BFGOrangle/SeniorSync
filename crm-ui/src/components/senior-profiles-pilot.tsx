"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"
import InitialsAvatar from "@/components/initials-avatar"
import { ErrorMessageCallout } from "@/components/error-message-callout"

export default function SeniorProfiles() {
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

  // Add these state variables to your component:
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<string[]>([]);
  const [selectedCareLevel, setSelectedCareLevel] = useState<string>("all");
  const [selectedCareLevelColor, setSelectedCareLevelColor] = useState<string>("all");

  // Form hooks
  const createForm = useSeniorForm();
  const editForm = useSeniorForm();

  const [characteristicsTags, setCharacteristicsTags] = useState<string[]>([]);
  const [currentCharacteristicInput, setCurrentCharacteristicInput] = useState("");

  const [editTags, setEditTags] = useState<string[]>([]);
  const [editInput, setEditInput] = useState("");

  const [characteristicInput, setCharacteristicInput] = useState<string>('');

  // Add these states at the top of your component:
  const [selectedSeniorForTags, setSelectedSeniorForTags] = useState<SeniorDto | null>(null);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);


  // useEffect(() => {
  //   if (createForm.formData.characteristics) {
  //     const tags = createForm.formData.characteristics
  //       .split(",")
  //       .map(tag => tag.trim())
  //       .filter(tag => tag.length > 0);
  //     setCharacteristicsTags(tags);
  //   }
  // }, []);

  const startEdit = (senior: SeniorDto) => {
    setEditingSenior(senior);
    editForm.reset(seniorUtils.dtoToFormData(senior));

    // Extract characteristics from the DTO array
    if (senior.characteristics && senior.characteristics.length > 0) {
      setEditTags([...senior.characteristics]);
    } else {
      setEditTags([]);
    }
    setEditInput("");
  };

  const handleCreateSenior = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.isValid) return;

    setLoading('create', true);
    // Pass the characteristics tags array to the conversion function
    const result = await createSenior(createForm.toCreateDto(characteristicsTags));
    setLoading('create', false);

    if (result) {
      createForm.reset();
      setCharacteristicsTags([]);
      setCurrentCharacteristicInput("");
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditSenior = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.isValid || !editingSenior) return;

    setLoading('update', true);
    // Pass the characteristics tags array to the conversion function
    const result = await updateSenior(editForm.toUpdateDto(editingSenior.id, editTags));
    setLoading('update', false);

    if (result) {
      setEditingSenior(null);
      editForm.reset();
      setEditTags([]);
      setEditInput("");
    }
  };

  // Add state for managing custom care levels
  const [customCareLevels, setCustomCareLevels] = useState<Array<{ name: string; color: string }>>([]);
  const [isAddingCustomCareLevel, setIsAddingCustomCareLevel] = useState(false);
  const [newCareLevelName, setNewCareLevelName] = useState("");
  const [newCareLevelColor, setNewCareLevelColor] = useState("#6b7280");

  useEffect(() => {
  if (isCreateDialogOpen) {
    createForm.updateField('firstName', 'SENIOR');
  }
}, [isCreateDialogOpen])

  useEffect(() => {
  const savedCareLevels = localStorage.getItem("customCareLevels");
  if (savedCareLevels) {
    try {
      setCustomCareLevels(JSON.parse(savedCareLevels));
    } catch (e) {
      console.error("Failed to parse custom care levels from localStorage", e);
    }
  }
}, []);


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
      // Add characteristics filter
    if (selectedCharacteristics.length > 0) {
      filter.characteristics = selectedCharacteristics;
    }
    
    // Add care level filter
    if (selectedCareLevel !== "all") {
      filter.careLevel = selectedCareLevel;
    } else {
      filter.careLevel = undefined;
    }
    
    // Add care level color filter (if needed)
    if (selectedCareLevelColor !== "all") {
      filter.careLevelColor = selectedCareLevelColor;
    }

      applyFilter(filter);
    };

  // (Removed unused uniqueCharacteristics variable)

  // Care levels
  const CARE_LEVEL = [
    { name: 'LOW', color: '#22c55e' },
    { name: 'MEDIUM', color: '#eab308' },
    { name: 'HIGH', color: '#f97316' },
    { name: 'CRITICAL', color: '#ef4444' },
    { name: 'INDEPENDENT', color: '#3b82f6' },
    { name: 'SUPERVISED', color: '#8b5cf6' }
  ];

  // Clear all filters
  const handleClearFilters = () => {
    setLocalSearchTerm("");
    setLocalAgeFilter("all");
    setSelectedCharacteristics([]);
    setCharacteristicInput(''); // Add this line
    setSelectedCareLevel("all");
    setSelectedCareLevelColor("all");
    clearFilter();
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

  // Cancel editing
  const cancelEdit = () => {
    setEditingSenior(null);
    editForm.reset();
  };

  const removeCharacteristic = (charToRemove: string) => {
    setSelectedCharacteristics(prev => prev.filter(char => char !== charToRemove));
  };

  // Function to add custom care level
  const addCustomCareLevel = () => {
    const trimmedName = newCareLevelName.trim().toUpperCase();

    const exists = CARE_LEVEL.some(level => level.name === trimmedName) ||
                  customCareLevels.some(level => level.name === trimmedName);

    if (trimmedName && !exists) {
      const newLevel = { name: trimmedName, color: newCareLevelColor };
      const updatedLevels = [...customCareLevels, newLevel];
      setCustomCareLevels(updatedLevels);
      localStorage.setItem("customCareLevels", JSON.stringify(updatedLevels));

      setNewCareLevelName("");
      setNewCareLevelColor("#6b7280");
      setIsAddingCustomCareLevel(false);

      createForm.updateField("careLevel", newLevel.name);
      createForm.updateField("careLevelColor", newLevel.color);
    }
  };


  // Combined care levels (default + custom)
  const allCareLevels = [...CARE_LEVEL, ...customCareLevels];

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
        <ErrorMessageCallout
          errorHeader="Senior Profiles Error"
          errorMessage="Failed to load senior profiles"
          errorCode={seniorsError.status}
          statusText={seniorsError.statusText}
          errors={seniorsError.errors}
        />
        <div className="flex justify-center mt-4">
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
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

        {/* Create Dialog - Make it scrollable */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-blue-700 hover:bg-blue-600">
              <PlusCircle className="mr-2 h-5 w-5"/>
              Create Senior Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
                    value="SENIOR"
                    onChange={(e) => createForm.updateField('firstName', e.target.value)}
                    placeholder="SENIOR"
                    disabled={true}
                  />
                  {createForm.errors.firstName && createForm.touched.firstName && (
                    <p className="text-sm text-red-600">{createForm.errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-lastName">Identifier Number *</Label>
                  <Input
                    id="create-lastName"
                    value={createForm.formData.lastName}
                    onChange={(e) => createForm.updateField('lastName', e.target.value)}
                    placeholder="123"
                    disabled={isLoading('create')}
                  />
                  {createForm.errors.lastName && createForm.touched.lastName && (
                    <p className="text-sm text-red-600">{createForm.errors.lastName}</p>
                  )}
                </div>
              </div>
              {/* Care Level - Enhanced Version */}
              <div className="space-y-3">
                <Label>Care Level</Label>
                
                {/* Existing Care Level Options */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Select from existing options:</div>
                  <div className="flex flex-wrap gap-2">
                    {allCareLevels.map(preset => (
                      <button
                        key={preset.name}
                        type="button"
                        className={`px-3 py-1 text-sm rounded-full text-white transition-all ${
                          createForm.formData.careLevel === preset.name 
                            ? 'ring-2 ring-offset-2 ring-gray-800 scale-105' 
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: preset.color }}
                        onClick={() => {
                          createForm.updateField('careLevel', preset.name);
                          createForm.updateField('careLevelColor', preset.color);
                        }}
                        disabled={isLoading('create')}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add New Care Level Section */}
                <div className="border-t pt-3">
                  {!isAddingCustomCareLevel ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingCustomCareLevel(true)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      disabled={isLoading('create')}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Custom Care Level
                    </Button>
                  ) : (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                      <div className="text-sm font-medium">Create New Care Level</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Level Name</Label>
                          <Input
                            value={newCareLevelName}
                            onChange={(e) => setNewCareLevelName(e.target.value)}
                            placeholder="e.g., MODERATE"
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={newCareLevelColor}
                              onChange={(e) => setNewCareLevelColor(e.target.value)}
                              className="w-12 h-8 p-1"
                            />
                            <Input
                              value={newCareLevelColor}
                              onChange={(e) => setNewCareLevelColor(e.target.value)}
                              placeholder="#6b7280"
                              className="flex-1 h-8"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Preview */}
                      {newCareLevelName.trim() && (
                        <div className="space-y-1">
                          <Label className="text-xs">Preview:</Label>
                          <div
                            className="inline-block px-3 py-1 text-sm rounded-full text-white"
                            style={{ backgroundColor: newCareLevelColor }}
                          >
                            {newCareLevelName.trim().toUpperCase()}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={addCustomCareLevel}
                          disabled={!newCareLevelName.trim()}
                          className="h-8"
                        >
                          Add Level
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsAddingCustomCareLevel(false);
                            setNewCareLevelName("");
                            setNewCareLevelColor("#6b7280");
                          }}
                          className="h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Manual Input Override */}
                {/* <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Or enter manually:</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Input
                        placeholder="Custom care level..."
                        value={createForm.formData.careLevel || ''}
                        onChange={(e) => createForm.updateField('careLevel', e.target.value)}
                        disabled={isLoading('create')}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={createForm.formData.careLevelColor || '#6b7280'}
                          onChange={(e) => createForm.updateField('careLevelColor', e.target.value)}
                          className="w-12"
                        />
                        <Input
                          value={createForm.formData.careLevelColor || '#6b7280'}
                          onChange={(e) => createForm.updateField('careLevelColor', e.target.value)}
                          placeholder="#6b7280"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Current Selection Display */}
                {createForm.formData.careLevel && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Current selection:</div>
                    <div
                      className="inline-block px-3 py-1 text-sm rounded-full text-white"
                      style={{ backgroundColor: createForm.formData.careLevelColor || '#6b7280' }}
                    >
                      {createForm.formData.careLevel}
                    </div>
                  </div>
                )}
              </div>

              {/* Characteristics - Tag Input */}
              <div className="space-y-2">
                <Label>Characteristics</Label>
                <div
                  className="w-full min-h-[40px] p-2 border rounded-md flex flex-wrap items-center gap-2 bg-white"
                  onClick={() => document.getElementById("characteristics-input")?.focus()}
                >
                  {characteristicsTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center px-2 h-6 text-[10px] leading-none rounded-sm border border-gray-300 bg-gray-100 text-gray-800"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-gray-500 hover:text-red-500"
                        onClick={() => {
                          const updated = characteristicsTags.filter((_, i) => i !== index);
                          setCharacteristicsTags(updated);
                          // createForm.updateField('characteristics', updated.join(', '));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <input
                    id="characteristics-input"
                    type="text"
                    className="inline-block w-auto min-w-[60px] flex-grow border-none outline-none text-[10px] leading-none"
                    value={currentCharacteristicInput}
                    onChange={(e) => setCurrentCharacteristicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === " " && currentCharacteristicInput.trim() !== "") {
                        e.preventDefault();
                        const newTag = currentCharacteristicInput.trim();
                        if (!characteristicsTags.includes(newTag)) {
                          const updated = [...characteristicsTags, newTag];
                          setCharacteristicsTags(updated);
                          // createForm.updateField('characteristics', updated.join(', '));
                        }
                        setCurrentCharacteristicInput("");
                      }
                      if (e.key === "Backspace" && currentCharacteristicInput === "") {
                        const updated = characteristicsTags.slice(0, -1);
                        setCharacteristicsTags(updated);
                        // createForm.updateField('characteristics', updated.join(', '));
                      }
                    }}
                    placeholder="Type and press space..."
                    disabled={isLoading('create')}
                  />
                </div>
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

            {/* // Add a multi-select component for characteristics */}
            <div className="space-y-2">
              <Label>Filter by Characteristics</Label>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Type characteristic and press Enter..."
                  value={characteristicInput}
                  onChange={(e) => setCharacteristicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && characteristicInput.trim()) {
                      e.preventDefault();
                      if (!selectedCharacteristics.includes(characteristicInput.trim())) {
                        setSelectedCharacteristics(prev => [...prev, characteristicInput.trim()]);
                      }
                      setCharacteristicInput('');
                    }
                  }}
                />
                
                {/* Display selected characteristics as removable tags */}
                <div className="flex flex-wrap gap-1">
                  {selectedCharacteristics.map(char => (
                    <Badge key={char} variant="outline" className="cursor-pointer" 
                          onClick={() => removeCharacteristic(char)}>
                      {char} ×
                    </Badge>
                  ))}
                </div>
                
                {selectedCharacteristics.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Will search for seniors with characteristics containing any of these terms
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filter by Care Level</Label>
              <Select value={selectedCareLevel} onValueChange={setSelectedCareLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Care Levels</SelectItem>
                  {allCareLevels.map(level => (
                    <SelectItem key={level.name} value={level.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: level.color }}
                        />
                        {level.name}
                      </div>
                    </SelectItem>
                  ))}
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
                className={`hover:shadow-lg transition-shadow cursor-pointer`}
                style={{ 
                  backgroundColor: senior.careLevelColor || '#ffffff',
                  // Add semi-transparency to keep text readable
                  background: `linear-gradient(135deg, ${senior.careLevelColor || '#ffffff'}20, ${senior.careLevelColor || '#ffffff'}40)`
                }}
                onClick={() => handleViewRequests(senior)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex gap-3 pb-2">
                        <InitialsAvatar name={seniorUtils.getFullName(senior)}/>
                        <CardTitle className="text-lg">{seniorUtils.getFullName(senior)}</CardTitle>
                      </div>
                        <CardDescription className="flex items-center gap-2 text-base">
                          {senior.dateOfBirth && (
                            <>
                              <Calendar className="h-4 w-4" />
                              {`Age ${seniorUtils.calculateAge(senior.dateOfBirth)} • ${seniorUtils.formatDate(senior.dateOfBirth)}`}
                            </>
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

                  {senior.characteristics && senior.characteristics.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Characteristics</div>
                      <div className="flex flex-wrap gap-1">
                        {senior.characteristics.slice(0, 3).map((characteristic, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border"
                          >
                            {characteristic}
                          </span>
                        ))}
                        {senior.characteristics.length > 3 && (
                          <button
                            className="text-xs text-blue-600 hover:text-blue-700 underline"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              setSelectedSeniorForTags(senior);
                              setIsTagsModalOpen(true);
                            }}
                          >
                            +{senior.characteristics.length - 3} more
                          </button>
                        )}
                      </div>
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
                  <TableHead className="font-bold">Care Level</TableHead>
                  <TableHead className="font-bold">Characteristics</TableHead>
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
                    <TableCell>
                      {senior.careLevel ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: senior.careLevelColor || '#6b7280' }}
                          />
                          <span className="text-sm">{senior.careLevel}</span>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {senior.characteristics && senior.characteristics.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {senior.characteristics.slice(0, 2).map((characteristic, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border"
                            >
                              {characteristic}
                            </span>
                          ))}
                          {senior.characteristics.length > 2 && (
                            <button
                              className="text-xs text-blue-600 hover:text-blue-700 underline"
                              onClick={() => {
                                setSelectedSeniorForTags(senior);
                                setIsTagsModalOpen(true);
                              }}
                            >
                              +{senior.characteristics.length - 2} more
                            </button>
                          )}
                        </div>
                      ) : (
                        'None'
                      )}
                    </TableCell>
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

      <Dialog open={isTagsModalOpen} onOpenChange={setIsTagsModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              All Characteristics - {selectedSeniorForTags && seniorUtils.getFullName(selectedSeniorForTags)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {selectedSeniorForTags?.characteristics?.map((characteristic, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-2 text-sm rounded-full bg-gray-100 text-gray-700 border"
                >
                  {characteristic}
                </span>
              ))}
            </div>
            {selectedSeniorForTags?.characteristics?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No characteristics defined for this senior.
              </p>
            )}
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsTagsModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Make it scrollable */}
      <Dialog open={!!editingSenior} onOpenChange={(open) => !open && cancelEdit()}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
                  disabled={true}
                />
                {editForm.errors.firstName && editForm.touched.firstName && (
                  <p className="text-sm text-red-600">{editForm.errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Senior Identifier *</Label>
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

            <div className="space-y-3">
              <Label>Care Level</Label>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Select from existing options:</div>
                <div className="flex flex-wrap gap-2">
                  {allCareLevels.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      className={`px-3 py-1 text-sm rounded-full text-white transition-all ${
                        editForm.formData.careLevel === preset.name 
                          ? 'ring-2 ring-offset-2 ring-gray-800 scale-105' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      onClick={() => {
                        editForm.updateField('careLevel', preset.name);
                        editForm.updateField('careLevelColor', preset.color);
                      }}
                      disabled={isLoading('update')}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {editForm.formData.careLevel && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Current selection:</div>
                  <div
                    className="inline-block px-3 py-1 text-sm rounded-full text-white"
                    style={{ backgroundColor: editForm.formData.careLevelColor || '#6b7280' }}
                  >
                    {editForm.formData.careLevel}
                  </div>
                </div>
              )}
            </div>


            <div className="space-y-2">
              <Label>Characteristics</Label>
              <div
                className="w-full min-h-[40px] p-2 border rounded-md flex flex-wrap items-center gap-2 bg-white"
                onClick={() => document.getElementById("edit-characteristics-input")?.focus()}
              >
                {editTags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center px-2 h-6 text-[10px] leading-none rounded-sm border border-gray-300 bg-gray-100 text-gray-800"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-2 text-gray-500 hover:text-red-500"
                      onClick={() => {
                        const updated = editTags.filter((_, i) => i !== index);
                        setEditTags(updated);
                        editForm.updateField("characteristics", updated.join(", "));
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  id="edit-characteristics-input"
                  type="text"
                  className="inline-block w-auto min-w-[60px] flex-grow border-none outline-none text-[10px] leading-none"
                  value={editInput}
                  onChange={(e) => setEditInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === " " && editInput.trim() !== "") {
                      e.preventDefault();
                      const newTag = editInput.trim();
                      if (!editTags.includes(newTag)) {
                        const updated = [...editTags, newTag];
                        setEditTags(updated);
                        editForm.updateField("characteristics", updated.join(", "));
                      }
                      setEditInput("");
                    }
                    if (e.key === "Backspace" && editInput === "") {
                      const updated = editTags.slice(0, -1);
                      setEditTags(updated);
                      editForm.updateField("characteristics", updated.join(", "));
                    }
                  }}
                  placeholder="Type and press space..."
                  disabled={isLoading("update")}
                />
              </div>
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