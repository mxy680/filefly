from processing_utils.spreadsheet.processor import *

map = {
    # CSV and TSV
    "text/csv": CSVExtractor(delimiter=","),
    "text/tab-separated-values": CSVExtractor(delimiter="\t"),
}
