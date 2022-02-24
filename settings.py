from __future__ import annotations

import os
from uuid import UUID

# AWS RDS database secrets.
_user = os.environ["RDS_USERNAME"]
_pass = os.environ["RDS_PASSWORD"]
_host = os.environ["RDS_HOSTNAME"]
_port = os.environ["RDS_PORT"]
_db_base = f"postgresql://{_user}:{_pass}@{_host}:{_port}"

# Google secrets for Oauth2 login.
GOOGLE_CLIENT_ID = os.environ["GOOGLE_CLIENT_ID"]
GOOGLE_CLIENT_SECRET = os.environ["GOOGLE_CLIENT_SECRET"]

# Integration tests drops and recreates the test schema.
TEST_DATABASE_SCHEMA = "test"
TEST_DATABASE_URL = f"{_db_base}/test?options=-csearch_path%3D{TEST_DATABASE_SCHEMA}"

# Production and local environments use different
# database names, schemas, s3 buckets, URLs.
if os.environ["ENVIRONMENT"] == "production":
    DATABASE_URL = f"{_db_base}/shuk?options=-csearch_path%3Dshuk"
    S3_DIRECTORY = "images"
    API_BASE_PATH = "https://api.shukapp.com"
elif os.environ["ENVIRONMENT"] == "local":
    # In local environment, we use the test database.
    DATABASE_URL = TEST_DATABASE_URL
    S3_DIRECTORY = "images-dev"
    API_BASE_PATH = "http://localhost:8000"
else:
    raise Exception("ENVIRONMENT variable not recognized")

SHUK_INFO_TABLE_ID = UUID(int=0)
S3_BUCKET = "shuk-app-api"
IMAGE_URL_PREFIX = f"https://api.shukapp.com/{S3_DIRECTORY}"

# Users with these emails are allowed to use the API.
ALLOWED_ADMIN_EMAILS = ["vykbal@gmail.com", "dlefkowitz123@gmail.com", "bipinvaylu@gmail.com"]

# The Swagger, OpenAPI, Redoc documentation URLs will be prefixed with
# this string. This reason is to make the docs less discoverable
# and to avoid bots trying to access admin endpoint aimlessly.
ADMIN_API_PATH_PREFIX = "/5aef1e692"

# Admin app callback URL - the API will redirect to this URL after
# a successful login.
ADMIN_APP_LOGIN_CALLBACK_URL = f"{API_BASE_PATH}{ADMIN_API_PATH_PREFIX}/client"
