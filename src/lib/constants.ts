import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';

export const API_URL = 'https://api.shukapp.com';
export const isFetchBaseQueryErrorType = (error: any): error is FetchBaseQueryError => 'status' in error;
export const ADMIN_PREFIX = '5aef1e692';
