"""
API integration tests using httpx AsyncClient + in-memory SQLite.
"""

import pytest
import pytest_asyncio
import uuid

from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.main import create_app
from app.models.base import Base
from app.database import get_db


# ── Test database setup ───────────────────────────────────────────

TEST_DB_URL = "sqlite+aiosqlite://"  # in-memory

engine = create_async_engine(TEST_DB_URL, echo=False)
TestSession = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSession() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ── Helper ────────────────────────────────────────────────────────


async def create_user(client: AsyncClient, **overrides) -> dict:
    data = {"name": "Test User", "phone": f"2799900{uuid.uuid4().hex[:4]}", "city": "Vitória"}
    data.update(overrides)
    resp = await client.post("/api/v1/users", json=data)
    assert resp.status_code == 201
    return resp.json()


async def create_trainer(client: AsyncClient, **overrides) -> dict:
    data = {
        "name": "Test Trainer",
        "phone": f"2799800{uuid.uuid4().hex[:4]}",
        "cref_number": f"00{uuid.uuid4().hex[:4]}-G/ES",
        "city": "Vitória",
        "base_price_per_session": 120.0,
        "specialties": ["strength"],
        "coverage_neighborhoods": ["Praia do Canto"],
    }
    data.update(overrides)
    resp = await client.post("/api/v1/trainers", json=data)
    assert resp.status_code == 201
    return resp.json()


async def activate_trainer(client: AsyncClient, trainer_id: str) -> dict:
    resp = await client.patch(
        f"/api/v1/trainers/{trainer_id}",
        json={"cref_status": "verified", "operational_status": "active"},
    )
    assert resp.status_code == 200
    return resp.json()


async def create_availability(client: AsyncClient, trainer_id: str, day: int = 0) -> dict:
    resp = await client.post(
        f"/api/v1/trainers/{trainer_id}/availabilities",
        json={
            "day_of_week": day,
            "start_time": "06:00:00",
            "end_time": "12:00:00",
            "valid_from": "2026-01-01",
        },
    )
    assert resp.status_code == 201
    return resp.json()


async def create_session_request(client: AsyncClient, user_id: str, **overrides) -> dict:
    data = {
        "user_id": user_id,
        "requested_date": "2026-04-13",  # Monday
        "requested_time_start": "07:00:00",
        "requested_time_end": "08:00:00",
        "neighborhood": "Praia do Canto",
        "venue_type": "gym",
        "modality": "strength",
        "lead_source": "landing_page",
    }
    data.update(overrides)
    resp = await client.post("/api/v1/session-requests", json=data)
    assert resp.status_code == 201
    return resp.json()


# ── Tests ─────────────────────────────────────────────────────────


class TestHealth:
    @pytest.mark.asyncio
    async def test_health(self, client):
        resp = await client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"


class TestUserCRUD:
    @pytest.mark.asyncio
    async def test_create_and_get(self, client):
        user = await create_user(client, name="João")
        assert user["name"] == "João"
        assert user["city"] == "Vitória"

        resp = await client.get(f"/api/v1/users/{user['id']}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "João"

    @pytest.mark.asyncio
    async def test_list(self, client):
        await create_user(client, phone="27111111111")
        await create_user(client, phone="27222222222")
        resp = await client.get("/api/v1/users")
        assert resp.status_code == 200
        assert len(resp.json()) >= 2

    @pytest.mark.asyncio
    async def test_update(self, client):
        user = await create_user(client)
        resp = await client.patch(
            f"/api/v1/users/{user['id']}", json={"neighborhood": "Jardim da Penha"}
        )
        assert resp.status_code == 200
        assert resp.json()["neighborhood"] == "Jardim da Penha"

    @pytest.mark.asyncio
    async def test_not_found(self, client):
        resp = await client.get(f"/api/v1/users/{uuid.uuid4()}")
        assert resp.status_code == 404


class TestTrainerCRUD:
    @pytest.mark.asyncio
    async def test_create_and_activate(self, client):
        trainer = await create_trainer(client)
        assert trainer["cref_status"] == "pending"
        assert trainer["operational_status"] == "pending_review"

        activated = await activate_trainer(client, trainer["id"])
        assert activated["cref_status"] == "verified"
        assert activated["operational_status"] == "active"
        assert activated["cref_verified_at"] is not None
        assert activated["activated_at"] is not None

    @pytest.mark.asyncio
    async def test_availability(self, client):
        trainer = await create_trainer(client)
        avail = await create_availability(client, trainer["id"], day=0)
        assert avail["day_of_week"] == 0
        assert avail["start_time"] == "06:00:00"

        resp = await client.get(f"/api/v1/trainers/{trainer['id']}/availabilities")
        assert len(resp.json()) == 1


class TestSessionRequestFlow:
    @pytest.mark.asyncio
    async def test_create_and_status_update(self, client):
        user = await create_user(client)
        sr = await create_session_request(client, user["id"])
        assert sr["status"] == "submitted"

        resp = await client.patch(
            f"/api/v1/session-requests/{sr['id']}/status",
            json={"status": "matching"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "matching"

    @pytest.mark.asyncio
    async def test_invalid_transition(self, client):
        user = await create_user(client)
        sr = await create_session_request(client, user["id"])
        resp = await client.patch(
            f"/api/v1/session-requests/{sr['id']}/status",
            json={"status": "completed"},
        )
        assert resp.status_code == 422


class TestCandidatesEndpoint:
    @pytest.mark.asyncio
    async def test_returns_ranked_candidates(self, client):
        user = await create_user(client)
        trainer = await create_trainer(client)
        await activate_trainer(client, trainer["id"])
        await create_availability(client, trainer["id"], day=0)  # Monday

        sr = await create_session_request(client, user["id"])
        resp = await client.get(f"/api/v1/session-requests/{sr['id']}/candidates")
        assert resp.status_code == 200
        candidates = resp.json()
        assert len(candidates) >= 1
        assert candidates[0]["score"] > 0
        assert "breakdown" in candidates[0]


class TestOrchestrationFlow:
    @pytest.mark.asyncio
    async def test_full_flow(self, client):
        """Test the complete: offer → accept → pay → complete flow."""
        # Setup
        user = await create_user(client)
        trainer = await create_trainer(client)
        await activate_trainer(client, trainer["id"])
        await create_availability(client, trainer["id"], day=0)

        sr = await create_session_request(client, user["id"])

        # 1. Offer match
        resp = await client.post(
            "/api/v1/orchestration/offer-match",
            json={"request_id": sr["id"], "trainer_id": trainer["id"], "operated_by": "admin"},
        )
        assert resp.status_code == 200
        offer = resp.json()
        match_id = offer["match_id"]
        assert offer["attempt"] == 1
        assert "pricing" in offer

        # 2. Accept match
        resp = await client.post(f"/api/v1/orchestration/accept-match/{match_id}")
        assert resp.status_code == 200
        accept = resp.json()
        assert accept["status"] == "accepted"
        assert accept["user_pays"] > 0

        # 3. Confirm payment
        resp = await client.post(
            "/api/v1/orchestration/confirm-payment",
            json={"match_id": match_id, "method": "pix"},
        )
        assert resp.status_code == 200
        confirmed = resp.json()
        assert confirmed["status"] == "confirmed"
        assert confirmed["session_id"]
        assert confirmed["payment_id"]
        assert confirmed["payout_id"]

        # 4. Complete session
        resp = await client.post(
            "/api/v1/orchestration/complete-session",
            json={"session_id": confirmed["session_id"]},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "completed"

        # 5. Verify dashboard
        resp = await client.get("/api/v1/dashboard/overview")
        assert resp.status_code == 200
        dash = resp.json()
        assert dash["totals"]["sessions"] == 1
        assert dash["pipeline"]["sessions_completed"] == 1
        assert dash["financial"]["gmv"] > 0

    @pytest.mark.asyncio
    async def test_decline_and_retry(self, client):
        user = await create_user(client)
        trainer1 = await create_trainer(client, phone="27111111111", cref_number="001-G/ES")
        trainer2 = await create_trainer(client, phone="27222222222", cref_number="002-G/ES")
        await activate_trainer(client, trainer1["id"])
        await activate_trainer(client, trainer2["id"])

        sr = await create_session_request(client, user["id"])

        # Offer to trainer 1
        resp = await client.post(
            "/api/v1/orchestration/offer-match",
            json={"request_id": sr["id"], "trainer_id": trainer1["id"]},
        )
        match1_id = resp.json()["match_id"]

        # Trainer 1 declines
        resp = await client.post(f"/api/v1/orchestration/decline-match/{match1_id}")
        assert resp.json()["status"] == "declined"
        assert resp.json()["remaining_attempts"] == 2

        # Offer to trainer 2
        resp = await client.post(
            "/api/v1/orchestration/offer-match",
            json={"request_id": sr["id"], "trainer_id": trainer2["id"]},
        )
        assert resp.status_code == 200
        assert resp.json()["attempt"] == 2

    @pytest.mark.asyncio
    async def test_pricing_preview(self, client):
        trainer = await create_trainer(client, base_price_per_session=100.0)
        resp = await client.get(f"/api/v1/orchestration/pricing-preview/{trainer['id']}")
        assert resp.status_code == 200
        assert resp.json()["user_pays"] == 115.0
        assert resp.json()["platform_fee_amount"] == 22.0
        assert resp.json()["trainer_payout_amount"] == 78.0


class TestReviewFlow:
    @pytest.mark.asyncio
    async def test_create_review(self, client):
        # Build a completed session first
        user = await create_user(client)
        trainer = await create_trainer(client)
        await activate_trainer(client, trainer["id"])
        await create_availability(client, trainer["id"], day=0)
        sr = await create_session_request(client, user["id"])

        resp = await client.post(
            "/api/v1/orchestration/offer-match",
            json={"request_id": sr["id"], "trainer_id": trainer["id"]},
        )
        match_id = resp.json()["match_id"]
        await client.post(f"/api/v1/orchestration/accept-match/{match_id}")
        resp = await client.post(
            "/api/v1/orchestration/confirm-payment",
            json={"match_id": match_id, "method": "pix"},
        )
        session_id = resp.json()["session_id"]
        await client.post(
            "/api/v1/orchestration/complete-session",
            json={"session_id": session_id},
        )

        # Now create review
        resp = await client.post(
            "/api/v1/reviews",
            json={
                "session_id": session_id,
                "user_id": user["id"],
                "trainer_id": trainer["id"],
                "rating": 5,
                "comment": "Ótimo treino!",
                "experience_tags": ["pontual", "motivador"],
            },
        )
        assert resp.status_code == 201
        assert resp.json()["rating"] == 5

    @pytest.mark.asyncio
    async def test_duplicate_review_rejected(self, client):
        user = await create_user(client)
        trainer = await create_trainer(client)
        await activate_trainer(client, trainer["id"])
        await create_availability(client, trainer["id"], day=0)
        sr = await create_session_request(client, user["id"])

        resp = await client.post(
            "/api/v1/orchestration/offer-match",
            json={"request_id": sr["id"], "trainer_id": trainer["id"]},
        )
        match_id = resp.json()["match_id"]
        await client.post(f"/api/v1/orchestration/accept-match/{match_id}")
        resp = await client.post(
            "/api/v1/orchestration/confirm-payment",
            json={"match_id": match_id, "method": "pix"},
        )
        session_id = resp.json()["session_id"]

        review_data = {
            "session_id": session_id,
            "user_id": user["id"],
            "trainer_id": trainer["id"],
            "rating": 4,
        }
        resp1 = await client.post("/api/v1/reviews", json=review_data)
        assert resp1.status_code == 201
        resp2 = await client.post("/api/v1/reviews", json=review_data)
        assert resp2.status_code == 409
