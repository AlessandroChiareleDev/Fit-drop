from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import router as v1_router
from app.config import settings

_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


def create_app() -> FastAPI:
    app = FastAPI(
        title="FitDrop API",
        description="Session orchestration engine for on-demand fitness training.",
        version="0.1.0",
        debug=settings.DEBUG,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=_ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", tags=["health"])
    async def health():
        return {"status": "ok", "version": "0.1.0"}

    app.include_router(v1_router, prefix="/api")
    return app


app = create_app()
