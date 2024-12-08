from weaviate.classes.config import Configure, Property, DataType

document_schema = {
    "name": "Document",
    "vectorizer": Configure.Vectorizer.text2vec_openai(),
    "properties": [  
        Property(name="title", data_type=DataType.TEXT),
        Property(name="body", data_type=DataType.TEXT),
    ]
}