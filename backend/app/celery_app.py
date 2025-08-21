from celery import Celery

# Initialize Celery
celery = Celery(
    "tasks",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0",
    # Add this line to tell Celery where to find your task modules
    include=["app.tasks"]
)

# Optional configuration
celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
