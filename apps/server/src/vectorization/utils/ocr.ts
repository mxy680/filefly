import * as Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { createCanvas } from 'canvas';
import fs from 'fs';

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
        // Perform OCR using Tesseract.js
        const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
        return text;
    } catch (error) {
        console.error('Error performing OCR:', error);
        throw new Error('Failed to perform OCR on the image.');
    }
}

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    // TODO
    return 'OCR TEXT';
  }