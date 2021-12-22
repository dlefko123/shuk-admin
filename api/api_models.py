from __future__ import annotations

from datetime import date
from decimal import Decimal
from enum import auto
from typing import List
from uuid import UUID

from fastapi_utils.enums import StrEnum
from pydantic import BaseModel


class Base(BaseModel):
    class Config:
        orm_mode = True


class Subcategory(Base):
    id: UUID
    category_id: UUID
    name_en: str
    name_he: str


class SubcategoryUpdate(Base):
    category_id: UUID
    name_en: str
    name_he: str


class Category(Base):
    id: UUID
    name_en: str
    name_he: str
    subcategories: List[Subcategory]


class CategoryUpdate(Base):
    name_en: str
    name_he: str


class Tag(Base):
    id: UUID
    tag_group_id: UUID
    name_en: str
    name_he: str


class TagUpdate(Base):
    tag_group_id: UUID
    name_en: str
    name_he: str


class TagGroupType(StrEnum):
    SINGLE = auto()
    MULTI = auto()


class TagGroup(Base):
    id: UUID
    name_en: str
    name_he: str
    type: TagGroupType
    tags: List[Tag]


class TagGroupUpdate(Base):
    name_en: str
    name_he: str
    type: TagGroupType


class LatLng(Base):
    latitude: Decimal
    longitude: Decimal


class Promo(Base):
    id: UUID
    store_id: UUID
    start_date: date
    end_date: date
    description_en: str
    description_he: str
    image_url: str
    is_ad: bool


class PromoUpdate(Base):
    store_id: UUID
    start_date: date
    end_date: date
    description_en: str
    description_he: str
    image_url: str
    is_ad: bool


class Store(Base):
    id: UUID
    subcategory_id: UUID
    name_en: str
    name_he: str
    short_description_en: str
    short_description_he: str
    description_en: str
    description_he: str
    phone: str
    location: LatLng
    tags: List[Tag]
    promos: List[Promo]
    logo_url: str
    image_urls: List[str]


class StoreUpdate(Base):
    subcategory_id: UUID
    name_en: str
    name_he: str
    short_description_en: str
    short_description_he: str
    description_en: str
    description_he: str
    phone: str
    location: LatLng
    logo_url: str
    image_urls: List[str]


class ShukInfo(Base):
    description_en: str
    description_he: str


class UploadedImage(Base):
    url: str
