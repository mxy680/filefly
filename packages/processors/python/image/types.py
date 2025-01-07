from app.processors.image.processor import *

map = {
    # Raster Images
    "image/png": GeneralImageExtractor(),  # .png
    "image/jpeg": GeneralImageExtractor(),  # .jpeg, .jpg
    "image/jpg": GeneralImageExtractor(),  # .jpg
    "image/gif": GraphicsInterchangeFormatExtractor(),  # .gif
    "image/webp": GeneralImageExtractor(),  # .webp
    "image/tiff": AdvancedImageExtractor(),  # .tiff (no extractor provided)
    "image/x-tiff": AdvancedImageExtractor(),  # .tif, .tiff (no extractor provided)
    "image/bmp": GeneralImageExtractor(),  # .bmp
    "image/x-bmp": GeneralImageExtractor(),  # .bmp
    "image/x-ms-bmp": GeneralImageExtractor(),  # .bmp

    # Vector Images
    "image/svg+xml": ScalableVectorGraphicsExtractor(),  # .svg
    "image/svg": ScalableVectorGraphicsExtractor(),  # .svg
    "image/vnd.microsoft.icon": AdvancedImageExtractor(),  # .ico
    "image/x-icon": AdvancedImageExtractor(),  # .ico
    "image/x-icns": AdvancedImageExtractor(),  # .icns (no extractor provided)

    # Modern Formats
    "image/apng": GeneralImageExtractor(),  # .apng
    "image/avif": AdvancedImageExtractor(),  # .avif (no extractor provided)
    "image/avif-sequence": AdvancedImageExtractor(),  # .avif (no extractor provided)
    "image/heic": HEICExtractor(),  # .heic (no extractor provided)
    "image/heic-sequence": HEICExtractor(),  # .heic (no extractor provided)
    "image/heif": HEICExtractor,  # .heif (no extractor provided)
    "image/heif-sequence": HEICExtractor(),  # .heif (no extractor provided)

    # High-End Formats
    "image/x-exr": AdvancedImageExtractor(),  # .exr (no extractor provided)
    "image/dng": AdvancedImageExtractor(),  # .dng (no extractor provided)
    "image/x-adobe-dng": AdvancedImageExtractor(),  # .dng (no extractor provided)
    "image/x-fuji-raf": AdvancedImageExtractor(),  # .raf (no extractor provided)
    "image/x-canon-cr2": AdvancedImageExtractor(),  # .cr2 (no extractor provided)
    "image/x-canon-cr3": AdvancedImageExtractor(),  # .cr3 (no extractor provided)
    "image/x-nikon-nef": AdvancedImageExtractor(),  # .nef (no extractor provided)
    "image/x-nikon-nrw": AdvancedImageExtractor(),  # .nrw (no extractor provided)
    "image/x-panasonic-rw2": AdvancedImageExtractor(),  # .rw2 (no extractor provided)
    "image/x-sony-arw": AdvancedImageExtractor(),  # .arw (no extractor provided)
    "image/x-sony-srf": AdvancedImageExtractor(),  # .srf (no extractor provided)
    "image/x-sony-sr2": AdvancedImageExtractor(),  # .sr2 (no extractor provided)

    # Other Useful Formats
    "image/jp2": AdvancedImageExtractor(),  # .jp2 (no extractor provided)
    "image/jpm": AdvancedImageExtractor(),  # .jpm (no extractor provided)
    "image/jpx": AdvancedImageExtractor(),  # .jpx (no extractor provided)
    "image/jpeg2000": AdvancedImageExtractor(),  # .jp2, .jpx (no extractor provided)
    "image/jpeg2000-image": AdvancedImageExtractor(),  # .jp2, .jpx (no extractor provided)
    "image/vnd.adobe.photoshop": AdvancedImageExtractor(),  # .psd (no extractor provided)
    "image/x-psd": PSDExtractor(),  # .psd (no extractor provided)
}
