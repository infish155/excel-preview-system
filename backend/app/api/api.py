from fastapi import APIRouter
from app.api.endpoints import upload, data

api_router = APIRouter()
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
api_router.include_router(data.router, prefix="/data", tags=["Data"])