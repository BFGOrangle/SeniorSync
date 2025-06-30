import { Ticket, FilterOptions, SortOption } from "@/types/ticket";

export function filterTickets(
  tickets: Ticket[],
  filters: FilterOptions
): Ticket[] {
  return tickets.filter((ticket) => {
    // Priority filter
    if (
      filters.priority &&
      filters.priority.length > 0 &&
      !filters.priority.includes(ticket.priority)
    ) {
      return false;
    }

    // Status filter
    if (
      filters.status &&
      filters.status.length > 0 &&
      !filters.status.includes(ticket.status)
    ) {
      return false;
    }

    // Request type filter
    if (
      filters.requestType &&
      filters.requestType.length > 0 &&
      !filters.requestType.includes(ticket.requestType)
    ) {
      return false;
    }

    // Agent filter
    if (
      filters.agentId &&
      filters.agentId.length > 0 &&
      !filters.agentId.includes(ticket.agentId)
    ) {
      return false;
    }

    // Assignee filter (legacy compatibility)
    if (
      filters.assignee &&
      filters.assignee.length > 0 &&
      !filters.assignee.includes(ticket.agentName)
    ) {
      return false;
    }

    // Search filter (searches across multiple fields)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        ticket.seniorName,
        ticket.description,
        ticket.requestType,
        ticket.agentName,
        ticket.phoneNumber,
        ticket.address,
        ticket.emergencyContact,
        ticket.title, // legacy compatibility
      ].filter(Boolean);

      const matchesSearch = searchableFields.some((field) =>
        field!.toLowerCase().includes(searchTerm)
      );

      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });
}

export function sortTickets(tickets: Ticket[], sort: SortOption): Ticket[] {
  return [...tickets].sort((a, b) => {
    const aValue = a[sort.field];
    const bValue = b[sort.field];

    // Handle date sorting
    if (
      sort.field === "createdAt" ||
      sort.field === "createdDate" ||
      sort.field === "dueDate"
    ) {
      const aDate = new Date(aValue as string | Date);
      const bDate = new Date(bValue as string | Date);
      return sort.direction === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    // Handle string sorting
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sort.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Handle other types, including undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sort.direction === "asc" ? 1 : -1;
    if (bValue === undefined) return sort.direction === "asc" ? -1 : 1;
    if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
    return 0;
  });
}

export function getPriorityColor(priority: Ticket["priority"]): string {
  switch (priority) {
    case "low":
      return "text-green-600 bg-green-50 border-green-200";
    case "medium":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "high":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "urgent":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getStatusColor(status: Ticket["status"]): string {
  switch (status) {
    case "pending":
      return "text-slate-600 bg-slate-50 border-slate-200";
    case "in-progress":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "in-review":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "completed":
      return "text-green-600 bg-green-50 border-green-200";
    case "cancelled":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return "No date";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isOverdue(date: Date | string | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return false;
  return d < new Date();
}
