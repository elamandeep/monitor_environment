from pydantic import BaseModel
from typing import Generic, Optional, TypeVar

T = TypeVar("T")


class Response(BaseModel, Generic[T]):
    successMesssage: Optional[str] = None
    errorMessage: Optional[str] = None
    data: Optional[T] = None


class RequestedData(BaseModel):
    polygon: list
    years: list[int]


class GraphModel(BaseModel):
    year: Optional[int] = None
    columns: list[str]
    values: list
