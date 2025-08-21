from fastapi import APIRouter, HTTPException, Query
from app.processing import PARSED_DATA_CACHE
import pandas as pd

router = APIRouter()

@router.get("/{data_id}/{sheet_name}")
async def get_paginated_data(
    data_id: str,
    sheet_name: str,
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=1000)
):
    if data_id not in PARSED_DATA_CACHE:
        raise HTTPException(status_code=404, detail="Data ID not found or expired.")

    sheets_data = PARSED_DATA_CACHE[data_id]
    if sheet_name not in sheets_data:
        raise HTTPException(status_code=404, detail=f"Sheet '{sheet_name}' not found.")

    df = sheets_data[sheet_name]

    start_index = (page - 1) * limit
    end_index = start_index + limit

    paginated_df = df.iloc[start_index:end_index]

    paginated_df = paginated_df.fillna("")
    data = paginated_df.to_dict(orient='split')

    if 'index' in data:
        del data['index']

    if page > 1:
        data = {"data": data.get("data", [])}

    return data
