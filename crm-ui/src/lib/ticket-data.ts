import { Ticket, Status } from "@/types/ticket";

// Updated mock data to match the senior request structure
export const mockTickets: Ticket[] = [
  {
    id: "TKT-001",
    seniorName: "Margaret Thompson",
    phoneNumber: "+1 (555) 123-4567",
    email: "margaret@example.com",
    address: "123 Oak Street, Apt 4B, Springfield, IL 62701",
    emergencyContact: "Robert Thompson",
    emergencyPhone: "+1 (555) 987-6543",
    requestType: "Medical Assistance",
    priority: "high",
    description:
      "Need assistance with daily medication management and doctor appointment transportation.",
    preferredDate: "2024-01-15",
    preferredTime: "09:00",
    medicalConditions: "Diabetes, Hypertension",
    medications: "Metformin 500mg twice daily, Lisinopril 10mg daily",
    mobilityAssistance: true,
    agentName: "Sarah Johnson",
    agentId: "AGT001",
    createdAt: "2024-01-10T08:30:00Z",
    status: "pending",
    dueDate: new Date("2024-01-15"),
    // Legacy compatibility
    title: "Medical Assistance for Margaret Thompson",
    assignee: "Sarah Johnson",
    createdDate: new Date("2024-01-10T08:30:00Z"),
  },
  {
    id: "TKT-002",
    seniorName: "Harold Chen",
    phoneNumber: "+1 (555) 234-5678",
    email: "harold.chen@email.com",
    address: "456 Pine Avenue, Unit 12, Springfield, IL 62702",
    emergencyContact: "Linda Chen",
    emergencyPhone: "+1 (555) 876-5432",
    requestType: "Transportation",
    priority: "medium",
    description:
      "Weekly grocery shopping assistance and transportation to senior center activities.",
    preferredDate: "2024-01-12",
    preferredTime: "14:00",
    medicalConditions: "",
    medications: "",
    mobilityAssistance: false,
    agentName: "Michael Chen",
    agentId: "AGT002",
    createdAt: "2024-01-08T10:15:00Z",
    status: "in-progress",
    dueDate: new Date("2024-01-12"),
    // Legacy compatibility
    title: "Transportation for Harold Chen",
    assignee: "Michael Chen",
    createdDate: new Date("2024-01-08T10:15:00Z"),
  },
  {
    id: "TKT-003",
    seniorName: "Dorothy Williams",
    phoneNumber: "+1 (555) 345-6789",
    email: "dorothy.williams@email.com",
    address: "789 Elm Drive, Springfield, IL 62703",
    emergencyContact: "James Williams",
    emergencyPhone: "+1 (555) 765-4321",
    requestType: "Home Care",
    priority: "urgent",
    description:
      "Emergency home cleaning and meal preparation following recent hospitalization.",
    medicalConditions: "Recent hip surgery, limited mobility",
    medications: "Pain medication as prescribed",
    mobilityAssistance: true,
    agentName: "Emily Rodriguez",
    agentId: "AGT003",
    createdAt: "2024-01-09T16:45:00Z",
    status: "in-review",
    dueDate: new Date("2026-01-11"),
    // Legacy compatibility
    title: "Home Care for Dorothy Williams",
    assignee: "Emily Rodriguez",
    createdDate: new Date("2024-01-09T16:45:00Z"),
  },
];

export const statusColumns: { id: Status; title: string; color: string }[] = [
  { id: "pending", title: "Pending", color: "bg-slate-100" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-100" },
  { id: "in-review", title: "In Review", color: "bg-yellow-100" },
  { id: "completed", title: "Completed", color: "bg-green-100" },
  { id: "cancelled", title: "Cancelled", color: "bg-red-100" },
];

export const assignees = [
  "Sarah Johnson",
  "Michael Chen",
  "Emily Rodriguez",
  "David Kim",
  "Lisa Wang",
  "Robert Martinez",
];
