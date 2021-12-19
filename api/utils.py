from __future__ import annotations

from typing import Callable, Iterable, List, TypeVar
from uuid import uuid4

from fastapi.exceptions import HTTPException

T1 = TypeVar("T1")
T2 = TypeVar("T2")


def mapl(function: Callable[[T1], T2], iterable: Iterable[T1]) -> List[T2]:
    """Map function to an iterable, return a list.

    The same as builtin `map` function but evaluates eagerly and returns a list."""
    return [function(item) for item in iterable]


def gen_id() -> str:
    return str(uuid4())


def parse_filename(url: str):
    return url.split("/")[-1]


def e409(detail: str = "Request conflicts with existing data"):
    """Return HTTPException with code 409 Conflict."""
    return HTTPException(status_code=409, detail=detail)


def e404(detail: str = "Item not found"):
    """Return HTTPException with code 404 Not Found."""
    return HTTPException(status_code=404, detail=detail)


def e500(detail: str = "Internal error"):
    """Return HTTPException with code 500 Internal Error."""
    return HTTPException(status_code=500, detail=detail)


def e401(detail: str = "Unauthorized"):
    """Return HTTPException with code 401 Unauthorized."""
    return HTTPException(status_code=401, detail=detail)


def e415(detail: str = "Unsupported media type"):
    """Return HTTPException with code 415 Unsupported Media Type."""
    return HTTPException(status_code=415, detail=detail)
