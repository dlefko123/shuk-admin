from __future__ import annotations

import urllib.parse
from datetime import datetime, timedelta
from typing import List
from uuid import UUID

import boto3
import requests
from fastapi import Depends, FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from fastapi_utils.tasks import repeat_every
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from starlette.responses import RedirectResponse

import api.database_models as m
import api.mapper as mapper
from api.api_models import *
from api.database import *
from api.utils import *
from settings import *


def verify_new_and_expire_old_images(
    db: Session, new_urls: List[str], current_filenames: List[str]
) -> None:
    """Check if all new_urls are valid -- i.e. are either from the
    current_filenames list of one of temporary images. If ok,
    expire images that will not be used any longer."""
    tmp_filenames = [img.filename for img in db.query(m.TmpImage).all()]
    new_filenames = mapl(parse_filename, new_urls)
    bad_filenames = set(new_filenames) - set(current_filenames) - set(tmp_filenames)
    bad_urls = mapl(lambda fname: f"{IMAGE_URL_PREFIX}/{fname}", bad_filenames)
    if bad_urls:
        raise e409(f"Bad image URLs: {bad_urls=}")
    tmp_to_delete = set(tmp_filenames) & (set(new_filenames) - set(current_filenames))
    if tmp_to_delete:
        db.query(m.TmpImage).filter(m.TmpImage.filename.in_(tmp_to_delete)).delete()
    for filename in set(current_filenames) - set(new_filenames):
        db.add(m.ExpiredImage(filename, datetime.utcnow()))


app = FastAPI(
    docs_url=f"{ADMIN_API_PATH_PREFIX}/docs",
    redoc_url=f"{ADMIN_API_PATH_PREFIX}/redoc",
    openapi_url=f"{ADMIN_API_PATH_PREFIX}/openapi.json",
)
bearer = HTTPBearer()

origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def authorize_admin(auth: HTTPAuthorizationCredentials = Depends(bearer)) -> None:
    try:
        id = UUID(auth.credentials)
    except Exception:
        raise e401("Bearer token can't be parsed, must be an UUID")
    with transaction() as db:
        token = db.get(m.Token, ident=id)
        if not token:
            raise e401("Invalid bearer token")
        if token.email not in ALLOWED_ADMIN_EMAILS:
            raise e401("Not an admin account")
        token.last_used_at = datetime.utcnow()


@app.get("/", tags=["public"])
def get_status() -> None:
    pass


@app.get(ADMIN_API_PATH_PREFIX + "/admin/login", tags=["auth"])
def login_redirect():
    """This endpoint will redirest to Google single sign-on page.
    Once the user logs in, they will be redirected back to the
    admin app (exact URL to be determined). The redirect will
    pass the access token as a page fragment parameter, i.e.
    `https://<ADMIN_APP_URL>#access_token=<access_token>`.
    This bearer token then can be used to access all API
    endpoints. In order to use the token, add an
    `Authorization` header with value `Bearer <token>`."""
    params_encoded = urllib.parse.urlencode(
        {
            "response_type": "code",
            "client_id": GOOGLE_CLIENT_ID,
            "scope": "https://www.googleapis.com/auth/userinfo.email",
            "redirect_uri": f"{API_BASE_PATH}{ADMIN_API_PATH_PREFIX}/admin/login-callback",
        }
    )
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + params_encoded
    return RedirectResponse(url=url)


@app.get(ADMIN_API_PATH_PREFIX + "/admin/login-callback", tags=["auth"])
def login_callback(code: str = "", error: str = ""):
    if error:
        raise e401(error)
    if not code:
        raise e500("Something went wrong while trying to authorize")
    r = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": f"{API_BASE_PATH}{ADMIN_API_PATH_PREFIX}/admin/login-callback",
        },
    )
    if r.status_code != 200:
        raise e401("Failed to authorize: " + r.text)
    access_token = r.json()["access_token"]
    r = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    if r.status_code != 200:
        raise e401("Failed to authorize: " + r.text)
    email = r.json()["email"]
    if email not in ALLOWED_ADMIN_EMAILS:
        raise e401("Not an admin account")
    with transaction() as db:
        now = datetime.utcnow()
        token = m.Token(gen_id(), email, now, now)
        db.add(token)
        return RedirectResponse(
            url=f"{ADMIN_APP_LOGIN_CALLBACK_URL}#access_token={token.id}"
        )


@app.get(ADMIN_API_PATH_PREFIX + "/client", tags=["auth"])
def get_client_page():
    """This page is just a stand-in for the admin app.
    It extracts the bearer token from the URL fragment
    and shows it on the page. See the description of
    `/admin/login` endpoint."""
    return HTMLResponse(
        status_code=200,
        content="""
            <script type="text/javascript">
                var token = window.location.href.split("access_token=").at(-1);
                document.write("Your bearer token is <b>" + token + "</b>");
            </script>
            """,
    )


@app.get(
    ADMIN_API_PATH_PREFIX + "/subcategories",
    tags=["subcategory"],
    response_model=List[Subcategory],
)
def get_subcategories() -> List[Subcategory]:
    """Get all subcategories."""
    with transaction() as db:
        return mapl(Subcategory.from_orm, db.query(m.Subcategory).all())


@app.get(
    ADMIN_API_PATH_PREFIX + "/subcategories/{id}",
    tags=["subcategory"],
    response_model=Subcategory,
)
def get_subcategory(id: UUID) -> Subcategory:
    """Get one subcategory."""
    with transaction() as db:
        subcategory = db.get(m.Subcategory, ident=id)
        if not subcategory:
            raise e404()
        return Subcategory.from_orm(subcategory)


@app.post(
    ADMIN_API_PATH_PREFIX + "/subcategories",
    tags=["subcategory"],
    response_model=Subcategory,
)
def add_subcategory(
    subcategory_update: SubcategoryUpdate,
    _: None = Depends(authorize_admin),
) -> Subcategory:
    """Add a new subcategory. `category_id` must refer to an existing category ID."""
    with transaction() as db:
        id = gen_id()
        if not db.get(m.Category, subcategory_update.category_id):
            raise e409(f"Invalid category_id. Category {id=} does not exist")
        db.add(m.Subcategory(id=id, **subcategory_update.dict()))
        subcategory = db.get(m.Subcategory, ident=id)
        return Subcategory.from_orm(subcategory)


@app.patch(ADMIN_API_PATH_PREFIX + "/subcategories/{id}", tags=["subcategory"])
def update_subcategory(
    id: UUID,
    subcategory_update: SubcategoryUpdate,
    _: str = Depends(authorize_admin),
) -> Subcategory:
    """Update a subcategory."""
    with transaction() as db:
        subcategory = db.get(m.Subcategory, ident=id)
        if not subcategory:
            raise e404()
        if not db.get(m.Category, subcategory_update.category_id):
            raise e409(f"Invalid category_id. Category {id=} does not exist")
        for k, v in subcategory_update.dict().items():
            setattr(subcategory, k, v)
        return Subcategory.from_orm(subcategory)


@app.delete(ADMIN_API_PATH_PREFIX + "/subcategories/{id}", tags=["subcategory"])
def delete_subcategory(id: UUID, _: str = Depends(authorize_admin)) -> None:
    """Delete a subcategory."""
    with transaction() as db:
        subcategory = db.get(m.Subcategory, ident=id)
        if not subcategory:
            raise e404()
        db.delete(subcategory)


@app.get("/categories", tags=["public"], response_model=List[Category])
@app.get(
    ADMIN_API_PATH_PREFIX + "/categories",
    tags=["category"],
    response_model=List[Category],
)
def get_categories() -> List[Category]:
    """Get all categories with subcategories."""
    with transaction() as db:
        return mapl(
            Category.from_orm,
            db.query(m.Category).options(joinedload(m.Category.subcategories)).all(),
        )


@app.get(
    ADMIN_API_PATH_PREFIX + "/categories/{id}",
    tags=["category"],
    response_model=Category,
)
def get_category(id: UUID) -> Category:
    """Get one category with its subcategories."""
    with transaction() as db:
        category = db.get(m.Category, ident=id)
        if not category:
            raise e404()
        return Category.from_orm(category)


@app.post(
    ADMIN_API_PATH_PREFIX + "/categories", tags=["category"], response_model=Category
)
def add_category(
    category_update: CategoryUpdate,
    _: None = Depends(authorize_admin),
) -> Category:
    """Add a new category."""
    with transaction() as db:
        id = gen_id()
        db.add(m.Category(id=id, **category_update.dict()))
        category = db.get(m.Category, ident=id)
        return Category.from_orm(category)


@app.patch(ADMIN_API_PATH_PREFIX + "/categories/{id}", tags=["category"])
def update_category(
    id: UUID,
    category_update: CategoryUpdate,
    _: str = Depends(authorize_admin),
) -> Category:
    """Update a category."""
    with transaction() as db:
        category = db.get(m.Category, ident=id)
        if not category:
            raise e404()
        for k, v in category_update.dict().items():
            setattr(category, k, v)
        category = db.get(m.Category, ident=id)
        return Category.from_orm(category)


@app.delete(ADMIN_API_PATH_PREFIX + "/categories/{id}", tags=["category"])
def delete_category(id: UUID, _: str = Depends(authorize_admin)) -> None:
    """Delete a category. All its subcategories must be deleted first."""
    with transaction() as db:
        category = db.get(m.Category, ident=id)
        if not category:
            raise e404()
        if category.subcategories:
            raise e409(
                "Can't delete a category that has subcategories. Delete the subcategories first."
            )
        db.delete(category)


@app.get(ADMIN_API_PATH_PREFIX + "/tags", tags=["tag"], response_model=List[Tag])
def get_tags() -> List[Tag]:
    """Get all tags."""
    with transaction() as db:
        return mapl(Tag.from_orm, db.query(m.Tag).all())


@app.get(ADMIN_API_PATH_PREFIX + "/tags/{id}", tags=["tag"], response_model=Tag)
def get_tag(id: UUID) -> Tag:
    """Get one tag."""
    with transaction() as db:
        tag = db.get(m.Tag, ident=id)
        if not tag:
            raise e404()
        return Tag.from_orm(tag)


@app.post(ADMIN_API_PATH_PREFIX + "/tags", tags=["tag"], response_model=Tag)
def add_tag(
    tag_update: TagUpdate,
    _: None = Depends(authorize_admin),
) -> Tag:
    """Add a new tag. `tag_goup_id` must refer to an existing tag group ID."""
    with transaction() as db:
        id = gen_id()
        if not db.get(m.TagGroup, ident=tag_update.tag_group_id):
            raise e409(f"Invalid tag_group_id. Tag group {id=} does not exist")
        db.add(m.Tag(id=id, **tag_update.dict()))
        tag = db.get(m.Tag, ident=id)
        return Tag.from_orm(tag)


@app.patch(ADMIN_API_PATH_PREFIX + "/tags/{id}", tags=["tag"])
def update_tag(
    id: UUID,
    tag_update: TagUpdate,
    _: str = Depends(authorize_admin),
) -> Tag:
    """Update a tag. `tag_group_id` must refer to an existing tag group ID."""
    with transaction() as db:
        tag = db.get(m.Tag, ident=id)
        if not tag:
            raise e404()
        if not db.get(m.TagGroup, ident=tag_update.tag_group_id):
            raise e409(f"Invalid tag_group_id. Tag group {id=} does not exist")
        for k, v in tag_update.dict().items():
            setattr(tag, k, v)
        tag = db.get(m.Tag, ident=id)
        return Tag.from_orm(tag)


@app.delete(ADMIN_API_PATH_PREFIX + "/tags/{id}", tags=["tag"])
def delete_tag(id: UUID, _: str = Depends(authorize_admin)) -> None:
    """Delete a tag."""
    with transaction() as db:
        tag = db.get(m.Tag, ident=id)
        if not tag:
            raise e404()
        db.delete(tag)


@app.get("/tag-groups", tags=["public"], response_model=List[TagGroup])
@app.get(
    ADMIN_API_PATH_PREFIX + "/tag-groups",
    tags=["tag_group"],
    response_model=List[TagGroup],
)
def get_tag_groups() -> List[TagGroup]:
    """Get all tag groups with tags."""
    with transaction() as db:
        return mapl(
            mapper.to_api_tag_group,
            db.query(m.TagGroup).options(joinedload(m.TagGroup.tags)).all(),
        )


@app.get(
    ADMIN_API_PATH_PREFIX + "/tag-groups/{id}",
    tags=["tag_group"],
    response_model=TagGroup,
)
def get_tag_group(id: UUID) -> TagGroup:
    """Get one tag group with its tags."""
    with transaction() as db:
        tag_group = db.get(m.TagGroup, ident=id)
        if not tag_group:
            raise e404()
        return mapper.to_api_tag_group(tag_group)


@app.post(
    ADMIN_API_PATH_PREFIX + "/tag-groups", tags=["tag_group"], response_model=TagGroup
)
def add_tag_group(
    tag_group_update: TagGroupUpdate,
    _: None = Depends(authorize_admin),
) -> TagGroup:
    """Add a new tag group."""
    with transaction() as db:
        id = gen_id()
        db.add(mapper.to_db_tag_group(id, tag_group_update))
        tag_group = db.get(m.TagGroup, ident=id)
        return mapper.to_api_tag_group(tag_group)


@app.patch(ADMIN_API_PATH_PREFIX + "/tag-groups/{id}", tags=["tag_group"])
def update_tag_group(
    id: UUID,
    tag_group_update: TagGroupUpdate,
    _: str = Depends(authorize_admin),
) -> TagGroup:
    """Update a tag group."""
    with transaction() as db:
        tag_group = db.get(m.TagGroup, ident=id)
        if not tag_group:
            raise e404()
        mapper.update_db_tag_group(tag_group, tag_group_update)
        tag_group = db.get(m.TagGroup, ident=id)
        return mapper.to_api_tag_group(tag_group)


@app.delete(ADMIN_API_PATH_PREFIX + "/tag-groups/{id}", tags=["tag_group"])
def delete_tag_group(id: UUID, _: str = Depends(authorize_admin)) -> None:
    """Delete a tag group. All its tags must be deleted first."""
    with transaction() as db:
        tag_group = db.get(m.TagGroup, ident=id)
        if not tag_group:
            raise e404()
        if tag_group.tags:
            raise e409(
                "Can't delete a tag group that has tags. Delete associated tags first."
            )
        db.delete(tag_group)


@app.get(ADMIN_API_PATH_PREFIX + "/promos", tags=["promo"], response_model=List[Promo])
def get_promos() -> List[Promo]:
    """Get all promos."""
    with transaction() as db:
        promos = db.query(m.Promo).all()
        return mapl(mapper.to_api_promo, promos)


@app.get(ADMIN_API_PATH_PREFIX + "/promos/{id}", tags=["promo"], response_model=Promo)
def get_promo(id: UUID) -> Promo:
    """Get one promo."""
    with transaction() as db:
        promo = db.get(m.Promo, ident=id)
        if not promo:
            raise e404()
        return mapper.to_api_promo(promo)


@app.post(ADMIN_API_PATH_PREFIX + "/promos", tags=["promo"], response_model=Promo)
def add_promo(
    promo_update: PromoUpdate,
    _: None = Depends(authorize_admin),
) -> Promo:
    """Add a new promo. `store_id` must refer to an existing store ID.
    `image_url` must refer to an image that was recently uploaded
    via `/images` endpoint and not used for any other promo or store."""
    with transaction() as db:
        id = gen_id()
        if not db.get(m.Store, ident=promo_update.store_id):
            raise e409(f"Invalid store_id. Store {id=} does not exist")
        verify_new_and_expire_old_images(db, [promo_update.image_url], [])
        db.add(mapper.to_db_promo(id, promo_update))
        promo = db.get(m.Promo, ident=id)
        return mapper.to_api_promo(promo)


@app.patch(ADMIN_API_PATH_PREFIX + "/promos/{id}", tags=["promo"])
def update_promo(
    id: UUID,
    promo_update: PromoUpdate,
    _: str = Depends(authorize_admin),
) -> Promo:
    """Update a promo. `image_url` must refer to either the current
    promo `image_url` or a URL of an image that was recently uploaded
    via `/iamges` endpoint."""
    with transaction() as db:
        promo = db.get(m.Promo, ident=id)
        if not promo:
            raise e404(f"Promo with {id=} not found")
        if not db.get(m.Store, ident=promo_update.store_id):
            raise e409(f"Invalid store_id. Store {id=} does not exist")
        verify_new_and_expire_old_images(
            db, [promo_update.image_url], [promo.image_filename]
        )
        mapper.update_db_promo(promo, promo_update)
        return mapper.to_api_promo(promo)


@app.delete(ADMIN_API_PATH_PREFIX + "/promos/{id}", tags=["promo"])
def delete_promo(id: UUID, _: str = Depends(authorize_admin)) -> None:
    """Delete a promo."""
    with transaction() as db:
        promo = db.get(m.Promo, ident=id)
        if not promo:
            raise e404()
        verify_new_and_expire_old_images(db, [], [promo.image_filename])
        db.delete(promo)


@app.get("/stores", tags=["public"], response_model=List[Store])
@app.get(ADMIN_API_PATH_PREFIX + "/stores", tags=["store"], response_model=List[Store])
def get_stores() -> List[Store]:
    """Get all stores with promos."""
    with transaction() as db:
        return mapl(
            mapper.to_api_store,
            db.query(m.Store)
            .options(joinedload(m.Store.tags), joinedload(m.Store.promos))
            .all(),
        )


@app.get(ADMIN_API_PATH_PREFIX + "/stores/{id}", tags=["store"], response_model=Store)
def get_store(id: UUID) -> Store:
    """Get one store with its promos."""
    with transaction() as db:
        store = db.get(m.Store, ident=id)
        if not store:
            raise e404()
        return mapper.to_api_store(store)


@app.post(ADMIN_API_PATH_PREFIX + "/stores", tags=["store"], response_model=Store)
def add_store(
    store_update: StoreUpdate,
    _: None = Depends(authorize_admin),
) -> Store:
    """Add a new store. `logo_url` and `imgage_urls` must refer
    to URLs of images that were recently uploaded via `/images`
    endpoint and not used for other stores or promos.
    `subcategory_id` must refer to an existing subcategory ID."""
    with transaction() as db:
        id = gen_id()
        if not db.get(m.Subcategory, ident=store_update.subcategory_id):
            raise e409(f"Invalid subcategory_id. Subcategory {id=} does not exist")
        verify_new_and_expire_old_images(db, [store_update.logo_url], [])
        verify_new_and_expire_old_images(db, store_update.image_urls, [])
        db.add(
            mapper.to_db_store(
                id,
                store_update,
            )
        )
        store = db.get(m.Store, ident=id)
        return mapper.to_api_store(store)


@app.patch(ADMIN_API_PATH_PREFIX + "/stores/{id}", tags=["store"])
def update_store(
    id: UUID,
    store_update: StoreUpdate,
    _: str = Depends(authorize_admin),
) -> Store:
    """Update a store. `logo_url` must refer to either the current
    `logo_url` or an URL of a recently uploaded iamge. Each URL in
    `image_urls` must also refer to either one of URLs that were
    already in the `image_url` or to a URL of an image that was
    recentpy uploaded via `/images` endpoint. The can change the
    order of URLs. You can also mix existing and new image URLs.
    `subcategory_id` must refer to an existing subcategory ID."""
    with transaction() as db:
        store = db.get(m.Store, ident=id)
        if not store:
            raise e404()
        if not db.get(m.Subcategory, ident=store_update.subcategory_id):
            raise e409(f"Invalid subcategory_id. Subcategory {id=} does not exist")
        verify_new_and_expire_old_images(
            db, [store_update.logo_url], [store.logo_filename]
        )
        verify_new_and_expire_old_images(
            db, store_update.image_urls, store.image_filenames
        )
        mapper.update_db_store(store, store_update)
        store = db.get(m.Store, ident=id)
        return mapper.to_api_store(store)


@app.delete(ADMIN_API_PATH_PREFIX + "/stores/{id}", tags=["store"])
def delete_store(id: UUID, _: str = Depends(authorize_admin)) -> None:
    """Delete a store. You must delete associated promos first."""
    with transaction() as db:
        store = db.get(m.Store, ident=id)
        if not store:
            raise e404()
        if store.promos:
            raise e409(
                "Can't delete a store that have promos. Delete associated promos first."
            )
        store.tags = []
        verify_new_and_expire_old_images(
            db, [], [store.logo_filename] + store.image_filenames
        )
        db.delete(store)


@app.post(ADMIN_API_PATH_PREFIX + "/stores/{store_id}/tags/{tag_id}", tags=["tags"])
def add_store_tag(
    store_id: UUID,
    tag_id: UUID,
    _: str = Depends(authorize_admin),
) -> None:
    """Add a tag to a store."""
    with transaction() as db:
        store = db.get(m.Store, ident=store_id)
        if not store:
            raise e404(f"Store {store_id} not found")
        tag = db.get(m.Tag, ident=tag_id)
        if not tag:
            raise e404(f"Tag {tag_id=} not found")
        store.tags.append(tag)
        store = db.get(m.Store, ident=store_id)


@app.delete(ADMIN_API_PATH_PREFIX + "/stores/{store_id}/tags/{tag_id}", tags=["tags"])
def delete_store_tag(
    store_id: UUID,
    tag_id: UUID,
    _: str = Depends(authorize_admin),
) -> None:
    """Remove a tag from a store."""
    with transaction() as db:
        store = db.get(m.Store, ident=store_id)
        if not store:
            raise e404(f"Store {store_id=} not found")
        tag = db.get(m.Tag, ident=tag_id)
        if not tag:
            raise e404(f"Tag {tag_id=} not found")
        if tag not in store.tags:
            raise e404(f"Tag {tag_id=} is not associated with store {store_id=}")
        store.tags.remove(tag)


@app.post(ADMIN_API_PATH_PREFIX + "/shuk-info", tags=["shuk-info"])
def add_shuk_info(
    shuk_info: ShukInfo,
    _: None = Depends(authorize_admin),
) -> None:
    """Update ShukApp general information text."""
    with transaction() as db:
        id = SHUK_INFO_TABLE_ID
        info = db.get(m.ShukInfo, ident=id)
        if info:
            info.description_en = shuk_info.description_en
            info.description_he = shuk_info.description_he
        else:
            info = m.ShukInfo(id, shuk_info.description_en, shuk_info.description_he)
            db.add(info)


@app.get(
    ADMIN_API_PATH_PREFIX + "/shuk-info", tags=["shuk-info"], response_model=ShukInfo
)
def get_shuk_info() -> ShukInfo:
    """Get ShukApp general information text."""
    with transaction() as db:
        info = db.get(m.ShukInfo, ident=SHUK_INFO_TABLE_ID)
        if not info:
            return ShukInfo("empty", "empty")
        return ShukInfo.from_orm(info)


@app.post(ADMIN_API_PATH_PREFIX + "/images", tags=["images"])
def upload_image(
    file: UploadFile = File(default=None, media_type="image/jpeg"),
    _: None = Depends(authorize_admin),
):
    """Upload an image. This endpoint will return a URL which
    you can then use to add/update images or a store or a promo.
    The image must be in jpg/jpeg format."""
    extension = file.filename.split(".")[-1]
    if file.content_type not in ["image/jpg", "image/jpeg"] or extension not in [
        "jpg",
        "jpeg",
    ]:
        raise e415("Only jpg/jpeg images accepted")
    s3 = boto3.client("s3")
    filename = f"{gen_id()}.jpeg"
    response = s3.upload_fileobj(
        Fileobj=file.file,
        Bucket=S3_BUCKET,
        Key=f"{S3_DIRECTORY}/{filename}",
        ExtraArgs={"ContentType": "image/jpeg"},
    )
    if response is not None:
        raise e500("Something went wrong while saving image")
    with transaction() as db:
        db.add(m.TmpImage(filename, datetime.utcnow()))
    return UploadedImage(url=f"{IMAGE_URL_PREFIX}/{filename}")


@app.on_event("startup")
@repeat_every(seconds=60 * 10)
def clean_up_images_and_tokens() -> None:
    """Delete expired images if 30 days has passed since expiration.
    Delete temporary images 3 days after they were uploaded.
    Delete tokens that haven't been used in 7 days."""
    s3 = boto3.client("s3")
    with transaction() as db:
        expired_images_to_delete = (
            db.query(m.ExpiredImage)
            .filter(m.ExpiredImage.expired_at < datetime.utcnow() - timedelta(days=7))
            .all()
        )
        for image in expired_images_to_delete:
            s3.delete_object(Bucket=S3_BUCKET, Key=f"{S3_DIRECTORY}/{image.filename}")
            db.delete(image)
    with transaction() as db:
        tmp_images_to_delete = (
            db.query(m.TmpImage)
            .filter(m.TmpImage.uploaded_at < datetime.utcnow() - timedelta(days=7))
            .all()
        )
        for image in tmp_images_to_delete:
            s3.delete_object(Bucket=S3_BUCKET, Key=f"{S3_DIRECTORY}/{image.filename}")
            db.delete(image)
    with transaction() as db:
        db.query(m.Token).filter(
            m.Token.last_used_at < datetime.utcnow() - timedelta(days=7)
        ).delete()
