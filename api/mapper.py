from __future__ import annotations

from typing import List
from uuid import UUID

import api.database_models as m
from api.api_models import *
from api.utils import *
from settings import IMAGE_URL_PREFIX


def to_db_store(id: UUID, store: StoreUpdate) -> m.Store:
    return m.Store(
        id=id,
        subcategory_id=store.subcategory_id,
        name_en=store.name_en,
        name_he=store.name_he,
        short_description_en=store.short_description_en,
        short_description_he=store.short_description_he,
        description_en=store.description_en,
        description_he=store.description_he,
        phone=store.phone,
        latitude=store.location.latitude,
        longitude=store.location.longitude,
        logo_filename=parse_filename(store.logo_url),
        image_filenames=mapl(parse_filename, store.image_urls),
    )


def to_api_store(store: m.Store) -> Store:
    return Store(
        id=store.id,
        subcategory_id=store.subcategory_id,
        name_en=store.name_en,
        name_he=store.name_he,
        short_description_en=store.short_description_en,
        short_description_he=store.short_description_he,
        description_en=store.description_en,
        description_he=store.description_he,
        phone=store.phone,
        location=LatLng(latitude=store.latitude, longitude=store.longitude),
        tags=mapl(Tag.from_orm, store.tags),
        promos=mapl(to_api_promo, store.promos),
        logo_url=f"{IMAGE_URL_PREFIX}/{store.logo_filename}",
        image_urls=mapl(
            lambda fname: f"{IMAGE_URL_PREFIX}/{fname}", store.image_filenames
        ),
    )


def update_db_store(store: m.Store, store_update: StoreUpdate):
    store.subcategory_id = store_update.subcategory_id
    store.name_en = store_update.name_en
    store.name_he = store_update.name_he
    store.short_description_en = store_update.short_description_en
    store.short_description_he = store_update.short_description_he
    store.description_en = store_update.description_en
    store.description_he = store_update.description_he
    store.phone = store_update.phone
    store.latitude = store_update.location.latitude
    store.longitude = store_update.location.longitude
    store.logo_filename = parse_filename(store_update.logo_url)
    store.image_filenames = mapl(parse_filename, store_update.image_urls)


def to_api_promo(promo: m.Promo) -> Promo:
    return Promo(
        id=promo.id,
        store_id=promo.store_id,
        start_date=promo.start_date,
        end_date=promo.end_date,
        description_en=promo.description_en,
        description_he=promo.description_he,
        image_url=f"{IMAGE_URL_PREFIX}/{promo.image_filename}",
        is_ad=promo.is_ad,
    )


def to_db_promo(id: UUID, promo: PromoUpdate) -> m.Promo:
    return m.Promo(
        id=id,
        store_id=promo.store_id,
        start_date=promo.start_date,
        end_date=promo.end_date,
        description_en=promo.description_en,
        description_he=promo.description_he,
        image_filename=parse_filename(promo.image_url),
        is_ad=promo.is_ad,
    )


def update_db_promo(promo: m.Promo, promo_update: PromoUpdate) -> None:
    promo.store_id = promo_update.store_id
    promo.start_date = promo_update.start_date
    promo.end_date = promo_update.end_date
    promo.description_en = promo_update.description_en
    promo.description_he = promo_update.description_he
    promo.image_filename = parse_filename(promo_update.image_url)
    promo.is_ad = promo_update.is_ad
