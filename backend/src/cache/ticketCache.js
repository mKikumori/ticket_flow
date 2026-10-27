import Ticket from "../model/ticketModel.js";

// Cria um Map de key: ticketID e value: actual ticket
const ticketMap = new Map();

// Função para preencher o cache com o Map
export async function loadTicketCache() {
  const tickets = await Ticket.find().lean();

  ticketMap.clear();

  for (const ticket of tickets) {
    ticketMap.set(ticket._id.toString(), ticket);
  }

  console.log(`Loaded ${tickets.length} tickets into cache`);
}

// Operações CRUD para os tickets em Cache
export function getCachedTicket(id) {
  return ticketCache.get(id);
}

export function getAllCachedTickets() {
  return Array.from(ticketCache.values());
}

export function setCachedTicket(ticket) {
  ticketCache.set(ticket._id.toString(), ticket);
}

export function deleteCachedTicket(id) {
  return ticketCache.delete(id);
}
