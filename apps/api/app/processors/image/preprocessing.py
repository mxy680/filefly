from PIL import Image, PngImagePlugin
import io

def remove_iccp(buffer: bytes) -> bytes:
    """
    Removes the incorrect iCCP profile from the PNG image.
    :param buffer: The PNG image in bytes.
    :return: Cleaned PNG image in bytes.
    """
    image = Image.open(io.BytesIO(buffer))
    if "icc_profile" in image.info:
        # Remove the incorrect iCCP profile
        image.info.pop("icc_profile")
    
    # Save the fixed PNG to a new buffer
    output_buffer = io.BytesIO()
    image.save(output_buffer, format="PNG")
    return output_buffer.getvalue()
