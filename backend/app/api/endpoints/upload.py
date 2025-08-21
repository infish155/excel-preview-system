from fastapi import APIRouter, UploadFile, File
from app.tasks import parse_file_task

router = APIRouter()

@router.post("")
async def upload_and_dispatch_task(file: UploadFile = File(...)):
    """
    Receives a file, saves its content, and dispatches a background
    task to parse it. Returns the task ID immediately.
    """
    contents = await file.read()
    # Dispatch the task to the Celery worker
    task = parse_file_task.delay(contents, file.filename)
    # Return the task ID to the client
    return {"jobId": task.id}
