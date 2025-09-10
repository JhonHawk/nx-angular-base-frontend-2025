import {
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';

export interface HttpInterceptorConfig {
  /** Storage key for getting auth token from localStorage */
  authStorageKey?: string;
  /** Storage key for customer token (for client-specific operations) */
  customerTokenStorageKey?: string;
  /** Default timeout in milliseconds (default: 30000) */
  defaultTimeout?: number;
  /** Whether to enable request/response logging (default: true) */
  enableLogging?: boolean;
  /** Maximum body size to log (default: 1000 chars) */
  maxLogBodySize?: number;
  /** Log level: 'minimal' | 'standard' | 'verbose' (default: 'standard') */
  logLevel?: 'minimal' | 'standard' | 'verbose';
  /** Function to extract token from stored user data */
  getTokenFromStorage?: (storageKey: string) => string | null;
  /** Function to extract customer token from storage */
  getCustomerTokenFromStorage?: (storageKey: string) => string | null;
}

// Global configuration for the HTTP interceptor
// Warning: Global state should be managed carefully in multi-app environments
let interceptorConfig: HttpInterceptorConfig = {
  defaultTimeout: 5000,
  enableLogging: false,
  maxLogBodySize: 1000,
  logLevel: 'standard',
  getTokenFromStorage: defaultGetToken,
  getCustomerTokenFromStorage: defaultGetCustomerToken,
};

/**
 * Configure the HTTP interceptor settings
 */
export function configureHttpInterceptor(config: Partial<HttpInterceptorConfig>): void {
  interceptorConfig = { ...interceptorConfig, ...config };
}

/**
 * Default token extraction function
 */
function defaultGetToken(storageKey: string): string | null {
  try {
    const userData = localStorage.getItem(storageKey);
    if (!userData) return null;

    const parsed = JSON.parse(userData);
    // Try to extract token from common property names
    return parsed.token || parsed.accessToken || parsed.authToken || null;
  } catch {
    return null;
  }
}

/**
 * Default customer token extraction function
 */
function defaultGetCustomerToken(storageKey: string): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

/**
 * Functional HTTP interceptor for Angular v20+
 */
export const httpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const startTime = Date.now();

  // Clone request to add headers and timeout
  let modifiedReq = req.clone();

  // Add Authorization header based on URL pattern
  const headers: { [key: string]: string } = {};

  // Check if this is a backoffice endpoint (/bo/ in URL)
  const isBackofficeEndpoint = req.url.includes('/bo/');

  if (isBackofficeEndpoint) {
    // For /bo/ endpoints, use the backoffice token
    if (interceptorConfig.authStorageKey && interceptorConfig.getTokenFromStorage) {
      const token = interceptorConfig.getTokenFromStorage(interceptorConfig.authStorageKey);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } else {
    // For non-/bo/ endpoints, use the customer token if available
    if (
      interceptorConfig.customerTokenStorageKey &&
      interceptorConfig.getCustomerTokenFromStorage
    ) {
      const customerToken = interceptorConfig.getCustomerTokenFromStorage(
        interceptorConfig.customerTokenStorageKey,
      );
      if (customerToken) {
        headers['Authorization'] = `Bearer ${customerToken}`;
      }
    }
  }

  // Apply headers if any were set
  if (Object.keys(headers).length > 0) {
    modifiedReq = modifiedReq.clone({
      setHeaders: headers,
    });
  }

  // Add custom timeout if specified in request context or use default
  const requestTimeout =
    req.context.get(TIMEOUT_CONFIG) || interceptorConfig.defaultTimeout || 5000;

  // Log request if logging is enabled with memory-conscious approach
  if (interceptorConfig.enableLogging) {
    logRequest(req, requestTimeout);
  }

  return next(modifiedReq).pipe(
    timeout(requestTimeout),
    tap((event: HttpEvent<unknown>) => {
      if (event instanceof HttpResponse && interceptorConfig.enableLogging) {
        const duration = Date.now() - startTime;
        logResponse(event, duration);
      }
    }),
    catchError((error: any) => {
      const duration = Date.now() - startTime;

      if (interceptorConfig.enableLogging) {
        // Distinguish timeout errors from other HTTP errors
        if (error.name === 'TimeoutError') {
          console.error(
            `⏱️ Request timeout (${duration}ms): ${modifiedReq.method} ${modifiedReq.url}`,
          );
        } else {
          logError(error, duration);
        }
      }

      return throwError(() => error);
    }),
  );
};

/**
 * Memory-conscious request logging
 */
function logRequest(req: HttpRequest<unknown>, timeout: number): void {
  const logLevel = interceptorConfig.logLevel || 'standard';

  if (logLevel === 'minimal') {
    console.log(`🌐 ${req.method} ${req.url}`);
    return;
  }

  if (logLevel === 'verbose') {
    console.log(`🌐 📤 HTTP ${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      headers: sanitizeHeaders(extractHeaders(req.headers)),
      body: truncateBody(req.body),
      timeout,
    });
  } else {
    console.log(`🌐 📤 HTTP ${req.method} ${req.url} (${timeout}ms timeout)`);
  }
}

/**
 * Memory-conscious response logging
 */
function logResponse(response: HttpResponse<unknown>, duration: number): void {
  const logLevel = interceptorConfig.logLevel || 'standard';

  if (logLevel === 'minimal') {
    console.log(`📥 ${response.status} (${duration}ms)`);
    return;
  }

  if (logLevel === 'verbose') {
    console.log(`📥 Response (${duration}ms):`, {
      status: response.status,
      statusText: response.statusText,
      headers: sanitizeHeaders(extractHeaders(response.headers)),
      body: truncateBody(response.body),
    });
  } else {
    console.log(`📥 Response: ${response.status} ${response.url} ${response.statusText} (${duration}ms)`);
  }
}

/**
 * Memory-conscious error logging
 */
function logError(error: HttpErrorResponse, duration: number): void {
  const logLevel = interceptorConfig.logLevel || 'standard';

  if (logLevel === 'minimal') {
    console.error(`❌ ${error.status} (${duration}ms)`);
    return;
  }

  console.error(`❌ Error (${duration}ms):`, {
    status: error.status,
    statusText: error.statusText,
    message: error.message,
    error: logLevel === 'verbose' ? truncateBody(error.error) : '[TRUNCATED]',
  });
}

/**
 * Extract headers in a memory-efficient way
 */
function extractHeaders(headers: {
  keys(): string[];
  get(key: string): string | null;
}): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  const keys = headers.keys();

  // Limit to essential headers to prevent memory bloat
  const essentialHeaders = ['content-type', 'authorization', 'accept'];

  for (const key of keys) {
    if (essentialHeaders.includes(key.toLowerCase())) {
      result[key] = headers.get(key);
    }
  }

  return result;
}

/**
 * Truncate large bodies to prevent memory retention
 */
function truncateBody(body: unknown): unknown {
  if (!body) return body;

  const maxSize = interceptorConfig.maxLogBodySize || 1000;
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);

  if (bodyStr.length > maxSize) {
    return `${bodyStr.substring(0, maxSize)}... [TRUNCATED - ${bodyStr.length} chars total]`;
  }

  return body;
}

function sanitizeHeaders(headers: Record<string, string | null>): Record<string, string | null> {
  const sanitized = { ...headers };

  // Hide sensitive headers in logs
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  sensitiveHeaders.forEach((header) => {
    if (sanitized[header]) {
      sanitized[header] = '[HIDDEN]';
    }
    if (sanitized[header.toLowerCase()]) {
      sanitized[header.toLowerCase()] = '[HIDDEN]';
    }
  });

  return sanitized;
}

// Context token for custom timeout configuration
export const TIMEOUT_CONFIG = new HttpContextToken<number>(() => 5000);

/**
 * Helper function to create HTTP context with custom timeout
 */
export function withTimeout(timeoutMs: number): { context: HttpContext } {
  return {
    context: new HttpContext().set(TIMEOUT_CONFIG, timeoutMs),
  };
}
