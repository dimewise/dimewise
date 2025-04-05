from litestar.plugins.sqlalchemy import base


class Base(base.UUIDAuditBase):
    __abstract__ = True
