def chunkify_text(text: str, max_chunk_size: int = 8192):
    """
    Splits a long text string into the largest possible chunks that do not exceed the specified size.

    Args:
        text (str): The input text to split.
        max_chunk_size (int): Maximum size of each chunk in characters.

    Returns:
        list: A list of text chunks.
    """
    chunks = []

    # Split text by whitespace to avoid breaking words
    words = text.split()

    current_chunk = []
    current_length = 0

    for word in words:
        # If adding the next word exceeds the max_chunk_size, finalize the current chunk
        if current_length + len(word) + (1 if current_chunk else 0) > max_chunk_size:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_length = 0

        # Add the word to the current chunk
        current_chunk.append(word)
        current_length += len(word) + (1 if current_chunk else 0)  # +1 for the space

    # Add the last chunk if any words remain
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks
