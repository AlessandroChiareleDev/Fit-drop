from fastapi import FastAPI

from app.api.v1 import router as v1_router
from app.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title="FitDrop API",
        description="Session orchestration engine for on-demand fitness training.",
        version="0.1.0",
        debug=settings.DEBUG,
    )
    app.include_router(v1_router, prefix="/api")
    return app


app = create_app()
