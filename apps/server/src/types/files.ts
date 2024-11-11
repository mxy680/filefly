export type GoogleDriveFile = {
    id: string;
    name: string,
    mimeType: string,
    webViewLink?: string,
    thumbnailLink?: string,
    iconLink?: string,
    size: number,
    sha1?: string,
    sha256?: string,
    md5?: string,
    createdTime?: Date,
    modifiedTime?: Date,
    userId: number,
    createdAt: Date,
    updatedAt: Date
}