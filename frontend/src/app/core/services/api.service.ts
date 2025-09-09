import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, retry, timeout, finalize, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  PaginatedResponse, 
  ApiError,
  SearchParams,
  PaginationParams
} from '../models/api.models';

export interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  retryCount?: number;
  timeout?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl || 'http://localhost:8080';
  private readonly defaultTimeout = 30000; // 30 seconds
  private readonly defaultRetryCount = 3;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject.asObservable();

  /**
   * GET request with type safety and error handling
   */
  get<T>(
    endpoint: string, 
    options?: RequestOptions
  ): Observable<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, null, options);
  }

  /**
   * GET request for paginated data
   */
  getPaginated<T>(
    endpoint: string,
    params?: SearchParams,
    options?: RequestOptions
  ): Observable<ApiResponse<PaginatedResponse<T>>> {
    const httpParams = this.buildHttpParams(params);
    const requestOptions = {
      ...options,
      params: httpParams
    };

    return this.request<PaginatedResponse<T>>('GET', endpoint, null, requestOptions);
  }

  /**
   * POST request
   */
  post<T, R = any>(
    endpoint: string,
    data: R,
    options?: RequestOptions
  ): Observable<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * PUT request
   */
  put<T, R = any>(
    endpoint: string,
    data: R,
    options?: RequestOptions
  ): Observable<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * PATCH request
   */
  patch<T, R = any>(
    endpoint: string,
    data: R,
    options?: RequestOptions
  ): Observable<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * DELETE request
   */
  delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Observable<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, null, options);
  }

  /**
   * Upload file
   */
  uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Observable<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>('POST', endpoint, formData, {
      // Don't set Content-Type for FormData, let browser set it
      headers: new HttpHeaders()
    });
  }

  /**
   * Download file
   */
  downloadFile(endpoint: string, filename?: string): Observable<Blob> {
    this.setLoading(true);
    
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      timeout(this.defaultTimeout),
      catchError(this.handleError),
      finalize(() => this.setLoading(false)),
      map(response => {
        // Trigger download if filename is provided
        if (filename && response.body) {
          this.triggerDownload(response.body, filename);
        }
        return response.body || new Blob();
      })
    );
  }

  /**
   * Generic request method
   */
  private request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const httpOptions = {
      headers: this.getHeaders(options?.headers),
      params: options?.params
    };

    this.setLoading(true);

    let request$: Observable<ApiResponse<T>>;

    switch (method.toUpperCase()) {
      case 'GET':
        request$ = this.http.get<ApiResponse<T>>(url, httpOptions);
        break;
      case 'POST':
        request$ = this.http.post<ApiResponse<T>>(url, data, httpOptions);
        break;
      case 'PUT':
        request$ = this.http.put<ApiResponse<T>>(url, data, httpOptions);
        break;
      case 'PATCH':
        request$ = this.http.patch<ApiResponse<T>>(url, data, httpOptions);
        break;
      case 'DELETE':
        request$ = this.http.delete<ApiResponse<T>>(url, httpOptions);
        break;
      default:
        return throwError(() => new Error(`Unsupported HTTP method: ${method}`));
    }

    return request$.pipe(
      timeout(options?.timeout || this.defaultTimeout),
      retry(options?.retryCount || this.defaultRetryCount),
      catchError(this.handleError),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Build HTTP params from search parameters
   */
  private buildHttpParams(params?: SearchParams): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle nested objects (like filters)
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (nestedValue !== null && nestedValue !== undefined) {
                httpParams = httpParams.set(`${key}.${nestedKey}`, String(nestedValue));
              }
            });
          } else if (Array.isArray(value)) {
            // Handle arrays
            value.forEach(item => {
              httpParams = httpParams.append(key, String(item));
            });
          } else {
            httpParams = httpParams.set(key, String(value));
          }
        }
      });
    }

    return httpParams;
  }

  /**
   * Get default headers
   */
  private getHeaders(customHeaders?: HttpHeaders | { [header: string]: string | string[] }): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (customHeaders) {
      if (customHeaders instanceof HttpHeaders) {
        customHeaders.keys().forEach(key => {
          const values = customHeaders.getAll(key);
          if (values) {
            headers = headers.set(key, values);
          }
        });
      } else {
        Object.entries(customHeaders).forEach(([key, value]) => {
          headers = headers.set(key, value);
        });
      }
    }

    return headers;
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      apiError = {
        code: 'CLIENT_ERROR',
        message: 'A client-side error occurred',
        details: error.error.message,
        timestamp: new Date().toISOString()
      };
    } else {
      // Server-side error
      apiError = {
        code: error.error?.code || `HTTP_${error.status}`,
        message: error.error?.message || this.getHttpErrorMessage(error.status),
        details: error.error?.details || error.message,
        timestamp: error.error?.timestamp || new Date().toISOString(),
        path: error.url || undefined
      };
    }

    console.error('API Error:', apiError);
    return throwError(() => apiError);
  };

  /**
   * Get user-friendly HTTP error messages
   */
  private getHttpErrorMessage(status: number): string {
    switch (status) {
      case 400: return 'Invalid request. Please check your input.';
      case 401: return 'You are not authorized. Please log in.';
      case 403: return 'You do not have permission to perform this action.';
      case 404: return 'The requested resource was not found.';
      case 409: return 'A conflict occurred. The resource may already exist.';
      case 429: return 'Too many requests. Please try again later.';
      case 500: return 'An internal server error occurred.';
      case 502: return 'The server is temporarily unavailable.';
      case 503: return 'The service is temporarily unavailable.';
      default: return 'An unexpected error occurred.';
    }
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Trigger file download
   */
  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}