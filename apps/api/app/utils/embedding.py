from openai import OpenAI
import os
import time
import json
import numpy as np

def embed_text_chunks(chunks: list[str]) -> list:
    """
    Embeds a list of text chunks using the OpenAI Batch API and calculates the total cost.

    Args:
        chunks (list[str]): The list of text chunks to embed.

    Returns:
        list: The average embedding of the text chunks.
    """
    embeddings = []
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # Process each chunk
    for chunk in chunks:
        try:
            embeddings.append(client.embeddings.create(
                input=chunk,
                model="text-embedding-3-small"
            ).data[0].embedding)
        except Exception as e:
            print(f"Failed to embed text chunk: {e}")

    # Average the embeddings
    average_embedding = np.mean(embeddings, axis=0).tolist()    

    # Calculate the cost
    token_count = sum(len(chunk.split()) for chunk in chunks)
    cost_per_1m_tokens = 0.02
    total_cost = (token_count / 10**6) * cost_per_1m_tokens
    
    print(f"Total cost: ${total_cost:.10f}")

    return average_embedding
