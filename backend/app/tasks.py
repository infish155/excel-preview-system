from .celery_app import celery
import pandas as pd
from io import BytesIO, StringIO
import uuid
import re
import redis
import json

# Connect to our Redis container.
# The hostname 'redis' is available because Docker Compose creates a network.
redis_client = redis.Redis(host='redis', port=6379, db=0)

@celery.task(bind=True)
def parse_file_task(self, file_contents: bytes, filename: str):
    """
    Parses the file and stores the resulting DataFrames in Redis.
    """
    try:
        self.update_state(state='PROGRESS', meta={'status': 'Parsing file...'})

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

        # We use a Redis Hash to store all sheets related to a single data_id.
        for sheet_name, df in all_sheets_df.items():
            # Serialize DataFrame to JSON string before storing
            df_json = df.to_json(orient='split')
            redis_client.hset(data_id, sheet_name, df_json)

        # Set an expiration time for the cached data (e.g., 1 hour)
        redis_client.expire(data_id, 3600)

        # Prepare metadata to return
        metadata = {
            "dataId": data_id,
            "sheets": {
                name: {"totalRows": len(df)}
                for name, df in all_sheets_df.items()
            }
        }

        return {'status': 'SUCCESS', 'result': metadata}

    except Exception as e:
        self.update_state(state='FAILURE', meta={'status': str(e)})
        return {'status': 'FAILURE', 'result': str(e)}
