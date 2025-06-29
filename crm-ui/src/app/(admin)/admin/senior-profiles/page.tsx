"use client"

import type React from "react"
import { useState, useMemo } from "react"

import {
  Plus,
  Search,
  Calendar,
  Phone,
  Heart,
  Activity,
  Users,
  ShipWheelIcon as Wheelchair,
  Brain,
  Eye,
  Ear,
  Upload,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Client {
  id: string
  fullName: string
  dateOfBirth: string
  gender: string
  contactNumber: string
  emergencyContactName: string
  emergencyContactPhone: string
  medicalConditions: string[]
  preferredActivities: string[]
  specialNeeds: string[]
  joinedDate: Date
}

const AVAILABLE_ACTIVITIES = [
  "Tai Chi",
  "Art Therapy",
  "Water Aerobics",
  "Chair Yoga",
  "Music Therapy",
  "Gardening",
  "Dancing",
  "Walking Group",
  "Card Games",
  "Book Club",
  "Cooking Classes",
  "Computer Classes",
  "Crafts",
  "Meditation",
  "Strength Training",
]

const COMMON_CONDITIONS = [
  "Arthritis",
  "Diabetes",
  "Hypertension",
  "Heart Disease",
  "Osteoporosis",
  "Dementia",
  "Parkinson's",
  "Vision Impairment",
  "Hearing Impairment",
  "Mobility Issues",
]

const SPECIAL_NEEDS = [
  "Wheelchair Access",
  "Dementia Care",
  "Vision Support",
  "Hearing Support",
  "Mobility Assistance",
  "Medication Reminders",
]

const initialClients: Client[] = [
  {
    id: "1",
    fullName: "Margaret Thompson",
    dateOfBirth: "1945-03-15",
    gender: "Female",
    contactNumber: "(555) 123-4567",
    emergencyContactName: "Sarah Thompson (Daughter)",
    emergencyContactPhone: "(555) 987-6543",
    medicalConditions: ["Arthritis", "Hypertension"],
    preferredActivities: ["Tai Chi", "Art Therapy", "Book Club"],
    specialNeeds: [],
    joinedDate: new Date("2024-01-15"),
  },
  {
    id: "2",
    fullName: "Robert Chen",
    dateOfBirth: "1938-07-22",
    gender: "Male",
    contactNumber: "(555) 234-5678",
    emergencyContactName: "Michael Chen (Son)",
    emergencyContactPhone: "(555) 876-5432",
    medicalConditions: ["Diabetes", "Vision Impairment"],
    preferredActivities: ["Chair Yoga", "Music Therapy", "Card Games"],
    specialNeeds: ["Vision Support"],
    joinedDate: new Date("2024-02-01"),
  },
  {
    id: "3",
    fullName: "Dorothy Williams",
    dateOfBirth: "1942-11-08",
    gender: "Female",
    contactNumber: "(555) 345-6789",
    emergencyContactName: "James Williams (Husband)",
    emergencyContactPhone: "(555) 765-4321",
    medicalConditions: ["Osteoporosis"],
    preferredActivities: ["Water Aerobics", "Dancing", "Gardening"],
    specialNeeds: [],
    joinedDate: new Date("2024-01-20"),
  },
  {
    id: "4",
    fullName: "Frank Rodriguez",
    dateOfBirth: "1935-05-12",
    gender: "Male",
    contactNumber: "(555) 456-7890",
    emergencyContactName: "Maria Rodriguez (Wife)",
    emergencyContactPhone: "(555) 654-3210",
    medicalConditions: ["Parkinson's", "Hearing Impairment"],
    preferredActivities: ["Crafts", "Meditation", "Walking Group"],
    specialNeeds: ["Mobility Assistance", "Hearing Support"],
    joinedDate: new Date("2024-03-05"),
  },
]

const DUMMY_IMPORT_DATA: Omit<Client, "id" | "joinedDate">[] = [
  {
    fullName: "Eleanor Martinez",
    dateOfBirth: "1940-09-14",
    gender: "Female",
    contactNumber: "(555) 111-2222",
    emergencyContactName: "Carlos Martinez (Son)",
    emergencyContactPhone: "(555) 333-4444",
    medicalConditions: ["Arthritis", "Diabetes"],
    preferredActivities: ["Chair Yoga", "Music Therapy", "Crafts"],
    specialNeeds: ["Mobility Assistance"],
  },
  {
    fullName: "George Patterson",
    dateOfBirth: "1943-12-03",
    gender: "Male",
    contactNumber: "(555) 555-6666",
    emergencyContactName: "Linda Patterson (Wife)",
    emergencyContactPhone: "(555) 777-8888",
    medicalConditions: ["Hypertension", "Heart Disease"],
    preferredActivities: ["Walking Group", "Card Games", "Book Club"],
    specialNeeds: [],
  },
  {
    fullName: "Betty Lou Johnson",
    dateOfBirth: "1936-04-18",
    gender: "Female",
    contactNumber: "(555) 999-0000",
    emergencyContactName: "Robert Johnson (Nephew)",
    emergencyContactPhone: "(555) 111-3333",
    medicalConditions: ["Dementia", "Osteoporosis"],
    preferredActivities: ["Art Therapy", "Music Therapy", "Meditation"],
    specialNeeds: ["Dementia Care", "Medication Reminders"],
  },
  {
    fullName: "Arthur Kim",
    dateOfBirth: "1941-08-25",
    gender: "Male",
    contactNumber: "(555) 222-4444",
    emergencyContactName: "Susan Kim (Daughter)",
    emergencyContactPhone: "(555) 666-7777",
    medicalConditions: ["Vision Impairment", "Arthritis"],
    preferredActivities: ["Tai Chi", "Meditation", "Computer Classes"],
    specialNeeds: ["Vision Support"],
  },
  {
    fullName: "Rose O'Connor",
    dateOfBirth: "1939-01-30",
    gender: "Female",
    contactNumber: "(555) 888-9999",
    emergencyContactName: "Patrick O'Connor (Son)",
    emergencyContactPhone: "(555) 000-1111",
    medicalConditions: ["Hearing Impairment"],
    preferredActivities: ["Dancing", "Gardening", "Cooking Classes"],
    specialNeeds: ["Hearing Support"],
  },
]

export default function ClientsPage() { const [clients, setClients] = useState<Client[]>(initialClients)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all")
  const [selectedActivity, setSelectedActivity] = useState<string>("all")
  const [selectedCondition, setSelectedCondition] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    contactNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    medicalConditions: [] as string[],
    preferredActivities: [] as string[],
    specialNeeds: [] as string[],
  })

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Get age group for a client
  const getAgeGroup = (dateOfBirth: string): string => {
    const age = calculateAge(dateOfBirth)
    if (age < 60) return "Under 60"
    if (age < 70) return "60-69"
    if (age < 80) return "70-79"
    return "80+"
  }

  // Filter clients based on search and filters
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || client.contactNumber.includes(searchTerm)

      const matchesAgeGroup = selectedAgeGroup === "all" || getAgeGroup(client.dateOfBirth) === selectedAgeGroup

      const matchesActivity = selectedActivity === "all" || client.preferredActivities.includes(selectedActivity)

      const matchesCondition = selectedCondition === "all" || client.medicalConditions.includes(selectedCondition)

      return matchesSearch && matchesAgeGroup && matchesActivity && matchesCondition
    })
  }, [clients, searchTerm, selectedAgeGroup, selectedActivity, selectedCondition])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newClient: Client = {
      id: Date.now().toString(),
      ...formData,
      joinedDate: new Date(),
    }

    setClients((prev) => [newClient, ...prev])
    setFormData({
      fullName: "",
      dateOfBirth: "",
      gender: "",
      contactNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalConditions: [],
      preferredActivities: [],
      specialNeeds: [],
    })
    setIsDialogOpen(false)
  }

  const handleCheckboxChange = (
    field: "medicalConditions" | "preferredActivities" | "specialNeeds",
    value: string,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? [...prev[field], value] : prev[field].filter((item) => item !== value),
    }))
  }

  const getSpecialNeedsIcon = (need: string) => {
    switch (need) {
      case "Wheelchair Access":
        return <Wheelchair className="h-4 w-4" />
      case "Dementia Care":
        return <Brain className="h-4 w-4" />
      case "Vision Support":
        return <Eye className="h-4 w-4" />
      case "Hearing Support":
        return <Ear className="h-4 w-4" />
      default:
        return <Heart className="h-4 w-4" />
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedAgeGroup("all")
    setSelectedActivity("all")
    setSelectedCondition("all")
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsImporting(true)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Add dummy data as if imported from CSV
    const newClients: Client[] = DUMMY_IMPORT_DATA.map((clientData, index) => ({
      ...clientData,
      id: (Date.now() + index).toString(),
      joinedDate: new Date(),
    }))

    setClients((prev) => [...newClients, ...prev])
    setIsImporting(false)
    setIsImportDialogOpen(false)
    setSelectedFile(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Active Aging Center</h1>
          <p className="text-lg text-muted-foreground">Client Profile Management</p>
        </div>

        <div className="flex gap-3">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                <Upload className="mr-2 h-5 w-5" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Import Client Profiles</DialogTitle>
                <DialogDescription>Upload a CSV file to import multiple client profiles at once.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload CSV File</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        selectedFile
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                      onDrop={(e) => {
                        e.preventDefault()
                        const file = e.dataTransfer.files[0]
                        if (file && file.type === "text/csv") {
                          setSelectedFile(file)
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={(e) => e.preventDefault()}
                    >
                      <div className="space-y-4">
                        {selectedFile ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Upload className="h-6 w-6 text-green-600" />
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-green-700">{selectedFile.name}</p>
                              <p className="text-sm text-green-600">
                                {(selectedFile.size / 1024).toFixed(1)} KB • Ready to import
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedFile(null)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              Remove file
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-center">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Upload className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <div>
                              <p className="text-lg font-medium text-gray-700">Drag and drop your CSV file here</p>
                              <p className="text-sm text-gray-500">or click to browse files</p>
                            </div>
                            <div>
                              <Input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="csvFileInput"
                              />
                              <Label
                                htmlFor="csvFileInput"
                                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Choose File
                              </Label>
                            </div>
                            <p className="text-xs text-gray-400">Supports CSV files up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsImportDialogOpen(false)
                      setSelectedFile(null)
                    }}
                    disabled={isImporting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={!selectedFile || isImporting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Profiles
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-5 w-5" />
                Add New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Client Profile</DialogTitle>
                <DialogDescription>Create a comprehensive profile for a new center member.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Margaret Thompson"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number *</Label>
                      <Input
                        id="contactNumber"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData((prev) => ({ ...prev, contactNumber: e.target.value }))}
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactName: e.target.value }))}
                        placeholder="Sarah Thompson (Daughter)"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))}
                        placeholder="(555) 987-6543"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Conditions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Medical Conditions (Optional)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_CONDITIONS.map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={`condition-${condition}`}
                          checked={formData.medicalConditions.includes(condition)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("medicalConditions", condition, checked as boolean)
                          }
                        />
                        <Label htmlFor={`condition-${condition}`} className="text-sm">
                          {condition}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preferred Activities */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Preferred Activities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_ACTIVITIES.map((activity) => (
                      <div key={activity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`activity-${activity}`}
                          checked={formData.preferredActivities.includes(activity)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("preferredActivities", activity, checked as boolean)
                          }
                        />
                        <Label htmlFor={`activity-${activity}`} className="text-sm">
                          {activity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Needs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Special Needs</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {SPECIAL_NEEDS.map((need) => (
                      <div key={need} className="flex items-center space-x-2">
                        <Checkbox
                          id={`need-${need}`}
                          checked={formData.specialNeeds.includes(need)}
                          onCheckedChange={(checked) => handleCheckboxChange("specialNeeds", need, checked as boolean)}
                        />
                        <Label htmlFor={`need-${need}`} className="text-sm">
                          {need}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Create Profile
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Clients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Search by Name or Phone</Label>
            <Input
              id="search"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Age Group</Label>
              <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="Under 60">Under 60</SelectItem>
                  <SelectItem value="60-69">60-69 years</SelectItem>
                  <SelectItem value="70-79">70-79 years</SelectItem>
                  <SelectItem value="80+">80+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Activity</Label>
              <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  {AVAILABLE_ACTIVITIES.map((activity) => (
                    <SelectItem key={activity} value={activity}>
                      {activity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Medical Condition</Label>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {COMMON_CONDITIONS.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
            <p className="text-sm text-muted-foreground">
              Showing {filteredClients.length} of {clients.length} clients
            </p>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle and Results */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "cards" | "table")}>
        <TabsList>
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{client.fullName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 text-base">
                        <Calendar className="h-4 w-4" />
                        Age {calculateAge(client.dateOfBirth)} • {client.gender}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{client.contactNumber}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Emergency:</span> {client.emergencyContactName}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Preferred Activities
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {client.preferredActivities.slice(0, 3).map((activity) => (
                        <Badge key={activity} variant="secondary" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                      {client.preferredActivities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{client.preferredActivities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {client.medicalConditions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Medical Conditions
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {client.medicalConditions.slice(0, 2).map((condition) => (
                          <Badge key={condition} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                        {client.medicalConditions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{client.medicalConditions.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {client.specialNeeds.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Special Needs</p>
                      <div className="flex flex-wrap gap-2">
                        {client.specialNeeds.map((need) => (
                          <div
                            key={need}
                            className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                          >
                            {getSpecialNeedsIcon(need)}
                            <span>{need}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">Joined {client.joinedDate.toLocaleDateString()}</div>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Emergency Contact</TableHead>
                  <TableHead>Preferred Activities</TableHead>
                  <TableHead>Special Needs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{client.fullName}</div>
                        <div className="text-sm text-muted-foreground">{client.gender}</div>
                      </div>
                    </TableCell>
                    <TableCell>{calculateAge(client.dateOfBirth)}</TableCell>
                    <TableCell>{client.contactNumber}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{client.emergencyContactName}</div>
                        <div className="text-muted-foreground">{client.emergencyContactPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {client.preferredActivities.slice(0, 2).map((activity) => (
                          <Badge key={activity} variant="secondary" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                        {client.preferredActivities.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{client.preferredActivities.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {client.specialNeeds.map((need) => (
                          <div key={need} className="flex items-center gap-1">
                            {getSpecialNeedsIcon(need)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-2">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">No clients found</h3>
              <p className="text-muted-foreground">
                {clients.length === 0
                  ? "Get started by adding your first client profile."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}