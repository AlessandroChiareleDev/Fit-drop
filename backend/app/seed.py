"""
Seed script — populates the database with realistic test data for Vitória/ES.

Usage:
    cd backend
    python -m app.seed
"""

import asyncio
import hashlib
import uuid
from datetime import date, time

from sqlalchemy import text

from app.database import async_session, engine
from app.enums import (
    CrefStatus,
    LeadSource,
    Modality,
    RecurrenceType,
    TrainerOperationalStatus,
    Urgency,
    UserRole,
    VenueType,
)
from app.models.session_request import SessionRequest
from app.models.trainer import Trainer
from app.models.trainer_availability import TrainerAvailability
from app.models.user import User
from app.models.gym import Gym
from app.models.coupon import Coupon
from app.models.gym_trainer import GymTrainer
from app.models.gym_review import GymReview
from app.models.favorite import Favorite
from app.models.review import Review


def _hash(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


async def seed():
    # Create tables if they don't exist
    from app.models.base import Base
    import app.models  # noqa: F401 — ensure all models registered
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Check if already seeded
        result = await db.execute(text("SELECT COUNT(*) FROM users"))
        if result.scalar() > 0:
            print("Database already has data. Skipping seed.")
            return

        # ── Trainers (create first so we can link trainer_id) ──
        trainers = [
            Trainer(
                id=str(uuid.uuid4()),
                name="Carlos Eduardo (Cadu)",
                phone="27998001001",
                email="cadu@personal.com",
                cref_number="002345-G/ES",
                cref_status=CrefStatus.VERIFIED,
                bio="Especialista em musculação e funcional. 8 anos de experiência.",
                specialties=["strength", "functional"],
                city="Vitória",
                coverage_neighborhoods=["Praia do Canto", "Jardim da Penha", "Mata da Praia"],
                max_travel_radius_km=5.0,
                base_price_per_session=120.00,
                operational_status=TrainerOperationalStatus.ACTIVE,
                avg_rating=4.7,
                acceptance_rate=0.92,
                attendance_rate=0.98,
                total_sessions=45,
            ),
            Trainer(
                id=str(uuid.uuid4()),
                name="Fernanda Oliveira",
                phone="27998001002",
                email="fernanda@personal.com",
                cref_number="003456-G/ES",
                cref_status=CrefStatus.VERIFIED,
                bio="Yoga e pilates. Atendo em estúdio e ao ar livre.",
                specialties=["yoga", "pilates", "stretching"],
                city="Vitória",
                coverage_neighborhoods=["Praia do Canto", "Enseada do Suá", "Jardim Camburi"],
                max_travel_radius_km=8.0,
                base_price_per_session=150.00,
                operational_status=TrainerOperationalStatus.ACTIVE,
                avg_rating=4.9,
                acceptance_rate=0.88,
                attendance_rate=1.0,
                total_sessions=62,
            ),
            Trainer(
                id=str(uuid.uuid4()),
                name="Thiago Souza",
                phone="27998001003",
                email="thiago@personal.com",
                cref_number="004567-G/ES",
                cref_status=CrefStatus.VERIFIED,
                bio="Corrida e funcional ao ar livre. Treinos de alta intensidade.",
                specialties=["running", "functional", "strength"],
                city="Vitória",
                coverage_neighborhoods=["Praia do Canto", "Jardim da Penha", "Enseada do Suá", "Mata da Praia"],
                max_travel_radius_km=10.0,
                base_price_per_session=100.00,
                operational_status=TrainerOperationalStatus.ACTIVE,
                avg_rating=4.5,
                acceptance_rate=0.95,
                attendance_rate=0.96,
                total_sessions=38,
            ),
            Trainer(
                id=str(uuid.uuid4()),
                name="Juliana Martins",
                phone="27998001004",
                cref_number="005678-G/ES",
                cref_status=CrefStatus.PENDING,
                bio="Funcional e emagrecimento.",
                specialties=["functional"],
                city="Vitória",
                coverage_neighborhoods=["Jardim da Penha"],
                base_price_per_session=90.00,
                operational_status=TrainerOperationalStatus.PENDING_REVIEW,
                avg_rating=0,
                acceptance_rate=1.0,
                attendance_rate=1.0,
                total_sessions=0,
            ),
            Trainer(
                id=str(uuid.uuid4()),
                name="Rafael Lima",
                phone="27998001005",
                email="rafael@personal.com",
                cref_number="006789-G/ES",
                cref_status=CrefStatus.VERIFIED,
                bio="Musculação e bodybuilding. Atendo em academias.",
                specialties=["strength"],
                city="Vitória",
                coverage_neighborhoods=["Praia do Canto", "Jardim Camburi", "Mata da Praia"],
                max_travel_radius_km=6.0,
                base_price_per_session=130.00,
                operational_status=TrainerOperationalStatus.ACTIVE,
                avg_rating=4.3,
                acceptance_rate=0.85,
                attendance_rate=0.94,
                total_sessions=27,
            ),
        ]
        for t in trainers:
            db.add(t)
        await db.flush()
        print(f"Created {len(trainers)} trainers")

        # ── Users — 11 accounts covering all roles ──────────
        # Password for everyone: "fitdrop123"
        pw = _hash("fitdrop123")

        users = [
            # ─── ADMIN (1) ───
            User(
                id=str(uuid.uuid4()),
                name="Admin FitDrop",
                phone="27999000001",
                email="admin@fitdrop.com",
                city="Vitória",
                neighborhood="Praia do Canto",
                role=UserRole.ADMIN.value,
                password_hash=pw,
            ),
            # ─── STUDENTS (5) ───
            User(
                id=str(uuid.uuid4()),
                name="Lucas Mendes",
                phone="27999001001",
                email="lucas@email.com",
                city="Vitória",
                neighborhood="Praia do Canto",
                role=UserRole.STUDENT.value,
                password_hash=pw,
            ),
            User(
                id=str(uuid.uuid4()),
                name="Ana Clara Silva",
                phone="27999001002",
                email="ana@email.com",
                city="Vitória",
                neighborhood="Jardim da Penha",
                role=UserRole.STUDENT.value,
                password_hash=pw,
            ),
            User(
                id=str(uuid.uuid4()),
                name="Roberto Alves",
                phone="27999001003",
                email="roberto@email.com",
                city="Vitória",
                neighborhood="Enseada do Suá",
                role=UserRole.STUDENT.value,
                password_hash=pw,
            ),
            User(
                id=str(uuid.uuid4()),
                name="Mariana Costa",
                phone="27999001004",
                email="mariana@email.com",
                city="Vitória",
                neighborhood="Mata da Praia",
                role=UserRole.STUDENT.value,
                password_hash=pw,
            ),
            User(
                id=str(uuid.uuid4()),
                name="Pedro Henrique",
                phone="27999001005",
                email="pedro@email.com",
                city="Vitória",
                neighborhood="Praia do Canto",
                role=UserRole.STUDENT.value,
                password_hash=pw,
            ),
            # ─── TRAINERS (as users) (3 — linked to trainer profiles) ───
            User(
                id=str(uuid.uuid4()),
                name="Carlos Eduardo (Cadu)",
                phone="27999002001",
                email="cadu@fitdrop.com",
                city="Vitória",
                neighborhood="Praia do Canto",
                role=UserRole.TRAINER.value,
                password_hash=pw,
                trainer_id=trainers[0].id,
            ),
            User(
                id=str(uuid.uuid4()),
                name="Fernanda Oliveira",
                phone="27999002002",
                email="fernanda@fitdrop.com",
                city="Vitória",
                neighborhood="Enseada do Suá",
                role=UserRole.TRAINER.value,
                password_hash=pw,
                trainer_id=trainers[1].id,
            ),
            User(
                id=str(uuid.uuid4()),
                name="Thiago Souza",
                phone="27999002003",
                email="thiago@fitdrop.com",
                city="Vitória",
                neighborhood="Jardim da Penha",
                role=UserRole.TRAINER.value,
                password_hash=pw,
                trainer_id=trainers[2].id,
            ),
            # ─── GYM OWNERS (2) ───
            User(
                id=str(uuid.uuid4()),
                name="Marcos Vinícius",
                phone="27999003001",
                email="marcos@smartfit.com",
                city="Vitória",
                neighborhood="Praia do Canto",
                role=UserRole.GYM_OWNER.value,
                password_hash=pw,
            ),
            User(
                id=str(uuid.uuid4()),
                name="Patrícia Santos",
                phone="27999003002",
                email="patricia@academia.com",
                city="Vitória",
                neighborhood="Jardim Camburi",
                role=UserRole.GYM_OWNER.value,
                password_hash=pw,
            ),
        ]
        for u in users:
            db.add(u)
        await db.flush()
        print(f"Created {len(users)} users")

        # ── Availabilities (Mon-Sat mornings + evenings for active trainers) ──
        active_trainers = [t for t in trainers if t.operational_status == TrainerOperationalStatus.ACTIVE]
        avail_count = 0
        for t in active_trainers:
            for day in range(6):  # Mon(0) to Sat(5)
                # Morning slot
                db.add(
                    TrainerAvailability(
                        id=str(uuid.uuid4()),
                        trainer_id=t.id,
                        day_of_week=day,
                        start_time=time(6, 0),
                        end_time=time(12, 0),
                        recurrence_type=RecurrenceType.WEEKLY,
                        valid_from=date(2026, 1, 1),
                    )
                )
                avail_count += 1
                # Evening slot
                db.add(
                    TrainerAvailability(
                        id=str(uuid.uuid4()),
                        trainer_id=t.id,
                        day_of_week=day,
                        start_time=time(16, 0),
                        end_time=time(21, 0),
                        recurrence_type=RecurrenceType.WEEKLY,
                        valid_from=date(2026, 1, 1),
                    )
                )
                avail_count += 1
        await db.flush()
        print(f"Created {avail_count} availability slots")

        # ── Sample session requests (from student users) ───
        # Students are users[1] through users[5]
        requests = [
            SessionRequest(
                id=str(uuid.uuid4()),
                user_id=users[1].id,  # Lucas
                requested_date=date(2026, 4, 14),  # Monday
                requested_time_start=time(7, 0),
                requested_time_end=time(8, 0),
                neighborhood="Praia do Canto",
                venue_type=VenueType.GYM,
                modality=Modality.STRENGTH,
                urgency=Urgency.STANDARD,
                notes="Quero focar em treino de peito e costas",
                lead_source=LeadSource.LANDING_PAGE,
            ),
            SessionRequest(
                id=str(uuid.uuid4()),
                user_id=users[2].id,  # Ana Clara
                requested_date=date(2026, 4, 14),
                requested_time_start=time(8, 0),
                requested_time_end=time(9, 0),
                neighborhood="Jardim da Penha",
                venue_type=VenueType.OUTDOOR,
                modality=Modality.RUNNING,
                urgency=Urgency.STANDARD,
                lead_source=LeadSource.WHATSAPP,
            ),
            SessionRequest(
                id=str(uuid.uuid4()),
                user_id=users[3].id,  # Roberto
                requested_date=date(2026, 4, 15),
                requested_time_start=time(17, 0),
                requested_time_end=time(18, 0),
                neighborhood="Enseada do Suá",
                venue_type=VenueType.HOTEL,
                venue_details="Hotel Senac, academia do 2o andar",
                modality=Modality.FUNCTIONAL,
                urgency=Urgency.URGENT,
                lead_source=LeadSource.REFERRAL,
            ),
        ]
        for sr in requests:
            db.add(sr)
        await db.flush()
        print(f"Created {len(requests)} session requests")

        # ── Gyms ──
        gyms = [
            Gym(
                id=str(uuid.uuid4()),
                name="Smart Fit — Praia do Canto",
                owner_id=users[9].id,  # Marcos Vinícius
                cnpj="12.345.678/0001-01",
                phone="2733001001",
                email="praiadocanto@smartfit.com",
                description="Academia completa com musculação, funcional, spinning e aulas coletivas. Equipamentos de última geração.",
                city="Vitória",
                neighborhood="Praia do Canto",
                address="Rua Aleixo Netto, 1200 — Praia do Canto, Vitória/ES",
                lat=-20.2978,
                lng=-40.2921,
                photo_url="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
                photos=[
                    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
                    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
                    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800",
                ],
                operating_hours={
                    "seg": "06:00–22:00", "ter": "06:00–22:00", "qua": "06:00–22:00",
                    "qui": "06:00–22:00", "sex": "06:00–22:00", "sab": "08:00–14:00",
                    "dom": "Fechado",
                },
                amenities=["Musculação", "Funcional", "Spinning", "Vestiário", "Estacionamento"],
                gym_type="gym",
                avg_rating=4.3,
                total_reviews=2,
            ),
            Gym(
                id=str(uuid.uuid4()),
                name="Bodytech — Enseada do Suá",
                owner_id=users[9].id,  # Marcos
                phone="2733001002",
                email="enseada@bodytech.com",
                description="Premium fitness com piscina, spa e área funcional ao ar livre.",
                city="Vitória",
                neighborhood="Enseada do Suá",
                address="Av. Nossa Sra. dos Navegantes, 451 — Enseada do Suá, Vitória/ES",
                lat=-20.3028,
                lng=-40.2887,
                photo_url="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
                photos=[
                    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
                    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800",
                ],
                operating_hours={
                    "seg": "05:30–23:00", "ter": "05:30–23:00", "qua": "05:30–23:00",
                    "qui": "05:30–23:00", "sex": "05:30–23:00", "sab": "07:00–16:00",
                    "dom": "08:00–13:00",
                },
                amenities=["Musculação", "Piscina", "Spa", "Funcional", "Yoga", "Pilates"],
                gym_type="gym",
                avg_rating=4.6,
                total_reviews=1,
            ),
            Gym(
                id=str(uuid.uuid4()),
                name="Bluefit — Jardim Camburi",
                owner_id=users[10].id,  # Patrícia (gym_owner #2)
                phone="2733001003",
                email="camburi@bluefit.com",
                description="Academia acessível com ótimo custo-benefício. Equipamentos novos e equipe qualificada.",
                city="Vitória",
                neighborhood="Jardim Camburi",
                address="Av. Dante Micheline, 800 — Jardim Camburi, Vitória/ES",
                lat=-20.2659,
                lng=-40.2711,
                photo_url="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800",
                photos=[
                    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800",
                ],
                operating_hours={
                    "seg": "06:00–22:00", "ter": "06:00–22:00", "qua": "06:00–22:00",
                    "qui": "06:00–22:00", "sex": "06:00–22:00", "sab": "08:00–14:00",
                    "dom": "Fechado",
                },
                amenities=["Musculação", "Funcional", "Aulas coletivas"],
                gym_type="gym",
                avg_rating=4.1,
                total_reviews=1,
            ),
            Gym(
                id=str(uuid.uuid4()),
                name="Arena Funcional — Jardim da Penha",
                owner_id=users[10].id,  # Patrícia
                phone="2733001004",
                description="Espaço ao ar livre focado em treinamento funcional e crossfit.",
                city="Vitória",
                neighborhood="Jardim da Penha",
                address="Praça Philogômio Pereira, s/n — Jardim da Penha, Vitória/ES",
                lat=-20.2831,
                lng=-40.2942,
                photo_url="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800",
                operating_hours={
                    "seg": "06:00–20:00", "ter": "06:00–20:00", "qua": "06:00–20:00",
                    "qui": "06:00–20:00", "sex": "06:00–20:00", "sab": "07:00–12:00",
                    "dom": "Fechado",
                },
                amenities=["Funcional", "Crossfit", "Ao ar livre"],
                gym_type="outdoor",
                avg_rating=4.5,
                total_reviews=1,
            ),
            Gym(
                id=str(uuid.uuid4()),
                name="Studio Pilates — Praia do Canto",
                owner_id=users[9].id,  # Marcos
                phone="2733001005",
                email="pilates@studio.com",
                description="Estúdio intimista com turmas pequenas. Pilates clássico e contemporâneo.",
                city="Vitória",
                neighborhood="Praia do Canto",
                address="Rua Chapot Presvot, 360 — Praia do Canto, Vitória/ES",
                lat=-20.2951,
                lng=-40.2869,
                photo_url="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
                operating_hours={
                    "seg": "07:00–21:00", "ter": "07:00–21:00", "qua": "07:00–21:00",
                    "qui": "07:00–21:00", "sex": "07:00–21:00", "sab": "08:00–13:00",
                    "dom": "Fechado",
                },
                amenities=["Pilates", "Yoga", "Alongamento"],
                gym_type="studio",
                avg_rating=4.8,
                total_reviews=1,
            ),
        ]
        for g in gyms:
            db.add(g)
        await db.flush()
        print(f"Created {len(gyms)} gyms")

        # ── Gym-Trainer links ──
        gym_trainer_links = [
            GymTrainer(id=str(uuid.uuid4()), gym_id=gyms[0].id, trainer_id=trainers[0].id, status="active"),
            GymTrainer(id=str(uuid.uuid4()), gym_id=gyms[0].id, trainer_id=trainers[2].id, status="active"),
            GymTrainer(id=str(uuid.uuid4()), gym_id=gyms[0].id, trainer_id=trainers[4].id, status="active"),
            GymTrainer(id=str(uuid.uuid4()), gym_id=gyms[1].id, trainer_id=trainers[1].id, status="active"),
            GymTrainer(id=str(uuid.uuid4()), gym_id=gyms[1].id, trainer_id=trainers[2].id, status="active"),
            GymTrainer(id=str(uuid.uuid4()), gym_id=gyms[2].id, trainer_id=trainers[1].id, status="active"),
            GymTrainer(id=str(uuid.uuid4()), gym_id=gyms[2].id, trainer_id=trainers[4].id, status="active"),
            GymTrainer(id=str(uuid.uuid4()), gym_id=gyms[3].id, trainer_id=trainers[0].id, status="active"),
            GymTrainer(id=str(uuid.uuid4()), gym_id=gyms[3].id, trainer_id=trainers[2].id, status="active"),
            GymTrainer(id=str(uuid.uuid4()), gym_id=gyms[4].id, trainer_id=trainers[1].id, status="active"),
        ]
        for gt in gym_trainer_links:
            db.add(gt)
        await db.flush()
        print(f"Created {len(gym_trainer_links)} gym-trainer links")

        # ── Coupons ──
        coupons = [
            Coupon(
                id=str(uuid.uuid4()), gym_id=gyms[0].id, code="SMART20",
                description="20% de desconto na primeira sessão na Smart Fit",
                discount_type="percentage", discount_value=20.0,
                is_active=True,
            ),
            Coupon(
                id=str(uuid.uuid4()), gym_id=gyms[0].id, code="BEM-VINDO",
                description="R$30 off para novos alunos",
                discount_type="fixed", discount_value=30.0,
                is_active=True,
            ),
            Coupon(
                id=str(uuid.uuid4()), gym_id=gyms[1].id, code="BODY15",
                description="15% desconto sessão na Bodytech",
                discount_type="percentage", discount_value=15.0,
                is_active=True,
            ),
            Coupon(
                id=str(uuid.uuid4()), gym_id=gyms[4].id, code="PILATES10",
                description="10% desconto aula de pilates",
                discount_type="percentage", discount_value=10.0,
                is_active=True,
            ),
        ]
        for c in coupons:
            db.add(c)
        await db.flush()
        print(f"Created {len(coupons)} coupons")

        # ── Gym Reviews ──
        gym_reviews = [
            GymReview(id=str(uuid.uuid4()), gym_id=gyms[0].id, user_id=users[1].id, rating=4, comment="Boa academia, equipamentos novos. Estacionamento é um pouco apertado."),
            GymReview(id=str(uuid.uuid4()), gym_id=gyms[0].id, user_id=users[2].id, rating=5, comment="Melhor Smart Fit de Vitória! Bem localizada."),
            GymReview(id=str(uuid.uuid4()), gym_id=gyms[1].id, user_id=users[3].id, rating=5, comment="Espaço premium. A piscina é incrível e os professores são muito atenciosos."),
            GymReview(id=str(uuid.uuid4()), gym_id=gyms[2].id, user_id=users[4].id, rating=4, comment="Custo-benefício excelente. Só falta piscina."),
            GymReview(id=str(uuid.uuid4()), gym_id=gyms[3].id, user_id=users[1].id, rating=5, comment="Treinar ao ar livre é outra experiência. Ótima estrutura."),
            GymReview(id=str(uuid.uuid4()), gym_id=gyms[4].id, user_id=users[2].id, rating=5, comment="Melhor estúdio de pilates da região. Turmas pequenas, atendimento personalizado."),
        ]
        for gr in gym_reviews:
            db.add(gr)
        await db.flush()
        print(f"Created {len(gym_reviews)} gym reviews")

        # ── Trainer Reviews (session reviews) ──
        trainer_reviews = [
            Review(id=str(uuid.uuid4()), session_id=str(uuid.uuid4()), user_id=users[1].id, trainer_id=trainers[0].id, rating=5, comment="Cadu é excelente! Muito atencioso e profissional.", experience_tags=["pontual", "motivador", "técnico"]),
            Review(id=str(uuid.uuid4()), session_id=str(uuid.uuid4()), user_id=users[2].id, trainer_id=trainers[0].id, rating=4, comment="Bom treino, mas achei um pouco puxado no começo.", experience_tags=["intenso", "técnico"]),
            Review(id=str(uuid.uuid4()), session_id=str(uuid.uuid4()), user_id=users[3].id, trainer_id=trainers[1].id, rating=5, comment="Fernanda é maravilhosa. Aula de yoga super relaxante.", experience_tags=["calma", "profissional", "atenciosa"]),
            Review(id=str(uuid.uuid4()), session_id=str(uuid.uuid4()), user_id=users[4].id, trainer_id=trainers[1].id, rating=5, comment="Pilates com a Fernanda mudou minha postura.", experience_tags=["técnica", "paciência"]),
            Review(id=str(uuid.uuid4()), session_id=str(uuid.uuid4()), user_id=users[1].id, trainer_id=trainers[2].id, rating=4, comment="Thiago cobra pesado nos treinos. Gostei!", experience_tags=["intenso", "pontual"]),
            Review(id=str(uuid.uuid4()), session_id=str(uuid.uuid4()), user_id=users[5].id, trainer_id=trainers[4].id, rating=4, comment="Rafael entende muito de musculação. Recomendo.", experience_tags=["técnico", "experiente"]),
        ]
        for tr in trainer_reviews:
            db.add(tr)
        await db.flush()
        print(f"Created {len(trainer_reviews)} trainer reviews")

        # ── Favorites ──
        favorites = [
            Favorite(id=str(uuid.uuid4()), user_id=users[1].id, target_type="trainer", target_id=trainers[0].id),
            Favorite(id=str(uuid.uuid4()), user_id=users[1].id, target_type="gym", target_id=gyms[0].id),
            Favorite(id=str(uuid.uuid4()), user_id=users[2].id, target_type="trainer", target_id=trainers[1].id),
            Favorite(id=str(uuid.uuid4()), user_id=users[2].id, target_type="gym", target_id=gyms[4].id),
        ]
        for f in favorites:
            db.add(f)
        await db.flush()
        print(f"Created {len(favorites)} favorites")

        await db.commit()
        print("\nSeed complete!")
        print(f"  Users: {len(users)}")
        print(f"  Trainers: {len(trainers)} ({len(active_trainers)} active)")
        print(f"  Availabilities: {avail_count}")
        print(f"  Session Requests: {len(requests)}")
        print(f"  Gyms: {len(gyms)}")
        print(f"  Gym-Trainer links: {len(gym_trainer_links)}")
        print(f"  Coupons: {len(coupons)}")
        print(f"  Gym Reviews: {len(gym_reviews)}")
        print(f"  Trainer Reviews: {len(trainer_reviews)}")
        print(f"  Favorites: {len(favorites)}")


if __name__ == "__main__":
    asyncio.run(seed())
