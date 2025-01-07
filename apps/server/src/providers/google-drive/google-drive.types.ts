export type GoogleDriveFile = {
    id: string;
    name: string,
    mimeType: string,
    webViewLink?: string,
    thumbnailLink?: string,
    iconLink?: string,
    size: string,
    sha1Checksum?: string,
    sha256Checksum?: string,
    md5Checksum?: string,
    createdTime?: string,
    modifiedTime?: string,
}