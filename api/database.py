from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

import api.database_models as m
from settings import *

_engine = create_engine(DATABASE_URL)
m.mapper_registry.metadata.create_all(bind=_engine)


@contextmanager
def transaction() -> Generator[Session, None, None]:
    with Session(autocommit=False, autoflush=True, bind=_engine) as db:
        with db.begin():
            yield db
