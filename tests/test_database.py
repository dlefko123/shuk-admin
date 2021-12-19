import random
from dataclasses import fields
from datetime import timedelta
from uuid import uuid4

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm.session import Session

from api.database_models import *
from settings import *


def randint():
    return random.randint(100, 999)


def generate(dataclass_type, **fixed_fields):
    """Return a randomly generated object of a given dataclass."""
    d = {}
    for field in fields(dataclass_type):
        k, v = field.name, field.type
        if v == "int":
            d[k] = randint()
        elif v == "str":
            d[k] = f"str {randint()}"
        elif v == "UUID":
            d[k] = uuid4()
        elif v == "date":
            d[k] = date(2020, 1, 1) + timedelta(randint())
        elif v == "Decimal":
            d[k] = Decimal(randint()) / 10
        elif v == "bool":
            d[k] = bool(random.randint(0, 1))
    d.update(fixed_fields)
    return dataclass_type(**d)


@pytest.fixture
def empty_db_session():
    """Drop test schema, return the database engine"""
    engine = create_engine(TEST_DATABASE_URL)
    engine.execute(f"drop schema if exists {TEST_DATABASE_SCHEMA} cascade")
    engine.execute(f"create schema {TEST_DATABASE_SCHEMA}")
    mapper_registry.metadata.create_all(engine)
    with Session(autocommit=False, autoflush=True, bind=engine) as session:
        with session.begin():
            yield session


def test_database_schema(empty_db_session: Session):
    """Add test data to the database

    This test tries to add various randomly generated
    database model instances to the database and see if
    insertion completes without fail."""

    db = empty_db_session

    # Categories with subcategories
    cat1 = generate(Category)
    cat2 = generate(Category)
    sub11 = generate(Subcategory, category_id=cat1.id)
    sub12 = generate(Subcategory, category_id=cat1.id)
    cat1.subcategories = [sub11, sub12]
    db.add(cat1)
    db.add(cat2)

    # Tag groups with tags
    tg1 = generate(TagGroup)
    tg2 = generate(TagGroup)
    tg3 = generate(TagGroup)
    tag11 = generate(Tag, tag_group_id=tg1.id)
    tag12 = generate(Tag, tag_group_id=tg1.id)
    tag21 = generate(Tag, tag_group_id=tg2.id)
    tg1.tags = [tag11, tag12]
    tg2.tags = [tag21]
    db.add(tg1)
    db.add(tg2)
    db.add(tg3)

    # Stores with promos
    img = "nonexistent.jpeg"
    st1 = generate(Store, subcategory_id=sub11.id, logo_filename=img, image_filenames=[])
    st2 = generate(Store, subcategory_id=sub11.id, logo_filename=img, image_filenames=[])
    st3 = generate(Store, subcategory_id=sub12.id, logo_filename=img, image_filenames=[])
    pr11 = generate(Promo, image_filename=img, store_id=st1)
    pr12 = generate(Promo, image_filename=img, store_id=st1)
    pr21 = generate(Promo, image_filename=img, store_id=st2)
    st1.promos = [pr11, pr12]
    st2.promos = [pr21]
    db.add(st1)
    db.add(st2)
    db.add(st3)
    st2.tags = [tag12, tag21]
    st3.tags = [tag11, tag12, tag21]

    # General info record
    db.add(ShukInfo(SHUK_INFO_TABLE_ID, "description en", "description he"))
