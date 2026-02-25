import { v2 as cloudinary } from 'cloudinary';
import RescueReport, { IRescueReport } from './rescue.model';
import { CreateRescueReportInput, RescueListQuery } from './rescue.schema';
import {
    NotFoundError,
    BadRequestError,
    ConflictError,
} from '@/server/utils/AppError';
import { logger } from '@/server/utils/logger';

// ─── Constants ───────────────────────────────────────
const DUPLICATE_RADIUS_METERS = 500;
const DUPLICATE_TIME_HOURS = 24;

// ─── Cloudinary Config (lazy) ────────────────────────
let cloudinaryConfigured = false;

const ensureCloudinary = () => {
    if (!cloudinaryConfigured) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        cloudinaryConfigured = true;
    }
};

// ═════════════════════════════════════════════════════
//  SERVICE METHODS
// ═════════════════════════════════════════════════════

/**
 * Upload a photo to Cloudinary from a base64 string or URL.
 * Returns the secure URL.
 */
export const uploadRescuePhoto = async (
    photoData: string,
): Promise<string> => {
    ensureCloudinary();

    try {
        const result = await cloudinary.uploader.upload(photoData, {
            folder: 'petbuddy/rescue',
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto', fetch_format: 'auto' },
            ],
        });
        return result.secure_url;
    } catch (error) {
        logger.error('Cloudinary upload error:', error);
        throw new BadRequestError('Failed to upload photo. Please try again.');
    }
};

/**
 * Check for duplicate reports within 500m in the last 24 hours.
 * Gracefully skips if the geo index doesn't exist yet.
 */
const checkDuplicateReport = async (
    longitude: number,
    latitude: number,
): Promise<void> => {
    try {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - DUPLICATE_TIME_HOURS);

        const duplicate = await RescueReport.findOne({
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: DUPLICATE_RADIUS_METERS,
                },
            },
            status: { $in: ['pending', 'verified', 'in-progress'] },
            createdAt: { $gte: cutoff },
        });

        if (duplicate) {
            throw new ConflictError(
                'A rescue report already exists within 500 meters of this location in the last 24 hours. ' +
                `Existing report ID: ${duplicate._id}`,
            );
        }
    } catch (error) {
        // Re-throw ConflictError (actual duplicate found)
        if (error instanceof ConflictError) throw error;
        // Swallow other errors (e.g., missing 2dsphere index)
        logger.warn('⚠️ Duplicate check skipped — geo index may not exist:', (error as Error).message);
    }
};

/**
 * Create a rescue report.
 * - Validates geo coordinates
 * - Checks for duplicates within 500m
 * - Optionally uploads photo to Cloudinary (or uses URL directly)
 */
export const createRescueReport = async (
    userId: string,
    data: CreateRescueReportInput,
    photoData?: string,
): Promise<IRescueReport> => {
    const { longitude, latitude, address, description } = data;

    // ── Duplicate check (500m radius, last 24h) ────────
    await checkDuplicateReport(longitude, latitude);

    // ── Handle photo ────────────────────────────────────
    let photoUrl = '';
    if (photoData) {
        // If Cloudinary is configured, upload there
        const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_KEY !== 'your_api_key';

        if (hasCloudinary && (photoData.startsWith('data:') || photoData.startsWith('http'))) {
            try {
                photoUrl = await uploadRescuePhoto(photoData);
            } catch (err) {
                logger.warn('⚠️ Cloudinary upload failed, using URL directly:', (err as Error).message);
                photoUrl = photoData;
            }
        } else {
            // Use the provided URL directly (e.g. from /api/v1/upload)
            photoUrl = photoData;
        }
    }

    // ── Create report ──────────────────────────────────
    const report = await RescueReport.create({
        reporterId: userId,
        location: {
            type: 'Point',
            coordinates: [longitude, latitude],
        },
        address,
        description,
        photoUrl,
        status: 'pending',
        verified: false,
    });

    logger.info(`🆘 Rescue report created: ${report._id} at [${longitude}, ${latitude}]`);

    // ── Emit socket events (admin + nearby users) ─────
    try {
        const { getRescueNamespace, emitNewRescueReport } = await import('@/server/socket');
        const rescueNsp = getRescueNamespace();
        emitNewRescueReport(rescueNsp, {
            id: report._id.toString(),
            reporterId: userId,
            longitude,
            latitude,
            address,
            description,
            photoUrl,
            status: 'pending',
            createdAt: report.createdAt,
        });
    } catch {
        logger.warn('Socket.io not available — rescue report saved to DB only');
    }

    return report;
};

/**
 * Get rescue reports.
 * If lat/lng provided, uses $nearSphere for proximity sorting.
 * Otherwise returns chronologically.
 */
export const getRescueReports = async (query: RescueListQuery) => {
    const { status, longitude, latitude, radiusKm, page, limit } = query;
    const skip = (page - 1) * limit;

    const useGeo = longitude !== undefined && latitude !== undefined;

    if (useGeo) {
        // ── Geo query with $geoNear aggregation ───────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pipeline: any[] = [
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    distanceField: 'distanceMeters',
                    maxDistance: radiusKm * 1000,
                    spherical: true,
                    ...(status ? { query: { status } } : {}),
                },
            },
            { $skip: skip },
            { $limit: limit },
            {
                $addFields: {
                    distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] },
                },
            },
        ];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const countPipeline: any[] = [
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    distanceField: 'distanceMeters',
                    maxDistance: radiusKm * 1000,
                    spherical: true,
                    ...(status ? { query: { status } } : {}),
                },
            },
            { $count: 'total' },
        ];

        const [reports, countResult] = await Promise.all([
            RescueReport.aggregate(pipeline),
            RescueReport.aggregate(countPipeline),
        ]);

        const total = countResult[0]?.total || 0;

        return {
            reports,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    // ── Standard query (no geo) ─────────────────────────
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [reports, total] = await Promise.all([
        RescueReport.find(filter)
            .populate('reporterId', 'name phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        RescueReport.countDocuments(filter),
    ]);

    return {
        reports,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};

/**
 * Get a single rescue report by ID.
 */
export const getRescueReportById = async (reportId: string): Promise<IRescueReport> => {
    const report = await RescueReport.findById(reportId)
        .populate('reporterId', 'name phone');

    if (!report) {
        throw new NotFoundError('Rescue report not found');
    }

    return report;
};
