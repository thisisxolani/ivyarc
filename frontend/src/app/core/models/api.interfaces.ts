import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';

// Enhanced API Response Types with Strict Typing
export interface ApiResponse<T = any> {
  readonly data: T;
  readonly message?: string;
  readonly status: ApiResponseStatus;
  readonly timestamp: string;
  readonly requestId?: string;
  readonly version?: string;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  readonly pagination: PaginationMeta;
}

export interface ErrorResponse {
  readonly error: ApiError;
  readonly status: ApiResponseStatus;
  readonly timestamp: string;
  readonly path?: string;
  readonly requestId?: string;
}

// Status Types
export type ApiResponseStatus = 'success' | 'error' | 'warning' | 'partial';

// Enhanced Error Interface
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: string | Record<string, any>;
  readonly field?: string;
  readonly validationErrors?: ValidationError[];
  readonly timestamp: string;
  readonly traceId?: string;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
  readonly rejectedValue?: any;
}

// Pagination Interfaces
export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}

export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: SortOrder;
}

export interface SearchParams extends PaginationParams {
  readonly search?: string;
  readonly filters?: Record<string, FilterValue>;
}

export type SortOrder = 'asc' | 'desc';
export type FilterValue = string | number | boolean | string[] | number[] | DateRange;

export interface DateRange {
  readonly start: string;
  readonly end: string;
}

// HTTP Configuration Types
export interface RequestConfig {
  readonly headers?: HttpHeaders | Record<string, string | string[]>;
  readonly params?: HttpParams | Record<string, string | string[]>;
  readonly timeout?: number;
  readonly retryCount?: number;
  readonly retryDelay?: number;
  readonly withCredentials?: boolean;
  readonly responseType?: ResponseType;
  readonly reportProgress?: boolean;
  readonly observe?: ObserveType;
}

export type ResponseType = 'json' | 'text' | 'blob' | 'arraybuffer';
export type ObserveType = 'body' | 'response' | 'events';

// Request/Response Interceptor Types
export interface RequestInterceptor {
  intercept(config: RequestConfig): RequestConfig | Promise<RequestConfig>;
}

export interface ResponseInterceptor<T = any> {
  intercept(response: ApiResponse<T>): ApiResponse<T> | Promise<ApiResponse<T>>;
}

export interface ErrorInterceptor {
  intercept(error: ApiError): ApiError | Promise<ApiError> | never;
}

// File Upload Types
export interface FileUploadConfig extends RequestConfig {
  readonly onUploadProgress?: (progress: UploadProgress) => void;
  readonly metadata?: Record<string, string>;
  readonly allowedTypes?: string[];
  readonly maxSize?: number;
}

export interface UploadProgress {
  readonly loaded: number;
  readonly total: number;
  readonly percentage: number;
}

export interface FileUploadResponse {
  readonly fileId: string;
  readonly filename: string;
  readonly originalName: string;
  readonly size: number;
  readonly mimeType: string;
  readonly url: string;
  readonly metadata?: Record<string, any>;
}

// Cache Configuration
export interface CacheConfig {
  readonly ttl?: number; // Time to live in milliseconds
  readonly key?: string;
  readonly strategy?: CacheStrategy;
  readonly invalidateOn?: CacheInvalidationTrigger[];
}

export type CacheStrategy = 'memory' | 'localStorage' | 'sessionStorage' | 'none';
export type CacheInvalidationTrigger = 'mutation' | 'manual' | 'time-based';

// API Client Interface
export interface ApiClient {
  // GET Methods
  get<T>(endpoint: string, config?: RequestConfig): Observable<ApiResponse<T>>;
  getPaginated<T>(
    endpoint: string, 
    params?: SearchParams, 
    config?: RequestConfig
  ): Observable<PaginatedApiResponse<T>>;

  // Mutation Methods
  post<T, D = any>(endpoint: string, data: D, config?: RequestConfig): Observable<ApiResponse<T>>;
  put<T, D = any>(endpoint: string, data: D, config?: RequestConfig): Observable<ApiResponse<T>>;
  patch<T, D = any>(endpoint: string, data: D, config?: RequestConfig): Observable<ApiResponse<T>>;
  delete<T>(endpoint: string, config?: RequestConfig): Observable<ApiResponse<T>>;

  // File Operations
  uploadFile<T = FileUploadResponse>(
    endpoint: string, 
    file: File, 
    config?: FileUploadConfig
  ): Observable<ApiResponse<T>>;
  downloadFile(endpoint: string, filename?: string, config?: RequestConfig): Observable<Blob>;

  // Utility Methods
  setBaseUrl(url: string): void;
  setDefaultConfig(config: Partial<RequestConfig>): void;
  clearCache(pattern?: string): void;
  
  // State Observables
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<ApiError | null>;
}

// Resource-Specific API Types
export interface ResourceApiClient<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> extends ApiClient {
  // CRUD Operations with strong typing
  getAll(params?: SearchParams): Observable<PaginatedApiResponse<T>>;
  getById(id: string): Observable<ApiResponse<T>>;
  create(data: CreateDto): Observable<ApiResponse<T>>;
  update(id: string, data: UpdateDto): Observable<ApiResponse<T>>;
  deleteById(id: string): Observable<ApiResponse<void>>;
  
  // Batch operations
  createBatch(data: CreateDto[]): Observable<ApiResponse<T[]>>;
  updateBatch(updates: Array<{ id: string; data: UpdateDto }>): Observable<ApiResponse<T[]>>;
  deleteBatch(ids: string[]): Observable<ApiResponse<void>>;
}

// WebSocket API Types
export interface WebSocketConfig {
  readonly url: string;
  readonly protocols?: string[];
  readonly reconnectInterval?: number;
  readonly maxReconnectAttempts?: number;
  readonly heartbeatInterval?: number;
}

export interface WebSocketMessage<T = any> {
  readonly type: string;
  readonly payload: T;
  readonly timestamp: string;
  readonly id?: string;
}

export interface WebSocketApiClient {
  connect(config: WebSocketConfig): Observable<boolean>;
  disconnect(): void;
  send<T>(message: WebSocketMessage<T>): void;
  messages$<T>(): Observable<WebSocketMessage<T>>;
  connectionState$: Observable<WebSocketConnectionState>;
}

export type WebSocketConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

// Server-Sent Events Types
export interface SSEConfig {
  readonly url: string;
  readonly withCredentials?: boolean;
  readonly headers?: Record<string, string>;
  readonly retryInterval?: number;
}

export interface SSEClient {
  connect(config: SSEConfig): Observable<MessageEvent>;
  disconnect(): void;
  connectionState$: Observable<SSEConnectionState>;
}

export type SSEConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

// API Versioning Support
export interface VersionedApiClient extends ApiClient {
  setVersion(version: string): void;
  getVersion(): string;
  getSupportedVersions(): Promise<string[]>;
}

// Environment-specific API Configuration
export interface ApiEnvironmentConfig {
  readonly baseUrl: string;
  readonly version: string;
  readonly timeout: number;
  readonly retryCount: number;
  readonly enableCaching: boolean;
  readonly enableRequestLogging: boolean;
  readonly enableResponseValidation: boolean;
  readonly rateLimitConfig?: RateLimitConfig;
}

export interface RateLimitConfig {
  readonly requestsPerMinute: number;
  readonly burstSize: number;
  readonly strategy: 'sliding-window' | 'fixed-window' | 'token-bucket';
}

// Type Guards and Utilities
export interface TypeGuard<T> {
  (value: unknown): value is T;
}

export interface ApiResponseValidator<T> {
  validate(response: unknown): response is ApiResponse<T>;
  schema: Record<string, any>;
}

// Metrics and Monitoring Types
export interface RequestMetrics {
  readonly url: string;
  readonly method: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
  readonly statusCode: number;
  readonly success: boolean;
  readonly retryCount: number;
  readonly cacheHit?: boolean;
}

export interface ApiMetricsCollector {
  recordRequest(metrics: RequestMetrics): void;
  getMetrics(): Observable<RequestMetrics[]>;
  clearMetrics(): void;
}