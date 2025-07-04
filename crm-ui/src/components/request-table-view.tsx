import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowUpDown, Clock, Phone } from "lucide-react";
import { SeniorRequestDisplayView } from "@/types/request";
import { RequestModal } from "@/components/request-modal";
import { cn } from "@/lib/utils";

interface RequestTableViewProps {
  requests: SeniorRequestDisplayView[];
  onRequestUpdate: (request: SeniorRequestDisplayView) => void;
}

export function RequestTableView({ requests, onRequestUpdate }: RequestTableViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedRequest, setSelectedRequest] = useState<SeniorRequestDisplayView | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getPriorityColor = (priority: string): string => {
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
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "in-progress":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (date: string | undefined): string => {
    if (!date) return "No date";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const columns: ColumnDef<SeniorRequestDisplayView>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent font-semibold text-gray-900"
        >
          Request ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const request = row.original;
        return (
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedRequest(request);
              setIsModalOpen(true);
            }}
            className="h-auto p-0 font-mono text-blue-600 hover:text-blue-800 hover:bg-transparent underline"
          >
            {request.id}
          </Button>
        );
      },
    },
    {
      accessorKey: "seniorName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent font-semibold text-gray-900"
        >
          Senior
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                {getInitials(request.seniorName || "N/A")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {request.seniorName || "N/A"}
              </span>
              {request.seniorPhone && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone className="h-3 w-3" />
                  {request.seniorPhone}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent font-semibold text-gray-900"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="max-w-[200px]">
            <div className="font-medium text-gray-900 truncate">
              {request.title}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {request.description}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "requestTypeName",
      header: "Type",
      cell: ({ row }) => {
        const requestType = row.getValue("requestTypeName") as string;
        return (
          <Badge variant="secondary" className="text-xs">
            {requestType || "N/A"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "frontendPriority",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent font-semibold text-gray-900"
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const priority = row.getValue("frontendPriority") as string;
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              getPriorityColor(priority)
            )}
          >
            {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "frontendStatus",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent font-semibold text-gray-900"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("frontendStatus") as string;
        return (
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", getStatusColor(status))}
          >
            {status?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Badge>
        );
      },
    },
    {
      accessorKey: "assignedStaffName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent font-semibold text-gray-900"
        >
          Assigned Staff
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const request = row.original;
        const staffName = request.assignedStaffName;
        
        if (!staffName) {
          return (
            <span className="text-gray-400 text-sm">Unassigned</span>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                {getInitials(staffName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-900">
              {staffName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent font-semibold text-gray-900"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        
        return (
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <Clock className="h-4 w-4" />
            <span>{formatDate(createdAt)}</span>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: requests,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-200">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-gray-50 font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedRequest(row.original);
                    setIsModalOpen(true);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Request Modal */}
      {selectedRequest && (
        <RequestModal
          request={selectedRequest}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onUpdate={(updatedRequest) => {
            onRequestUpdate(updatedRequest);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
