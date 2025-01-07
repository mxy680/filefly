from app.processors.slideshow.processor import *

map = {
    "application/vnd.ms-powerpoint": PPTXExtractor(),  # .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": PPTXExtractor(),  # .pptx
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow": PPTXExtractor(),  # .ppsx
    "application/vnd.oasis.opendocument.presentation": ODPExtractor(),  # .odp
    "application/vnd.apple.keynote": KeynoteExtractor(),  # .key
}
