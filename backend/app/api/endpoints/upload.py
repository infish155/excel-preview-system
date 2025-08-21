from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from app.processing import background_parse_file_task, JOB_STATUS_CACHE
import uuid

router = APIRouter()

@router.post("")
async def upload_and_process_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Receives a file, creates a job ID, and adds the parsing task
    to run in the background. Returns the job ID immediately.
    """
    job_id = str(uuid.uuid4())
    contents = await file.read()

    background_tasks.add_task(background_parse_file_task, job_id, contents, file.filename)

    JOB_STATUS_CACHE[job_id] = {"status": "PENDING", "result": "Task received"}

    return {"jobId": job_id}
