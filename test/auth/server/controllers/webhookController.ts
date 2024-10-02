import { Request, Response } from 'express';
import prisma from '../prisma/client';

// Handle Google Drive webhook events
export const handleGoogleDriveWebhook = async (req: Request, res: Response) => {
    const { channelId, resourceId, expiration } = req.body;

    try {
        // Process the Google Drive webhook event and store it in the database
        await prisma.googleDriveWebhook.create({
            data: {
                userId: req.user.id, // Assuming `req.user` is set by the auth middleware
                channelId,
                resourceId,
                expiration: new Date(expiration),
            },
        });

        res.status(200).json({ message: 'Webhook event processed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process webhook event' });
    }
};
