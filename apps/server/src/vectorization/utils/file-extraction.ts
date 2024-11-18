import { extractTextFromImage as extractTextFromImageWithOcr, extractTextFromPdf as extractTextFromPdfWithOcr } from './ocr';
import * as pdfParse from 'pdf-parse';

export async function extractImagesFromPdf(pdfBuffer: Buffer): Promise<Buffer[]> {
    // TODO
    return [];
}

export async function extractImagesFromDocx(docxBuffer: Buffer): Promise<Buffer[]> {
    // TODO
    return [];
}

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    return extractTextFromImageWithOcr(imageBuffer);
}

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    const data = await pdfParse(pdfBuffer);
    const text = data.text.trim();
    return text.length > 0 ? text : extractTextFromPdfWithOcr(pdfBuffer);
}

export async function extractTextFromDocx(docxBuffer: Buffer): Promise<string> {
    // TODO
    return '';
}