import { Injectable } from '@nestjs/common';

import { WeaviateService } from 'src/weaviate/weaviate.service';

import * as pdfParse from 'pdf-parse';

import { extractImagesFromDocx, extractImagesFromPdf, extractTextFromDocx, extractTextFromPdf, extractTextFromImage } from '../utils/file-extraction';

@Injectable()
export class DocumentProcessor {

    constructor(private readonly weaviateService: WeaviateService) { }

    async process(content: Buffer | string, mimeType: string): Promise<void> {
        if (typeof content === 'string') {
            // TODO
        } else {
            let images: Buffer[];
            let text: string;
            switch (mimeType) {
                case 'application/pdf':
                    images = await extractImagesFromPdf(content);
                    text = await extractTextFromPdf(content);
                    break;
                case 'application/msword':
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                case 'application/vnd.oasis.opendocument.text':
                    images = await extractImagesFromDocx(content);
                    text = await extractTextFromDocx(content);
                    break;
                default:
                    throw new Error(`Unsupported MIME type: ${mimeType}`);
            }

            // Extract text from images
            const imageTexts: string[] = await Promise.all(images.map(async (image) => extractTextFromImage(image)));

            // Vectorize content
            // TODO

            // First three lines
            const lines = text.split('\n').slice(0, 5);
            console.log(lines);
        }
    }
}
