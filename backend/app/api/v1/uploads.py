"""File upload endpoint — stores to local /uploads directory and returns the URL."""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile

router = APIRouter(prefix="/uploads", tags=["uploads"])

_UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent.parent / "uploads"
_ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/", status_code=201)
async def upload_file(file: UploadFile) -> dict:
    if file.content_type not in _ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de arquivo não permitido. Aceitos: {', '.join(_ALLOWED_TYPES)}",
        )

    data = await file.read()
    if len(data) > _MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Arquivo excede 5 MB.")

    ext = Path(file.filename or "file.jpg").suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        ext = ".jpg"

    filename = f"{uuid.uuid4().hex}{ext}"
    _UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    dest = _UPLOAD_DIR / filename
    dest.write_bytes(data)

    return {"url": f"/api/v1/uploads/{filename}", "filename": filename}


@router.get("/{filename}")
async def serve_file(filename: str):
    from fastapi.responses import FileResponse

    # Sanitize: only allow filename with no path separators
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Nome de arquivo inválido.")

    path = _UPLOAD_DIR / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")

    return FileResponse(path)
