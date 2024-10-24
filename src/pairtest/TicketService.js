import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js'
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js'

export default class TicketService {
  constructor() {
    this.paymentService = new TicketPaymentService();
    this.reservationService = new SeatReservationService();
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    if (accountId <= 0) {
      throw new InvalidPurchaseException('Invalid account ID');
    }

    let totalTickets = 0;
    let totalCost = 0;
    let totalSeats = 0;
    let hasAdultTicket = false;

    ticketTypeRequests.forEach(request => {
      const noOfTickets = request.getNoOfTickets();
      const ticketType = request.getTicketType();

      totalTickets += noOfTickets;

      switch (ticketType) {
        case 'ADULT':
          totalCost += noOfTickets * 25;
          totalSeats += noOfTickets;
          hasAdultTicket = noOfTickets > 0
          break;
        case 'CHILD':
          totalCost += noOfTickets * 15;
          totalSeats += noOfTickets;
          break;
        case 'INFANT':
          break;
        default:
          throw new InvalidPurchaseException('Invalid ticket type');
      }
    });


    if (totalTickets > 25) {
      throw new InvalidPurchaseException('Cannot purchase more than 25 tickets at a time.');
    }
    if (!hasAdultTicket) {
      throw new InvalidPurchaseException('Child or Infant tickets cannot be purchased without an Adult ticket.');
    }
    if (totalTickets < 0) {
      throw new InvalidPurchaseException('At least one adult should be selected');
    }
    this.paymentService.makePayment(accountId, totalCost);
    this.reservationService.reserveSeat(accountId, totalSeats);
  }
}
