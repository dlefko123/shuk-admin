from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from typing import List
from uuid import UUID

import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import (
    ARRAY,
    DECIMAL,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Table,
    Text,
)
from sqlalchemy.orm import registry, relationship

mapper_registry: registry = registry()


@mapper_registry.mapped
@dataclass
class Subcategory:
    __tablename__ = "subcategories"
    __sa_dataclass_metadata_key__ = "sa"
    id: UUID = field(metadata={"sa": Column(pg.UUID(as_uuid=True), primary_key=True)})
    category_id: UUID = field(
        metadata={"sa": Column(ForeignKey("categories.id"), nullable=False)}
    )
    name_en: str = field(metadata={"sa": Column(Text, nullable=False)})
    name_he: str = field(metadata={"sa": Column(Text, nullable=False)})
    category: "Category" = field(
        init=False,
        metadata={"sa": relationship("Category", back_populates="subcategories")},
    )
    stores: List[Store] = field(
        default_factory=list, metadata={"sa": relationship("Store")}
    )


@mapper_registry.mapped
@dataclass
class Category:
    __tablename__ = "categories"
    __sa_dataclass_metadata_key__ = "sa"
    id: UUID = field(metadata={"sa": Column(pg.UUID(as_uuid=True), primary_key=True)})
    name_en: str = field(metadata={"sa": Column(Text, nullable=False)})
    name_he: str = field(metadata={"sa": Column(Text, nullable=False)})
    subcategories: List[Subcategory] = field(
        default_factory=list, metadata={"sa": relationship("Subcategory")}
    )


@mapper_registry.mapped
@dataclass
class Promo:
    __tablename__ = "promos"
    __sa_dataclass_metadata_key__ = "sa"
    id: UUID = field(metadata={"sa": Column(pg.UUID(as_uuid=True), primary_key=True)})
    store_id: UUID = field(
        metadata={"sa": Column(ForeignKey("stores.id"), nullable=False)}
    )
    start_date: date = field(metadata={"sa": Column(Date, nullable=False)})
    end_date: date = field(metadata={"sa": Column(Date, nullable=False)})
    description_en: str = field(metadata={"sa": Column(Text, nullable=False)})
    description_he: str = field(metadata={"sa": Column(Text, nullable=False)})
    image_filename: str = field(metadata={"sa": Column(Text, nullable=False)})
    is_ad: bool = field(metadata={"sa": Column(Boolean, nullable=False)})
    store: "Store" = field(
        init=False, metadata={"sa": relationship("Store", back_populates="promos")}
    )


tags_to_stores = Table(
    "tags_to_stores",
    mapper_registry.metadata,
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
    Column("store_id", ForeignKey("stores.id"), primary_key=True),
)


@mapper_registry.mapped
@dataclass
class Tag:
    __tablename__ = "tags"
    __sa_dataclass_metadata_key__ = "sa"
    id: UUID = field(metadata={"sa": Column(pg.UUID(as_uuid=True), primary_key=True)})
    tag_group_id: UUID = field(
        metadata={"sa": Column(ForeignKey("tag_groups.id"), nullable=False)}
    )
    name_en: str = field(metadata={"sa": Column(Text, nullable=False)})
    name_he: str = field(metadata={"sa": Column(Text, nullable=False)})
    tag_group: "TagGroup" = field(
        init=False, metadata={"sa": relationship("TagGroup", back_populates="tags")}
    )
    stores: List["Store"] = field(
        default_factory=list,
        metadata={
            "sa": relationship("Store", secondary=tags_to_stores, back_populates="tags")
        },
    )


@mapper_registry.mapped
@dataclass
class TagGroup:
    __tablename__ = "tag_groups"
    __sa_dataclass_metadata_key__ = "sa"
    id: UUID = field(metadata={"sa": Column(pg.UUID(as_uuid=True), primary_key=True)})
    name_en: str = field(metadata={"sa": Column(Text, nullable=False)})
    name_he: str = field(metadata={"sa": Column(Text, nullable=False)})
    type: str = field(metadata={"sa": Column(Text, nullable=False)})
    tags: List[Tag] = field(default_factory=list, metadata={"sa": relationship("Tag")})


@mapper_registry.mapped
@dataclass
class Store:
    __tablename__ = "stores"
    __sa_dataclass_metadata_key__ = "sa"
    id: UUID = field(metadata={"sa": Column(pg.UUID(as_uuid=True), primary_key=True)})
    subcategory_id: UUID = field(
        metadata={"sa": Column(ForeignKey("subcategories.id"), nullable=False)}
    )
    name_en: str = field(metadata={"sa": Column(Text, nullable=False)})
    name_he: str = field(metadata={"sa": Column(Text, nullable=False)})
    short_description_en: str = field(metadata={"sa": Column(Text, nullable=False)})
    short_description_he: str = field(metadata={"sa": Column(Text, nullable=False)})
    description_en: str = field(metadata={"sa": Column(Text, nullable=False)})
    description_he: str = field(metadata={"sa": Column(Text, nullable=False)})
    phone: str = field(metadata={"sa": Column(Text, nullable=False)})
    latitude: Decimal = field(metadata={"sa": Column(DECIMAL, nullable=False)})
    longitude: Decimal = field(metadata={"sa": Column(DECIMAL, nullable=False)})
    logo_filename: str = field(metadata={"sa": Column(Text, nullable=False)})
    image_filenames: List[str] = field(
        metadata={"sa": Column(ARRAY(Text), nullable=False)}
    )
    subcategory: "Subcategory" = field(
        init=False,
        metadata={"sa": relationship("Subcategory", back_populates="stores")},
    )
    promos: List[Promo] = field(
        default_factory=list, metadata={"sa": relationship("Promo")}
    )
    tags: List[Tag] = field(
        default_factory=list,
        metadata={
            "sa": relationship("Tag", secondary=tags_to_stores, back_populates="stores")
        },
    )


@mapper_registry.mapped
@dataclass
class ShukInfo:
    __tablename__ = "shuk_info"
    __sa_dataclass_metadata_key__ = "sa"
    id: UUID = field(metadata={"sa": Column(pg.UUID(as_uuid=True), primary_key=True)})
    description_en: str = field(metadata={"sa": Column(Text, nullable=False)})
    description_he: str = field(metadata={"sa": Column(Text, nullable=False)})


@mapper_registry.mapped
@dataclass
class TmpImage:
    __tablename__ = "tmp_images"
    __sa_dataclass_metadata_key__ = "sa"
    filename: str = field(metadata={"sa": Column(Text, primary_key=True)})
    uploaded_at: datetime = field(metadata={"sa": Column(DateTime, nullable=False)})


@mapper_registry.mapped
@dataclass
class ExpiredImage:
    __tablename__ = "expired_images"
    __sa_dataclass_metadata_key__ = "sa"
    filename: str = field(metadata={"sa": Column(Text, primary_key=True)})
    expired_at: datetime = field(metadata={"sa": Column(DateTime, nullable=False)})


@mapper_registry.mapped
@dataclass
class Token:
    __tablename__ = "tokens"
    __sa_dataclass_metadata_key__ = "sa"
    id: UUID = field(metadata={"sa": Column(pg.UUID(as_uuid=True), primary_key=True)})
    email: str = field(metadata={"sa": Column(Text, nullable=False)})
    issued_at: datetime = field(metadata={"sa": Column(DateTime, nullable=False)})
    last_used_at: datetime = field(metadata={"sa": Column(DateTime, nullable=False)})
