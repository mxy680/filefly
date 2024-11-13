import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
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

  async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    // Placeholder method for handling OCR on PDF pages.
    // Here you could split PDF pages, convert them to images, and then perform OCR.
    // For simplicity, we'll handle it as a single image if you have PDF as image data.

    try {
      const { data: { text } } = await Tesseract.recognize(pdfBuffer, 'eng');
      return text;
    } catch (error) {
      console.error('Error performing OCR on PDF:', error);
      throw new Error('Failed to perform OCR on the PDF.');
    }
  }
}
