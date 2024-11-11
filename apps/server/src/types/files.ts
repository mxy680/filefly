export type GoogleDriveFile = {
    id: string;
    name: string,
    mimeType: string,
    webViewLink?: string,
    thumbnailLink?: string,
    iconLink?: string,
    size: number,
    hashed: string,
    createdTime?: Date,
    modifiedTime?: Date,
    userId: number,
    createdAt: Date,
    updatedAt: Date
}