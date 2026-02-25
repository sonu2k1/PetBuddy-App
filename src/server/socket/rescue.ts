/**
 * Rescue Socket.io Namespace — `/rescue`
 *
 * Handles:
 * - Admin dashboard: joins `rescue:admin` room
 * - Nearby users: register their location, get notified of reports within 5km
 * - New report events broadcasting
 */

import { Namespace, Socket } from 'socket.io';
import { logger } from '../utils/logger';

// ─── Types ───────────────────────────────────────────
interface UserLocation {
    userId: string;
    socketId: string;
    latitude: number;
    longitude: number;
    updatedAt: number;
}

// ─── In-memory location store ────────────────────────
// In production, use Redis GEO commands for scalability
const connectedUsers = new Map<string, UserLocation>();

// ─── Constants ───────────────────────────────────────
const NEARBY_RADIUS_KM = 5;
const LOCATION_STALE_MS = 30 * 60 * 1000; // 30 minutes

// ─── Haversine Distance (km) ─────────────────────────
const haversineDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number,
): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// ─── Find users within radius ────────────────────────
export const findNearbySocketUsers = (
    longitude: number,
    latitude: number,
    radiusKm: number = NEARBY_RADIUS_KM,
): UserLocation[] => {
    const now = Date.now();
    const nearby: UserLocation[] = [];

    connectedUsers.forEach((user) => {
        // Skip stale locations
        if (now - user.updatedAt > LOCATION_STALE_MS) return;

        const dist = haversineDistance(
            latitude, longitude,
            user.latitude, user.longitude,
        );

        if (dist <= radiusKm) {
            nearby.push(user);
        }
    });

    return nearby;
};

// ─── Setup Namespace ─────────────────────────────────
export const setupRescueNamespace = (nsp: Namespace): void => {
    nsp.on('connection', (socket: Socket) => {
        logger.info(`🆘 Rescue socket connected: ${socket.id}`);

        // ── Admin joins rescue:admin room ────────────────
        socket.on('join:admin', () => {
            socket.join('rescue:admin');
            logger.info(`👮 Socket ${socket.id} joined rescue:admin`);
        });

        // ── User registers their location ────────────────
        socket.on('register:location', (data: {
            userId: string;
            latitude: number;
            longitude: number;
        }) => {
            if (
                !data.userId ||
                typeof data.latitude !== 'number' ||
                typeof data.longitude !== 'number' ||
                data.latitude < -90 || data.latitude > 90 ||
                data.longitude < -180 || data.longitude > 180
            ) {
                socket.emit('error', { message: 'Invalid location data' });
                return;
            }

            connectedUsers.set(socket.id, {
                userId: data.userId,
                socketId: socket.id,
                latitude: data.latitude,
                longitude: data.longitude,
                updatedAt: Date.now(),
            });

            logger.debug(`📍 User ${data.userId} registered location: [${data.longitude}, ${data.latitude}]`);
        });

        // ── User updates their location ──────────────────
        socket.on('update:location', (data: {
            latitude: number;
            longitude: number;
        }) => {
            const existing = connectedUsers.get(socket.id);
            if (existing) {
                existing.latitude = data.latitude;
                existing.longitude = data.longitude;
                existing.updatedAt = Date.now();
            }
        });

        // ── Cleanup on disconnect ────────────────────────
        socket.on('disconnect', () => {
            connectedUsers.delete(socket.id);
            logger.info(`🆘 Rescue socket disconnected: ${socket.id}`);
        });
    });

    logger.info('🆘 Rescue namespace /rescue initialised');
};

// ─── Emit new rescue report event ────────────────────
export const emitNewRescueReport = (
    nsp: Namespace,
    report: {
        id: string;
        reporterId: string;
        longitude: number;
        latitude: number;
        address: string;
        description: string;
        photoUrl: string;
        status: string;
        createdAt: Date;
    },
): void => {
    // ── 1. Emit to admin dashboard ─────────────────────
    nsp.to('rescue:admin').emit('rescue:new-report', {
        ...report,
        target: 'admin',
    });
    logger.info(`📡 Rescue report ${report.id} broadcast to admin dashboard`);

    // ── 2. Emit to nearby users (within 5km) ───────────
    const nearbyUsers = findNearbySocketUsers(
        report.longitude,
        report.latitude,
        NEARBY_RADIUS_KM,
    );

    // Exclude the reporter themselves
    const recipients = nearbyUsers.filter((u) => u.userId !== report.reporterId);

    let notifiedCount = 0;
    for (const user of recipients) {
        const dist = haversineDistance(
            report.latitude, report.longitude,
            user.latitude, user.longitude,
        );

        nsp.to(user.socketId).emit('rescue:nearby-report', {
            ...report,
            distanceKm: Math.round(dist * 100) / 100,
            target: 'nearby-user',
        });
        notifiedCount++;
    }

    logger.info(`📡 Rescue report ${report.id} notified ${notifiedCount} nearby users within ${NEARBY_RADIUS_KM}km`);
};
