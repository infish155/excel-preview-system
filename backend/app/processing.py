import pandas as pd
from io import BytesIO, StringIO
import uuid
import re
from typing import Dict, Any

JOB_STATUS_CACHE: Dict[str, Dict[str, Any]] = {}
PARSED_DATA_CACHE: Dict[str, Dict[str, pd.DataFrame]] = {}

def background_parse_file_task(job_id: str, file_contents: bytes, filename: str):
    """
    This function runs in the background. It parses the file and updates
    the in-memory caches with its status and result.
    """
    try:
        JOB_STATUS_CACHE[job_id] = {"status": "PROGRESS", "result": "Parsing file..."}

        data_id = str(uuid.uuid4())
        all_sheets_df = {}

        if filename.endswith('.csv'):
            decoded_contents = file_contents.decode('utf-8-sig')
            df = pd.read_csv(StringIO(decoded_contents))
            all_sheets_df["Sheet1"] = df
        else:
            buffer = BytesIO(file_contents)
            raw_sheets_df = pd.read_excel(buffer, sheet_name=None)
            all_sheets_df = {re.sub(r'\s+', '', name): df for name, df in raw_sheets_df.items()}

        PARSED_DATA_CACHE[data_id] = all_sheets_df

        metadata = {
            "dataId": data_id,
            "sheets": {
                name: {"totalRows": len(df)}
                for name, df in all_sheets_df.items()
            }
        }

        JOB_STATUS_CACHE[job_id] = {"status": "SUCCESS", "result": metadata}

    except Exception as e:
        JOB_STATUS_CACHE[job_id] = {"status": "FAILURE", "result": str(e)}

