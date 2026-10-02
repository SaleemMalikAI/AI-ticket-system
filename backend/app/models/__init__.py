# Import every model here so Base.metadata knows all tables (Alembic, tests)
from app.models.ticket import Ticket

__all__ = ["Ticket"]
