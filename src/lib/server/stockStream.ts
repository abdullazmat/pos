type StockClient = {
  businessId: string;
  controller: ReadableStreamDefaultController<string>;
};

const globalStore = globalThis as typeof globalThis & {
  __stockStreamClients?: Set<StockClient>;
};

if (!globalStore.__stockStreamClients) {
  globalStore.__stockStreamClients = new Set<StockClient>();
}

const clients = globalStore.__stockStreamClients;

export function addStockClient(client: StockClient) {
  clients.add(client);
}

export function removeStockClient(client: StockClient) {
  clients.delete(client);
}

export function broadcastStockUpdate(
  businessId: string,
  productIds: string[] = [],
) {
  const payload = JSON.stringify({
    businessId,
    productIds,
    timestamp: Date.now(),
  });

  for (const client of clients) {
    if (client.businessId !== businessId) continue;
    try {
      client.controller.enqueue(`event: product\n`);
      client.controller.enqueue(`data: ${payload}\n\n`);
    } catch {
      clients.delete(client);
    }
  }
}
