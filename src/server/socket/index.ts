/**
 * Socket.io integration for Next.js.
 *
 * NOTE: Next.js App Router's built-in server doesn't natively expose the
 * underlying HTTP server for Socket.io attachment. For production real-time
 * features, you have two recommended approaches:
 *
 * 1. **Custom Next.js server** (custom-server.ts) — create an HTTP server,
 *    attach Socket.io, then pass it to Next.js.
 * 2. **Separate Socket.io microservice** — run Socket.io on a separate port
 *    (e.g., 5001) alongside the Next.js app.
 *
 * This module provides the Socket.io server setup that can be used with
 * either approach. See `custom-server.ts` at the project root for a
 * working example.
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { setupRescueNamespace } from './rescue';

// Cache on globalThis to survive HMR
const globalForSocket = globalThis as unknown as {
    io: Server | undefined;
};

export const initSocket = (httpServer: HttpServer): Server => {
    if (globalForSocket.io) {
        return globalForSocket.io;
    }

    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

    const io = new Server(httpServer, {
        cors: {
            origin: corsOrigin,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
    });

    io.on('connection', (socket: Socket) => {
        logger.info(`🔌 Socket connected: ${socket.id}`);

        // Join a user-specific room for targeted events
        socket.on('join', (userId: string) => {
            socket.join(`user:${userId}`);
            logger.debug(`Socket ${socket.id} joined room user:${userId}`);
        });

        socket.on('disconnect', (reason: string) => {
            logger.info(`🔌 Socket disconnected: ${socket.id} — ${reason}`);
        });

        socket.on('error', (err: Error) => {
            logger.error(`Socket error on ${socket.id}: ${err.message}`);
        });
    });

    // ── Register namespaces ───────────────────────────
    const rescueNsp = io.of('/rescue');
    setupRescueNamespace(rescueNsp);

    globalForSocket.io = io;
    logger.info('🔌 Socket.io initialised');
    return io;
};

export const getIO = (): Server => {
    if (!globalForSocket.io) {
        throw new Error('Socket.io not initialised. Call initSocket() first.');
    }
    return globalForSocket.io;
};

export const getRescueNamespace = () => {
    const io = getIO();
    return io.of('/rescue');
};

// Re-export rescue utilities
export { emitNewRescueReport, findNearbySocketUsers } from './rescue';
