from app.processors.spreadsheet.processor import *

map = {
    # CSV and TSV
    "text/csv": CSVExtractor(delimiter=","),
    "text/tab-separated-values": CSVExtractor(delimiter="\t"),

    # XLSX and OpenDocument formats
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": XLSXExtractor(),
    "application/vnd.oasis.opendocument.spreadsheet": ODSExtractor(),

    # Legacy Excel and DBF
    "application/vnd.ms-excel": XLSExtractor(),
    "application/x-excel": XLSExtractor(),
    "application/x-dbf": DBFExtractor(),

    # KSpread
    "application/vnd.kde.kspread": ODSExtractor(),
    "application/x-kspread": ODSExtractor(),

    # Google Sheets
    "application/vnd.google-apps.spreadsheet": XLSXExtractor(),
}
