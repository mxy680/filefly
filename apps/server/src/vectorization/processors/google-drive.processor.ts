import { Injectable } from '@nestjs/common';
import { GoogleDriveFileVectorizable } from '../types/files.types';

@Injectable()
export class GoogleDriveProcessor {

    constructor() { }
    
    async process(file: GoogleDriveFileVectorizable): Promise<void> {
        console.log('Processing Google Drive file:', file);
    }
}
