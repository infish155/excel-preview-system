from fastapi import APIRouter, HTTPException
from app.processing import JOB_STATUS_CACHE

router = APIRouter()

@router.get("/{job_id}/status")
async def get_job_status(job_id: str):
    """
    Polls for the status of a background job from the in-memory cache.
    """
    status_info = JOB_STATUS_CACHE.get(job_id)
    if not status_info:
        raise HTTPException(status_code=404, detail="Job ID not found.")

    return {
        "jobId": job_id,
        "status": status_info["status"],
        "result": status_info["result"],
    }
