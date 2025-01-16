from app.processors.image.types import map as image_map
from app.processors.document.types import map as document_map
from app.processors.code.types import map as code_map
from app.processors.audio.types import map as audio_map
from app.processors.video.types import map as video_map
from app.processors.spreadsheet.types import map as spreadsheet_map
from app.processors.slideshow.types import map as slideshow_map

mime_processing_map = {
    **image_map,
    **document_map,
    **code_map,
    **audio_map,
    **video_map,
    **spreadsheet_map,
    **slideshow_map,
}


def get_extractor(mime_type: str):
    """
    Get the appropriate extractor for the MIME type.

    Args:
        mime_type (str): The MIME type of the content.
    """
    return mime_processing_map.get(mime_type)