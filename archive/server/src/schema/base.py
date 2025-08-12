from typing import ClassVar

from pydantic import BaseModel as _BaseModel


class BaseModel(_BaseModel):
    """Extend Pydantic's BaseModel to enable ORM mode"""

    mode_config: ClassVar[dict] = {"from_attributes": True}
