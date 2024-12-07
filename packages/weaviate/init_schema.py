import weaviate
import os
import json    

WEAVIATE_URL = os.getenv("WEAVIATE_URL", "http://localhost:8080")


def init_schema():
    """
    Initialize schema in Weaviate from a JSON file.
    """
    client = weaviate.connect_to_local()
    
    # Load the schema
    with open("schema.json", "r") as file:
        schema = json.load(file)

    # # Create classes in Weaviate
    # for class_def in schema["classes"]:
    #     # Check if class already exists
    #     if client.schema.contains_class(class_def["class"]):
    #         print(f"Class '{class_def['class']}' already")
    #         continue    
        
    #     print(f"Creating class: {class_def['class']}")
    #     try:
    #         client.schema.create_class(class_def)
    #     except weaviate.exceptions.WeaviateStartUpError as e:
    #         print(f"Error creating class '{class_def['class']}': {e}")


if __name__ == "__main__":
    print(f"Initializing schema from schema.json")
    init_schema()
