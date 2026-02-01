/**
 * WebSocket Server - Real-time communication for import progress
 *
 * Uses @fastify/websocket for WebSocket support in Fastify.
 * Clients subscribe to import job updates by jobId.
 */

import type { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';
import type { ImportJobStatus } from '@prisma/client';

// ============================================
// Types
// ============================================

export interface WSMessage {
  type: 'status' | 'result' | 'error' | 'ping' | 'pong';
  jobId?: string;
  status?: ImportJobStatus;
  progress?: number;
  result?: unknown;
  error?: string;
  itemsFound?: number;
  itemsSaved?: number;
  // Sheet-by-sheet processing info
  message?: string;
  sheetsCompleted?: number;
  totalSheets?: number;
}

interface ClientInfo {
  userId: string;
  organizationId: string;
  subscribedJobs: Set<string>;
}

// ============================================
// Connection Management
// ============================================

// Map of WebSocket connections by client
const clients = new Map<WebSocket, ClientInfo>();

// Map of job IDs to subscribed clients
const jobSubscriptions = new Map<string, Set<WebSocket>>();

/**
 * Register WebSocket routes
 */
export async function registerWebSocketRoutes(app: FastifyInstance): Promise<void> {
  // Import the websocket plugin
  const websocket = await import('@fastify/websocket');
  await app.register(websocket.default);

  // WebSocket endpoint for import updates
  app.get('/api/ws/imports', { websocket: true }, (socket: WebSocket, request) => {
    // Extract user info from query params (simplified - in production use JWT)
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const userId = url.searchParams.get('userId') || 'anonymous';
    const organizationId = url.searchParams.get('organizationId') || '';

    console.log(`[WebSocket] Client connected: userId=${userId}`);

    // Store client info
    const clientInfo: ClientInfo = {
      userId,
      organizationId,
      subscribedJobs: new Set(),
    };
    clients.set(socket, clientInfo);

    // Handle incoming messages
    socket.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as {
          type: string;
          jobId?: string;
        };

        switch (message.type) {
          case 'subscribe':
            if (message.jobId) {
              subscribeToJob(socket, message.jobId);
            }
            break;

          case 'unsubscribe':
            if (message.jobId) {
              unsubscribeFromJob(socket, message.jobId);
            }
            break;

          case 'ping':
            socket.send(JSON.stringify({ type: 'pong' }));
            break;

          default:
            console.warn(`[WebSocket] Unknown message type: ${message.type}`);
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    });

    // Handle disconnection
    socket.on('close', () => {
      console.log(`[WebSocket] Client disconnected: userId=${userId}`);
      cleanupClient(socket);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[WebSocket] Client error: userId=${userId}`, error);
      cleanupClient(socket);
    });

    // Send initial connection acknowledgment
    socket.send(
      JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established',
      })
    );
  });

  console.log('[WebSocket] Routes registered');
}

/**
 * Subscribe a client to job updates
 */
function subscribeToJob(socket: WebSocket, jobId: string): void {
  const clientInfo = clients.get(socket);
  if (!clientInfo) return;

  clientInfo.subscribedJobs.add(jobId);

  if (!jobSubscriptions.has(jobId)) {
    jobSubscriptions.set(jobId, new Set());
  }
  jobSubscriptions.get(jobId)!.add(socket);

  console.log(`[WebSocket] Client subscribed to job: ${jobId}`);

  // Acknowledge subscription
  socket.send(
    JSON.stringify({
      type: 'subscribed',
      jobId,
    })
  );
}

/**
 * Unsubscribe a client from job updates
 */
function unsubscribeFromJob(socket: WebSocket, jobId: string): void {
  const clientInfo = clients.get(socket);
  if (!clientInfo) return;

  clientInfo.subscribedJobs.delete(jobId);

  const subscribers = jobSubscriptions.get(jobId);
  if (subscribers) {
    subscribers.delete(socket);
    if (subscribers.size === 0) {
      jobSubscriptions.delete(jobId);
    }
  }

  console.log(`[WebSocket] Client unsubscribed from job: ${jobId}`);
}

/**
 * Clean up when a client disconnects
 */
function cleanupClient(socket: WebSocket): void {
  const clientInfo = clients.get(socket);
  if (!clientInfo) return;

  // Unsubscribe from all jobs
  for (const jobId of clientInfo.subscribedJobs) {
    const subscribers = jobSubscriptions.get(jobId);
    if (subscribers) {
      subscribers.delete(socket);
      if (subscribers.size === 0) {
        jobSubscriptions.delete(jobId);
      }
    }
  }

  clients.delete(socket);
}

// ============================================
// Broadcasting Functions (called by worker)
// ============================================

/**
 * Broadcast a status update for a job
 */
export function broadcastJobStatus(
  jobId: string,
  status: ImportJobStatus,
  progress: number,
  extra?: {
    itemsFound?: number;
    itemsSaved?: number;
    message?: string;
    sheetsCompleted?: number;
    totalSheets?: number;
  }
): void {
  const subscribers = jobSubscriptions.get(jobId);
  if (!subscribers || subscribers.size === 0) {
    console.log(`[WebSocket] No subscribers for job: ${jobId}`);
    return;
  }

  const message: WSMessage = {
    type: 'status',
    jobId,
    status,
    progress,
    ...extra,
  };

  const messageStr = JSON.stringify(message);
  let sent = 0;

  for (const socket of subscribers) {
    try {
      if (socket.readyState === socket.OPEN) {
        socket.send(messageStr);
        sent++;
      }
    } catch (error) {
      console.error(`[WebSocket] Error sending to client:`, error);
    }
  }

  console.log(
    `[WebSocket] Broadcast status to ${sent}/${subscribers.size} clients for job: ${jobId}`
  );
}

/**
 * Broadcast the result of a completed job
 */
export function broadcastJobResult(jobId: string, result: unknown): void {
  const subscribers = jobSubscriptions.get(jobId);
  if (!subscribers || subscribers.size === 0) return;

  const message: WSMessage = {
    type: 'result',
    jobId,
    result,
  };

  const messageStr = JSON.stringify(message);

  for (const socket of subscribers) {
    try {
      if (socket.readyState === socket.OPEN) {
        socket.send(messageStr);
      }
    } catch (error) {
      console.error(`[WebSocket] Error sending result:`, error);
    }
  }

  console.log(`[WebSocket] Broadcast result for job: ${jobId}`);
}

/**
 * Broadcast an error for a job
 */
export function broadcastJobError(jobId: string, error: string): void {
  const subscribers = jobSubscriptions.get(jobId);
  if (!subscribers || subscribers.size === 0) return;

  const message: WSMessage = {
    type: 'error',
    jobId,
    error,
  };

  const messageStr = JSON.stringify(message);

  for (const socket of subscribers) {
    try {
      if (socket.readyState === socket.OPEN) {
        socket.send(messageStr);
      }
    } catch (error) {
      console.error(`[WebSocket] Error sending error message:`, error);
    }
  }

  console.log(`[WebSocket] Broadcast error for job: ${jobId}`);
}

/**
 * Get the number of active connections
 */
export function getActiveConnectionCount(): number {
  return clients.size;
}

/**
 * Get the number of active job subscriptions
 */
export function getActiveSubscriptionCount(): number {
  return jobSubscriptions.size;
}
