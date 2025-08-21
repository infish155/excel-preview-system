from fastapi import APIRouter
from celery.result import AsyncResult
from app.celery_app import celery

router = APIRouter()

@router.get("/{job_id}/status")
async def get_job_status(job_id: str):
    """
    Polls for the status of a background job.
    """
    task_result = AsyncResult(job_id, app=celery)

    response = {
        "jobId": job_id,
        "status": task_result.status,
        "result": task_result.result or task_result.info,
    }
    return response
