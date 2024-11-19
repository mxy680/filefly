import { Injectable } from '@nestjs/common';

import * as Tesseract from 'tesseract.js';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class ExtractionService {

    constructor() { }

    async extract(file: Buffer, mimeType: string): Promise<{ text: string, images: Buffer[] }> {
        switch (mimeType) {
            case "application/pdf":
                return await this.extractPDFContent(file);
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return await this.extractDOCXContent(file);
            case "application/msword":
                return await this.extractDOCContent(file);
            case "application/rtf":
                return await this.extractRTFContent(file);
            case "application/vnd.oasis.opendocument.text":
                return await this.extractODTContent(file);
            default:
                throw new Error('Unsupported file type');
        }
    }

    async extractPDFContent(pdfBuffer: Buffer): Promise<{ text: string, images: Buffer[] }> {
        const data = await pdfParse(pdfBuffer);
        const text = data.text.trim();
        if (text.length > 0) return text;

        // TODO: Extract text in PDF

        // TODO: Extract images from PDF

        return { text: '', images: [] };
    }

    async extractDOCXContent(docxBuffer: Buffer): Promise<{ text: string, images: Buffer[] }> {
        // TODO: Extract text in DOCX

        // TODO: Extract images from DOCX

        return { text: '', images: [] };
    }

    async extractDOCContent(docBuffer: Buffer): Promise<{ text: string, images: Buffer[] }> {
        // TODO: Extract text in DOC

        // TODO: Extract images from DOC

        return { text: '', images: [] };
    }

    async extractRTFContent(rtfBuffer: Buffer): Promise<{ text: string, images: Buffer[] }> {
        // TODO: Extract text in RTF

        // TODO: Extract images from RTF

        return { text: '', images: [] };
    }

    async extractODTContent(odtBuffer: Buffer): Promise<{ text: string, images: Buffer[] }> {
        // TODO: Extract text in ODT

        // TODO: Extract images from ODT

        return { text: '', images: [] };
    }


    async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
        try {
            // Perform OCR using Tesseract.js
            const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
            return text;
        } catch (error) {
            console.error('Error performing OCR:', error);
            throw new Error('Failed to perform OCR on the image.');
        }
    }
}
