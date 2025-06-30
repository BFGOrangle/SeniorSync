import { Ticket } from '@/types/ticket';
import { EnhancedTicket } from '@/types/request';

/**
 * Utility functions for converting between old ticket format and new request format
 */
export const TicketUtils = {
  /**
   * Convert EnhancedTicket to Ticket for backward compatibility
   */
  enhancedToTicket(request: EnhancedTicket): Ticket {
    return {
      // Core fields
      id: request.id,
      title: request.title,
      description: request.description,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      completedAt: request.completedAt,
      
      // Convert backend status to frontend status
      status: request.frontendStatus,
      priority: request.frontendPriority,
      
      // Senior information
      seniorName: request.seniorName || `Senior ${request.seniorId}`,
      seniorId: request.seniorId,
      phoneNumber: request.seniorPhone || '',
      email: request.seniorEmail || '',
      address: request.seniorAddress || '',
      
      // Request details
      requestType: request.requestTypeName || 'General Request',
      requestTypeId: request.requestTypeId,
      
      // Staff/Agent information
      assignee: request.assignedStaffName || '',
      assignedStaffId: request.assignedStaffId,
      agentName: request.assignedStaffName || '',
      agentId: request.assignedStaffId?.toString() || '',
      
      // Legacy fields (empty for now)
      emergencyContact: '',
      emergencyPhone: '',
      preferredDate: '',
      preferredTime: '',
      medicalConditions: '',
      medications: '',
      mobilityAssistance: false,
      dueDate: request.completedAt ? new Date(request.completedAt) : undefined,
    };
  },

  /**
   * Convert Ticket to EnhancedTicket
   */
  ticketToEnhanced(ticket: Ticket): EnhancedTicket {
    return {
      // Backend fields
      id: ticket.id,
      seniorId: ticket.seniorId || 0,
      assignedStaffId: ticket.assignedStaffId,
      requestTypeId: ticket.requestTypeId,
      title: ticket.title,
      description: ticket.description,
      priority: 1, // This would need proper conversion from frontend priority
      status: 'TODO', // This would need proper conversion from frontend status
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      completedAt: ticket.completedAt,
      
      // Additional information
      seniorName: ticket.seniorName,
      seniorPhone: ticket.phoneNumber,
      seniorEmail: ticket.email,
      seniorAddress: ticket.address,
      assignedStaffName: ticket.assignee,
      requestTypeName: ticket.requestType,
      
      // Frontend compatibility fields
      frontendStatus: ticket.status,
      frontendPriority: ticket.priority,
    };
  },

  /**
   * Convert array of EnhancedTickets to Tickets
   */
  enhancedArrayToTicketArray(requests: EnhancedTicket[]): Ticket[] {
    return requests.map(request => this.enhancedToTicket(request));
  }
};
