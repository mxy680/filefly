export type GoogleDriveFileVectorizable = {
    userId: number;
    fileId: string;
    mimeType: string;
}

export const GOOGLE_DRIVE_DOCUMENT_MIME_TYPES = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.google-apps.document",
    "application/vnd.oasis.opendocument.text",
    "application/rtf",
    "application/pdf",
    "text/markdown",
    "text/plain",
];
