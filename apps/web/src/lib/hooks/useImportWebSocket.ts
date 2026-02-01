/**
 * Import WebSocket Hook
 *
 * Manages WebSocket connection for real-time import progress updates.
 * Automatically reconnects on disconnection with exponential backoff.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useImportsStore, type ImportJobStatus } from '@/stores/imports.store';

// ============================================
// Types
// ============================================

interface WSStatusMessage {
  type: 'status';
  jobId: string;
  status: ImportJobStatus;
  progress: number;
  itemsFound?: number;
  itemsSaved?: number;
}

interface WSResultMessage {
  type: 'result';
  jobId: string;
  result: unknown;
}

interface WSErrorMessage {
  type: 'error';
  jobId: string;
  error: string;
}

interface WSConnectedMessage {
  type: 'connected';
  message: string;
}

interface WSSubscribedMessage {
  type: 'subscribed';
  jobId: string;
}

interface WSPongMessage {
  type: 'pong';
}

type WSMessage =
  | WSStatusMessage
  | WSResultMessage
  | WSErrorMessage
  | WSConnectedMessage
  | WSSubscribedMessage
  | WSPongMessage;

// ============================================
// Constants
// ============================================

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
const RECONNECT_INITIAL_DELAY = 1000;
const RECONNECT_MAX_DELAY = 30000;
const PING_INTERVAL = 30000;

// ============================================
// Hook
// ============================================

/**
 * Hook for managing WebSocket connection for import updates
 *
 * Automatically:
 * - Connects when there are active imports
 * - Subscribes to job updates
 * - Updates Zustand store on messages
 * - Reconnects on disconnection
 * - Sends periodic pings to keep connection alive
 */
export function useImportWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(RECONNECT_INITIAL_DELAY);
  const subscribedJobsRef = useRef<Set<string>>(new Set());

  // Auth state
  const user = useAuthStore((state) => state.user);
  const organization = useAuthStore((state) => state.organization);

  // Import store
  const jobs = useImportsStore((state) => state.jobs);
  const updateJob = useImportsStore((state) => state.updateJob);
  const hasActiveJobs = useImportsStore((state) => state.hasActiveJobs);

  // Get active job IDs
  const getActiveJobIds = useCallback(() => {
    const activeJobs: string[] = [];
    jobs.forEach((job, id) => {
      if (!['COMPLETED', 'FAILED'].includes(job.status)) {
        activeJobs.push(id);
      }
    });
    return activeJobs;
  }, [jobs]);

  // Subscribe to a job
  const subscribeToJob = useCallback((jobId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    if (subscribedJobsRef.current.has(jobId)) {
      return;
    }

    wsRef.current.send(JSON.stringify({ type: 'subscribe', jobId }));
    subscribedJobsRef.current.add(jobId);
    console.log(`[WebSocket] Subscribed to job: ${jobId}`);
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as WSMessage;

        switch (message.type) {
          case 'connected':
            console.log('[WebSocket] Connected:', message.message);
            // Reset reconnect delay on successful connection
            reconnectDelayRef.current = RECONNECT_INITIAL_DELAY;
            // Subscribe to all active jobs
            getActiveJobIds().forEach(subscribeToJob);
            break;

          case 'subscribed':
            console.log(`[WebSocket] Subscribed to job: ${message.jobId}`);
            break;

          case 'status':
            console.log(
              `[WebSocket] Status update: ${message.jobId} -> ${message.status} (${message.progress}%)`
            );
            updateJob(message.jobId, {
              status: message.status,
              progress: message.progress,
              ...(message.itemsFound !== undefined && {
                itemsFound: message.itemsFound,
              }),
              ...(message.itemsSaved !== undefined && {
                itemsSaved: message.itemsSaved,
              }),
            });
            break;

          case 'result':
            console.log(`[WebSocket] Result received for job: ${message.jobId}`);
            updateJob(message.jobId, {
              result: message.result,
            });
            break;

          case 'error':
            console.error(`[WebSocket] Error for job ${message.jobId}:`, message.error);
            updateJob(message.jobId, {
              status: 'FAILED',
              errors: [message.error],
            });
            break;

          case 'pong':
            // Heartbeat response, connection is alive
            break;

          default:
            console.warn('[WebSocket] Unknown message type:', message);
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    },
    [updateJob, getActiveJobIds, subscribeToJob]
  );

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Don't connect if no user or no active jobs
    if (!user || !organization) {
      return;
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Build URL with auth params
    const url = new URL(`${WS_BASE_URL}/api/ws/imports`);
    url.searchParams.set('userId', user.id);
    url.searchParams.set('organizationId', organization.id);

    console.log('[WebSocket] Connecting to:', url.toString());

    const ws = new WebSocket(url.toString());

    ws.onopen = () => {
      console.log('[WebSocket] Connection opened');

      // Start ping interval
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, PING_INTERVAL);
    };

    ws.onmessage = handleMessage;

    ws.onclose = (event) => {
      console.log(`[WebSocket] Connection closed: ${event.code} ${event.reason}`);

      // Clear subscriptions
      subscribedJobsRef.current.clear();

      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Reconnect if we still have active jobs
      if (hasActiveJobs()) {
        const delay = reconnectDelayRef.current;
        console.log(`[WebSocket] Reconnecting in ${delay}ms...`);

        reconnectTimeoutRef.current = setTimeout(() => {
          // Exponential backoff
          reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, RECONNECT_MAX_DELAY);
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    wsRef.current = ws;
  }, [user, organization, handleMessage, hasActiveJobs]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    // Close connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear subscriptions
    subscribedJobsRef.current.clear();
  }, []);

  // Connect when we have active jobs, disconnect when we don't
  useEffect(() => {
    if (hasActiveJobs() && user && organization) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [hasActiveJobs, user, organization, connect, disconnect]);

  // Subscribe to new jobs
  useEffect(() => {
    const activeJobIds = getActiveJobIds();
    activeJobIds.forEach((jobId) => {
      if (!subscribedJobsRef.current.has(jobId)) {
        subscribeToJob(jobId);
      }
    });
  }, [jobs, getActiveJobIds, subscribeToJob]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    subscribe: subscribeToJob,
  };
}
