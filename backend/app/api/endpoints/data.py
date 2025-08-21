from fastapi import APIRouter, HTTPException, Query
import redis
import pandas as pd
from io import StringIO

# Connect to our Redis container
redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

router = APIRouter()

@router.get("/{data_id}/{sheet_name}")
async def get_paginated_data(
    data_id: str,
    sheet_name: str,
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=1000)
):
    if not redis_client.exists(data_id):
        raise HTTPException(status_code=404, detail="Data ID not found or expired.")

    sheet_json = redis_client.hget(data_id, sheet_name)

    if sheet_json is None:
        raise HTTPException(status_code=404, detail=f"Sheet '{sheet_name}' not found.")

    # Deserialize JSON string back to a DataFrame
    df = pd.read_json(StringIO(sheet_json), orient='split')

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
