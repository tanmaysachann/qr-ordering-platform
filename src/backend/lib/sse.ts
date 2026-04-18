type SSEClient = {
  id: string;
  cafeId: string;
  controller: ReadableStreamDefaultController;
};

type SSEChannel = "orders" | "menu";

class SSEManager {
  private clients: Map<SSEChannel, SSEClient[]> = new Map([
    ["orders", []],
    ["menu", []],
  ]);

  addClient(channel: SSEChannel, client: SSEClient) {
    const list = this.clients.get(channel) ?? [];
    list.push(client);
    this.clients.set(channel, list);
  }

  removeClient(channel: SSEChannel, clientId: string) {
    const list = this.clients.get(channel) ?? [];
    this.clients.set(
      channel,
      list.filter((c) => c.id !== clientId)
    );
  }

  sendToCafe(cafeId: string, event: string, data: unknown, channel: SSEChannel = "orders") {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();

    const list = this.clients.get(channel) ?? [];
    list
      .filter((c) => c.cafeId === cafeId || c.cafeId === "all")
      .forEach((client) => {
        try {
          client.controller.enqueue(encoder.encode(message));
        } catch {
          this.removeClient(channel, client.id);
        }
      });
  }

  /** Broadcast a menu change to all customers watching a specific cafe */
  broadcastMenuUpdate(cafeId: string) {
    this.sendToCafe(cafeId, "menu_updated", { cafeId, timestamp: Date.now() }, "menu");
  }

  getClientCount(channel?: SSEChannel, cafeId?: string): number {
    if (channel) {
      const list = this.clients.get(channel) ?? [];
      return cafeId ? list.filter((c) => c.cafeId === cafeId).length : list.length;
    }
    let total = 0;
    for (const list of this.clients.values()) {
      total += cafeId ? list.filter((c) => c.cafeId === cafeId).length : list.length;
    }
    return total;
  }
}

const globalForSSE = globalThis as unknown as { sseManager: SSEManager | undefined };
export const sseManager = globalForSSE.sseManager ?? new SSEManager();
if (process.env.NODE_ENV !== "production") globalForSSE.sseManager = sseManager;
