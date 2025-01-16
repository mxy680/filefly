from processing_utils.image.processor import *

map = {
    # Raster Images
    "image/png": GeneralImageExtractor(),  # .png
    "image/jpeg": GeneralImageExtractor(),  # .jpeg, .jpg
    "image/jpg": GeneralImageExtractor(),  # .jpg
    "image/webp": GeneralImageExtractor(),  # .webp
}
