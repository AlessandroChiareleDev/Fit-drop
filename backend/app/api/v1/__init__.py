from fastapi import APIRouter

from app.api.v1.users import router as users_router
from app.api.v1.trainers import router as trainers_router
from app.api.v1.session_requests import router as session_requests_router
from app.api.v1.matches import router as matches_router
from app.api.v1.sessions import router as sessions_router
from app.api.v1.payments import router as payments_router
from app.api.v1.payouts import router as payouts_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.orchestration import router as orchestration_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.gyms import router as gyms_router
from app.api.v1.coupons import router as coupons_router
from app.api.v1.gym_trainers import router as gym_trainers_router
from app.api.v1.gym_reviews import router as gym_reviews_router
from app.api.v1.favorites import router as favorites_router
from app.api.v1.audit_logs import router as audit_logs_router
from app.api.v1.uploads import router as uploads_router

router = APIRouter(prefix="/v1")

router.include_router(users_router)
router.include_router(trainers_router)
router.include_router(session_requests_router)
router.include_router(matches_router)
router.include_router(sessions_router)
router.include_router(payments_router)
router.include_router(payouts_router)
router.include_router(reviews_router)
router.include_router(incidents_router)
router.include_router(orchestration_router)
router.include_router(dashboard_router)
router.include_router(gyms_router)
router.include_router(coupons_router)
router.include_router(gym_trainers_router)
router.include_router(gym_reviews_router)
router.include_router(favorites_router)
router.include_router(audit_logs_router)
router.include_router(uploads_router)
