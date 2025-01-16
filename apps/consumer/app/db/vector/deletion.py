from processors.extractor import get_extractor
from weaviate.classes.query import Filter
import weaviate

async def delete(client: weaviate.WeaviateClient, args: dict) -> None:
    extractor = get_extractor(args.get("mimeType"))

    # Get the collection
    collection = client.collections.get(extractor.file_type)

    # Delete the object from Weaviate
    try:
        # Get the objects with the given args
        res = collection.query.fetch_objects(
            filters=(
                Filter.by_property("fileId").equal(args.get("fileId"))
                & Filter.by_property("provider").equal(args.get("provider"))
                & Filter.by_property("fileName").equal(args.get("fileName"))
                & Filter.by_property("hash").equal(args.get("hash"))
                & Filter.by_property("size").equal(args.get("size"))
            )
        )

        if len(res.objects) == 0:
            raise ValueError("Object not found in Weaviate")
        elif len(res.objects) > 1:
            raise ValueError("Multiple objects found in Weaviate")

        # Delete the object
        object = res.objects[0]
        collection.data.delete_by_id(object.uuid)
        print(f"Deleted object with fileId: {args.get("fileId")} from Weaviate")

    except Exception as e:
        print(f"Failed to delete object: {e}")
