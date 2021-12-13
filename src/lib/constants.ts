import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';

export const API_URL = 'https://api.shukapp.com/5aef1e692';
export const isFetchBaseQueryErrorType = (error: any): error is FetchBaseQueryError => 'status' in error;
