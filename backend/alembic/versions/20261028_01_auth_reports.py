"""Add user sessions, owner references, and valuation report metadata.

Existing startup/valuation rows are intentionally left unowned. They remain
unavailable through private endpoints until an administrator performs an
explicit, verified ownership assignment.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "20261028_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()

    # Create missing base tables on fresh databases without replacing existing rows.
    # Existing base tables are then extended below using SQLite-safe table rebuilds.
    from models import Base  # noqa: PLC0415

    Base.metadata.create_all(bind=bind)
    inspector = inspect(bind)

    if "owner_id" not in {column["name"] for column in inspector.get_columns("startup_profiles")}:
        with op.batch_alter_table("startup_profiles", recreate="always") as batch:
            batch.add_column(sa.Column("owner_id", sa.Integer(), nullable=True))
            batch.create_foreign_key(
                "fk_startup_profiles_owner_id_users", "users", ["owner_id"], ["id"], ondelete="SET NULL",
            )
        op.create_index("ix_startup_profiles_owner_id", "startup_profiles", ["owner_id"])

    inspector = inspect(bind)
    if "owner_id" not in {column["name"] for column in inspector.get_columns("valuation_results")}:
        with op.batch_alter_table("valuation_results", recreate="always") as batch:
            batch.add_column(sa.Column("owner_id", sa.Integer(), nullable=True))
            batch.create_foreign_key(
                "fk_valuation_results_owner_id_users", "users", ["owner_id"], ["id"], ondelete="SET NULL",
            )
        op.create_index("ix_valuation_results_owner_id", "valuation_results", ["owner_id"])

    inspector = inspect(bind)
    if "assumptions_json" not in {column["name"] for column in inspector.get_columns("valuation_results")}:
        with op.batch_alter_table("valuation_results", recreate="always") as batch:
            batch.add_column(sa.Column("assumptions_json", sa.Text(), nullable=False, server_default="{}"))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    if "valuation_reports" in inspector.get_table_names():
        op.drop_table("valuation_reports")
    if "valuation_results" in inspector.get_table_names():
        columns = {column["name"] for column in inspect(bind).get_columns("valuation_results")}
        if "owner_id" in columns:
            op.drop_index("ix_valuation_results_owner_id", table_name="valuation_results")
            with op.batch_alter_table("valuation_results", recreate="always") as batch:
                batch.drop_constraint("fk_valuation_results_owner_id_users", type_="foreignkey")
                batch.drop_column("owner_id")
    if "startup_profiles" in inspector.get_table_names():
        columns = {column["name"] for column in inspect(bind).get_columns("startup_profiles")}
        if "owner_id" in columns:
            op.drop_index("ix_startup_profiles_owner_id", table_name="startup_profiles")
            with op.batch_alter_table("startup_profiles", recreate="always") as batch:
                batch.drop_constraint("fk_startup_profiles_owner_id_users", type_="foreignkey")
                batch.drop_column("owner_id")
    if "auth_sessions" in inspect(bind).get_table_names():
        op.drop_table("auth_sessions")
    if "users" in inspect(bind).get_table_names():
        op.drop_table("users")
