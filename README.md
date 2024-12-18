We will use Weaviate as our only vector DB. Weaviate is entirely open-source, the least expensive option, and allows us to locally host our database AND models.

https://weaviate.com

We will be hosting weaviate on kubernetes as well as the models (CLIP).

**Vectorization Pipeline:**

1. From the providers, we receive two types of files **workspace files** (google docs, sheets, slides, etc. dropbox? onedrive?) which are native to the platform and need to be reconstructed into another format and **blob files**. \*\*\*\*
   1. This will be given to use as a JSON manifest, including metadata like createdTime, fileHash, id, size, etc.
2. When a file is created, we extract it however necessary and turn it into bytes. Then, we use a library to extract the content from the file.
   1. If a file is deleted, we simply delete the embedding with the appropriate cache in the metadata entry.
   2. If a file is updated, we delete the old embedding and create a new one.
3. Depending on the mime type, we will process the file into an embedding into a different way. If at any point it fails due to a file type error, we will go back to step 3b. If it fails while being read in the backup way, we will just abort this task.
   1. **Workspace files:** Google Docs, Google Slides, Google Sheets, etc.: download into pdf format and treat as that
   2. `text/plain;charset=...` : feed it straight into openai text-embedding-3-small
   3. `image/...` : feed it straight into clip vectorizer, doing any necessary pre-processing.
   4. `.doc` `application/msword` : export as PDF, continue as PDF
   5. `.docx` `application/vnd.openxmlformats-officedocument.wordprocessingml.document` : export as PDF, continue as PDF
   6. `.pdf` `application/pdf`
      1. Extract all text. If no text, perform OCR (easyOCR from opencv) to extract content. Then, embed all text with openai text-embedding-3-small.
      2. Extract all images. If no images, continue.
         1. If there are images, vectorize the images using CLIP. For every image, store its CLIP vector embedding in the “Image” collection specifying the corresponding parent file.
   7. `.pptx` `application/vnd.openxmlformats-officedocument.presentationml.presentation`/: get picture for each slide, get text for each slide using OCR, combine all slides with weights.
      1. (Optional): Vectorize and store each slide as an “Image”
   8. Audio: OpenAI Whisper → plaintext for text-embedding-3-small
   9. `video/...`:
      1. Extract audio using Whisper into text and embed with clip
      2. Extract n% (TBD) of the frames and embed with clip.
      3. Combine audio content with video and store in “Video” collection
   10. `.xlsx` `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
       1. Feed first n (TBD) rows into llama3.3 and request a summary. Embed the summary into text-embedding-3-small and store in the “Document” collection.
   11. See https://textract.readthedocs.io/en/stable/ for extracting text of other doc types and then puttng text straight into clip
4. Literally just upload the file content and metadata to weaviate and it will do the rest.
