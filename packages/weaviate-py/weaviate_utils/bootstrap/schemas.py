from weaviate.classes.config import Configure, Property, DataType, Multi2VecField

schemas = [
    {
        "name": "Document",
        "vectorizer": Configure.NamedVectors.text2vec_openai(
            name="document",
            model="text-embedding-3-small",
            source_properties=["fileName", "content", "size"],
            dimensions=512,
        ),
        "properties": [
            Property(
                name="fileName",
                data_type=DataType.TEXT,
                description="The name of the document file.",
            ),
            Property(
                name="content",
                data_type=DataType.TEXT,
                description="The main text content of the document.",
            ),
            Property(
                name="size",
                data_type=DataType.INT,
                description="The size of the document in bytes.",
            ),
            Property(
                name="hash",
                data_type=DataType.TEXT,
                description="The hash of the document content.",
                skip_vectorization=True,
            ),
            Property(
                name="provider",
                data_type=DataType.TEXT,
                description="The source or provider of the document.",
                skip_vectorization=True,
            ),
            Property(
                name="fileId",
                data_type=DataType.TEXT,
                description="The unique identifier of the document file.",
                skip_vectorization=True,
            ),
        ],
    },
    {
        "name": "Image",
        "vectorizer": Configure.NamedVectors.multi2vec_clip(
            name="image",
            image_fields=[
                Multi2VecField(name="imageData", weight="0.50"),
            ],
            text_fields=[
                Multi2VecField(name="fileName", weight="0.05"),
                Multi2VecField(name="content", weight="0.40"),
                Multi2VecField(name="size", weight="0.05"),
            ],
        ),
        "properties": [
            Property(
                name="fileName",
                data_type=DataType.TEXT,
                description="The name of the image file.",
            ),
            Property(
                name="imageData",
                data_type=DataType.BLOB,
                description="The raw image data as a binary blob.",
            ),
            Property(
                name="content",
                data_type=DataType.TEXT,
                description="A textual description or caption of the image.",
            ),
            Property(
                name="size",
                data_type=DataType.INT,
                description="The size of the image in bytes.",
            ),
            Property(
                name="hash",
                data_type=DataType.TEXT,
                description="The hash of the document content.",
                skip_vectorization=True,
            ),
            Property(
                name="provider",
                data_type=DataType.TEXT,
                description="The source or provider of the image.",
                skip_vectorization=True,
            ),
            Property(
                name="fileId",
                data_type=DataType.TEXT,
                description="The unique identifier of the image file.",
                skip_vectorization=True,
            ),
            Property(
                name="parent",
                data_type=DataType.TEXT,
                description="The parent document/slideshow fileId that this image is derived from.",
                skip_vectorization=True,  
            ),
        ],
    },
    {
        "name": "Spreadsheet",
        "vectorizer": Configure.NamedVectors.text2vec_openai(
            name="spreadsheet",
            model="text-embedding-3-small",
            source_properties=["fileName", "content", "size", "format"],
            dimensions=512,
        ),
        "properties": [
            Property(
                name="fileName",
                data_type=DataType.TEXT,
                description="The name of the dataset file.",
            ),
            Property(
                name="content",
                data_type=DataType.TEXT,
                description="The serialized content of the dataset (e.g., CSV, JSON).",
            ),
            Property(
                name="format",
                data_type=DataType.TEXT,
                description="The format of the dataset (e.g., CSV, JSON, Parquet).",
            ),
            Property(
                name="size",
                data_type=DataType.INT,
                description="The size of the dataset in bytes.",
            ),
            Property(
                name="hash",
                data_type=DataType.TEXT,
                description="The hash of the document content.",
                skip_vectorization=True,
            ),
            Property(
                name="provider",
                data_type=DataType.TEXT,
                description="The source or provider of the dataset.",
                skip_vectorization=True,
            ),
            Property(
                name="fileId",
                data_type=DataType.TEXT,
                description="The unique identifier of the dataset file.",
                skip_vectorization=True,
            ),
        ],
    },
    {
        "name": "Code",
        "vectorizer": Configure.NamedVectors.text2vec_openai(
            name="code",
            model="text-embedding-3-small",
            source_properties=[
                "fileName",
                "content",
                "description",
                "size",
                "language",
                "dependencies",
            ],
            dimensions=512,
        ),
        "properties": [
            Property(
                name="fileName",
                data_type=DataType.TEXT,
                description="The name of the code file.",
            ),
            Property(
                name="content",
                data_type=DataType.TEXT,
                description="The source code snippet or file content.",
            ),
            Property(
                name="description",
                data_type=DataType.TEXT,
                description="A description or summary of the code's purpose.",
            ),
            Property(
                name="language",
                data_type=DataType.TEXT,
                description="The programming language of the code.",
            ),
            Property(
                name="dependencies",
                data_type=DataType.TEXT_ARRAY,
                description="Dependencies or libraries used in the code.",
            ),
            Property(
                name="size",
                data_type=DataType.INT,
                description="The size of the code in bytes.",
            ),
            Property(
                name="hash",
                data_type=DataType.TEXT,
                description="The hash of the document content.",
                skip_vectorization=True,
            ),
            Property(
                name="provider",
                data_type=DataType.TEXT,
                description="The source or provider of the code.",
                skip_vectorization=True,
            ),
            Property(
                name="fileId",
                data_type=DataType.TEXT,
                description="The unique identifier of the code file.",
                skip_vectorization=True,
            ),
        ],
    },
    {
        "name": "Slideshow",
        "vectorizer": Configure.NamedVectors.multi2vec_clip(
            name="slideshow",
            image_fields=[
                Multi2VecField(name="images", weight="0.45"),
            ],
            text_fields=[
                Multi2VecField(name="content", weight="0.45"),
                Multi2VecField(name="fileName", weight="0.05"),
                Multi2VecField(name="size", weight="0.05"),
            ],
        ),
        "properties": [
            Property(
                name="fileName",
                data_type=DataType.TEXT,
                description="The name of the slideshow file.",
            ),
            Property(
                name="images",
                data_type=DataType.BLOB,
                description="The aggregation of all images in the slideshow.",
                skip_vectorization=True, # We will handle this manually
            ),
            Property(
                name="content",
                data_type=DataType.TEXT,
                description="The main text content of the slideshow.",
            ),
            Property(
                name="size",
                data_type=DataType.INT,
                description="The size of the slideshow in bytes.",
            ),
            Property(
                name="hash",
                data_type=DataType.TEXT,
                description="The hash of the document content.",
                skip_vectorization=True,
            ),
            Property(
                name="provider",
                data_type=DataType.TEXT,
                description="The source or provider of the slideshow.",
                skip_vectorization=True,
            ),
            Property(
                name="fileId",
                data_type=DataType.TEXT,
                description="The unique identifier of the slideshow file.",
                skip_vectorization=True,
            ),
        ],
    },
]