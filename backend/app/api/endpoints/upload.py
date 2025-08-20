from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from io import BytesIO, StringIO
import uuid
from app.cache.storage import DATA_CACHE

router = APIRouter()

@router.post("")
async def upload_and_process_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Invalid file type.")

    try:
        contents = await file.read()
        data_id = str(uuid.uuid4())
        
        all_sheets_df = {}
        if file.filename.endswith('.csv'):
            decoded_contents = contents.decode('utf-8-sig')
            df = pd.read_csv(StringIO(decoded_contents))
            all_sheets_df["Sheet1"] = df
        else:
            buffer = BytesIO(contents)
            all_sheets_df = pd.read_excel(buffer, sheet_name=None)
        
        # Store the dictionary of DataFrames in the cache
        DATA_CACHE[data_id] = all_sheets_df

        # Prepare metadata to return to the frontend
        metadata = {
            "dataId": data_id,
            "sheets": {
                name: {"totalRows": len(df)}
                for name, df in all_sheets_df.items()
            }
        }
        return metadata

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
