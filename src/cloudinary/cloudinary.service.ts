import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type { ConfigOptions, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    constructor(@Inject('CLOUDINARY') private cloudinaryConfig: ConfigOptions) { }

    async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'movies/images',
                    resource_type: 'image',
                    transformation: [
                        { width: 1000, height: 1500, crop: 'limit' }, // Limit size
                        { quality: 'auto' }, // Auto optimize quality
                    ],
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) {
                        return reject(new Error('Cloudinary upload failed: No result returned'));
                    }
                    resolve(result);
                },
            );

            Readable.from(file.buffer).pipe(uploadStream);
        });
    }

    async uploadVideo(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'movies/videos',
                    resource_type: 'video',
                    chunk_size: 20000000, // 20MB chunks for faster large-file streaming
                    // No eager transforms — generate thumbnails/previews on-demand via URL
                    // This avoids blocking the upload response for server-side transcoding
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) {
                        return reject(new Error('Cloudinary upload failed: No result returned'));
                    }
                    resolve(result);
                },
            );

            Readable.from(file.buffer).pipe(uploadStream);
        });
    }

    async deleteFile(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<any> {
        return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }

    // Get optimized URL for images
    getOptimizedImageUrl(publicId: string, width?: number, height?: number): string {
        return cloudinary.url(publicId, {
            transformation: [
                { width: width || 800, height: height || 1200, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' },
            ],
        });
    }

    // Get video URL with thumbnail
    getVideoWithThumbnail(publicId: string) {
        return {
            videoUrl: cloudinary.url(publicId, { resource_type: 'video' }),
            thumbnailUrl: cloudinary.url(publicId, {
                resource_type: 'video',
                format: 'jpg',
                transformation: [{ width: 640, height: 360, crop: 'fill' }],
            }),
        };
    }
}