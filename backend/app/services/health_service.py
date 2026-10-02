from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class HealthService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def check_database(self) -> None:
        """Raises SQLAlchemyError (-> 503) if the database is unreachable."""
        await self.session.execute(text("SELECT 1"))
