import {jest} from '@jest/globals'
import TicketService from '../src/pairtest/TicketService'
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest'
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException'

describe('TicketService Tests', () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
    ticketService.paymentService.makePayment = jest.fn();
    ticketService.reservationService.reserveSeat = jest.fn(); 
  });

  // Valid scenarios
  test('should calculate total cost and reserve correct seats for valid ticket request', () => {
    const ticketRequests = [
      new TicketTypeRequest('ADULT', 2),
      new TicketTypeRequest('CHILD', 2),
      new TicketTypeRequest('INFANT', 1)
    ];

    ticketService.purchaseTickets(1, ...ticketRequests);

    // Assert total payment: (2 * 25) + (2 * 15) = 80
    expect(ticketService.paymentService.makePayment).toHaveBeenCalledWith(1, 80);
    // Assert total seats reserved: 2 Adults + 2 Children = 4 seats
    expect(ticketService.reservationService.reserveSeat).toHaveBeenCalledWith(1, 4);
  });

  test('should allow purchasing only at least one adult ticket is selected', () => {
    const ticketRequests = [
      new TicketTypeRequest('ADULT', 0)
    ];
    expect(() => {
        ticketService.purchaseTickets(1, ...ticketRequests);
      }).toThrow(InvalidPurchaseException);
  });
  test('should allow purchasing only adult tickets', () => {
    const ticketRequests = [
      new TicketTypeRequest('ADULT', 3)
    ];

    ticketService.purchaseTickets(1, ...ticketRequests);

    // Assert total payment: 3 * 25 = 75
    expect(ticketService.paymentService.makePayment).toHaveBeenCalledWith(1, 75);
    // Assert total seats reserved: 3 Adults = 3 seats
    expect(ticketService.reservationService.reserveSeat).toHaveBeenCalledWith(1, 3);
  });

  // Invalid scenarios
  test('should throw an error when more than 25 tickets are purchased', () => {
    const ticketRequests = [
      new TicketTypeRequest('ADULT', 20),
      new TicketTypeRequest('CHILD', 5),
      new TicketTypeRequest('INFANT', 1)
    ];

    expect(() => {
      ticketService.purchaseTickets(1, ...ticketRequests);
    }).toThrow(InvalidPurchaseException);
  });

  test('should throw an error when child tickets are purchased without an adult', () => {
    const ticketRequests = [
      new TicketTypeRequest('CHILD', 2)
    ];

    expect(() => {
      ticketService.purchaseTickets(1, ...ticketRequests);
    }).toThrow(InvalidPurchaseException);
  });

  test('should throw an error when infant tickets are purchased without an adult', () => {
    const ticketRequests = [
      new TicketTypeRequest('INFANT', 1)
    ];

    expect(() => {
      ticketService.purchaseTickets(1, ...ticketRequests);
    }).toThrow(InvalidPurchaseException);
  });

  test('should throw an error when purchasing zero tickets', () => {
    expect(() => {
      ticketService.purchaseTickets(1);
    }).toThrow(InvalidPurchaseException);
  });

  test('should throw an error when invalid account ID is provided', () => {
    const ticketRequests = [
      new TicketTypeRequest('ADULT', 1)
    ];

    expect(() => {
      ticketService.purchaseTickets(0, ...ticketRequests);  // Invalid account ID
    }).toThrow(InvalidPurchaseException);
  });

  test('should not reserve seats or take payment if purchase request is invalid', () => {
    const ticketRequests = [
      new TicketTypeRequest('CHILD', 1)
    ];

    expect(() => {
      ticketService.purchaseTickets(1, ...ticketRequests);
    }).toThrow(InvalidPurchaseException);

    expect(ticketService.paymentService.makePayment).not.toHaveBeenCalled();
    expect(ticketService.reservationService.reserveSeat).not.toHaveBeenCalled();
  });
  test('should throw an error when negative number of tickets is provided', () => {
    const ticketRequests = [
      new TicketTypeRequest('ADULT', -1)
    ];
  
    expect(() => {
      ticketService.purchaseTickets(1, ...ticketRequests);
    }).toThrow(InvalidPurchaseException);
  });
  

  
  test('should throw an error when total ticket count is zero', () => {
    const ticketRequests = [
      new TicketTypeRequest('ADULT', 0),
      new TicketTypeRequest('CHILD', 0),
      new TicketTypeRequest('INFANT', 0)
    ];
  
    expect(() => {
      ticketService.purchaseTickets(1, ...ticketRequests);
    }).toThrow(InvalidPurchaseException);
  });

  
  test('should throw an error when invalid account ID is provided (null)', () => {
    const ticketRequests = [
      new TicketTypeRequest('ADULT', 1)
    ];
  
    expect(() => {
      ticketService.purchaseTickets(null, ...ticketRequests);  // Invalid account ID
    }).toThrow(InvalidPurchaseException);
  });
  
  test('should throw an error when request exceeds 25 tickets', () => {
    const ticketRequests = [
      new TicketTypeRequest('ADULT', 20),
      new TicketTypeRequest('CHILD', 5),
      new TicketTypeRequest('INFANT', 1)  // Exceeds the 25 ticket limit
    ];
  
    expect(() => {
      ticketService.purchaseTickets(1, ...ticketRequests);
    }).toThrow(InvalidPurchaseException);
  });
});


