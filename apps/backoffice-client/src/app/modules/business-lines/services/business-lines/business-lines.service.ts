import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';

// Import business lines store
import { BusinessLinesStore } from '../../../../stores/business-lines/business-lines.store';

// Import types from dedicated type files
import {
  BusinessLine,
  BusinessLineFilters,
  BusinessLineStatistics,
  CreateBusinessLineRequest,
  UpdateBusinessLineRequest,
  BusinessLineResponseDTO,
} from '../../types/business-line.types';
import { BUSINESS_LINE_ENDPOINTS, BusinessLinesPageResponse } from '../../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class BusinessLinesService {
  private http = inject(HttpClient);
  private businessLinesStore = inject(BusinessLinesStore);

  // Expose store signals for backward compatibility
  businessLines = this.businessLinesStore.businessLines;
  isLoading = this.businessLinesStore.loading;
  totalElements = this.businessLinesStore.totalElements;
  currentPage = this.businessLinesStore.currentPage;

  private businessLinesSubject = new BehaviorSubject<BusinessLine[]>([]);
  public businessLines$ = this.businessLinesSubject.asObservable();

  constructor() {
    // Service initialized without automatic data loading
    // Data will be loaded when explicitly requested by components
  }

  /**
   * Load business lines from API with pagination (used internally by getBusinessLines)
   */
  private loadBusinessLinesInternal(
    page = 0,
    size = 20,
    sort = 'name,asc',
    activeOnly = false,
  ): Observable<BusinessLine[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    const endpoint = activeOnly
      ? BUSINESS_LINE_ENDPOINTS.ACTIVE_BUSINESS_LINES
      : BUSINESS_LINE_ENDPOINTS.BUSINESS_LINES;

    return this.http.get<BusinessLinesPageResponse>(endpoint, { params }).pipe(
      map((response) => {
        // Update store with pagination info
        this.businessLinesStore.setPaginationInfo(response.totalElements, response.number);

        return response.content.map((dto) => this.mapBusinessLineResponseToBusinessLine(dto));
      }),
      catchError((error) => {
        console.error('Error loading business lines:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Get all business lines with optional filtering
   */
  getBusinessLines(filters?: BusinessLineFilters): Observable<BusinessLine[]> {
    this.businessLinesStore.setLoading(true);

    const page = filters?.page ?? 0;
    const size = filters?.size ?? 20;
    const activeOnly = filters?.status === 'active';

    return this.loadBusinessLinesInternal(page, size, 'name,asc', activeOnly).pipe(
      // Apply search filter on frontend (if backend doesn't support it)
      map((businessLines) => {
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          return businessLines.filter(
            (businessLine) =>
              businessLine.name.toLowerCase().includes(searchTerm) ||
              businessLine.description.toLowerCase().includes(searchTerm) ||
              businessLine.code.toLowerCase().includes(searchTerm),
          );
        }
        return businessLines;
      }),
      // Update store and BehaviorSubject
      map((businessLines) => {
        this.businessLinesStore.setBusinessLines(businessLines);
        this.businessLinesSubject.next(businessLines);
        this.businessLinesStore.setLoading(false);
        return businessLines;
      }),
      catchError((error) => {
        console.error('Error fetching business lines:', error);
        this.businessLinesStore.setLoading(false);
        this.businessLinesStore.setError(error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Get all active business lines (for dropdown usage in client forms)
   * This endpoint returns an array directly, not a paginated response
   */
  getActiveBusinessLines(): Observable<BusinessLine[]> {
    this.businessLinesStore.setLoading(true);

    return this.http
      .get<BusinessLineResponseDTO[]>(BUSINESS_LINE_ENDPOINTS.ACTIVE_BUSINESS_LINES)
      .pipe(
        map((businessLinesDto) => {
          const businessLines = businessLinesDto.map((dto) =>
            this.mapBusinessLineResponseToBusinessLine(dto),
          );

          // Update store state
          this.businessLinesStore.setBusinessLines(businessLines);
          this.businessLinesSubject.next(businessLines);
          this.businessLinesStore.setLoading(false);

          return businessLines;
        }),
        catchError((error) => {
          console.error('Error loading active business lines:', error);
          this.businessLinesStore.setLoading(false);
          this.businessLinesStore.setError(error);
          return throwError(() => error);
        }),
      );
  }

  /**
   * Get a single business line by ID
   */
  getBusinessLineById(id: number): Observable<BusinessLine | null> {
    this.businessLinesStore.setLoading(true);

    return this.http
      .get<BusinessLineResponseDTO>(BUSINESS_LINE_ENDPOINTS.BUSINESS_LINE_BY_ID(id))
      .pipe(
        map((businessLineDto) => this.mapBusinessLineResponseToBusinessLine(businessLineDto)),
        catchError((error) => {
          console.error(`Error fetching business line ${id}:`, error);
          this.businessLinesStore.setLoading(false);
          this.businessLinesStore.setError(error);
          return of(null);
        }),
        map((businessLine) => {
          this.businessLinesStore.setLoading(false);
          return businessLine;
        }),
      );
  }

  /**
   * Get a single business line by code
   */
  getBusinessLineByCode(code: string): Observable<BusinessLine | null> {
    this.businessLinesStore.setLoading(true);

    return this.http
      .get<BusinessLineResponseDTO>(BUSINESS_LINE_ENDPOINTS.BUSINESS_LINE_BY_CODE(code))
      .pipe(
        map((businessLineDto) => this.mapBusinessLineResponseToBusinessLine(businessLineDto)),
        catchError((error) => {
          console.error(`Error fetching business line ${code}:`, error);
          this.businessLinesStore.setLoading(false);
          this.businessLinesStore.setError(error);
          return of(null);
        }),
        map((businessLine) => {
          this.businessLinesStore.setLoading(false);
          return businessLine;
        }),
      );
  }

  /**
   * Create a new business line
   */
  createBusinessLine(businessLineData: CreateBusinessLineRequest): Observable<BusinessLine> {
    this.businessLinesStore.setLoading(true);

    return this.http
      .post<BusinessLineResponseDTO>(BUSINESS_LINE_ENDPOINTS.BUSINESS_LINES, businessLineData)
      .pipe(
        map((businessLineDto) => this.mapBusinessLineResponseToBusinessLine(businessLineDto)),
        catchError((error) => {
          console.error('Error creating business line:', error);
          this.businessLinesStore.setLoading(false);
          this.businessLinesStore.setError(error);
          return throwError(() => error);
        }),
        map((newBusinessLine) => {
          // Update store state
          this.businessLinesStore.addBusinessLine(newBusinessLine);
          const updatedBusinessLines = this.businessLines();
          this.businessLinesSubject.next(updatedBusinessLines);
          this.businessLinesStore.setLoading(false);
          return newBusinessLine;
        }),
      );
  }

  /**
   * Update an existing business line
   */
  updateBusinessLine(id: number, updates: UpdateBusinessLineRequest): Observable<BusinessLine> {
    this.businessLinesStore.setLoading(true);

    return this.http
      .put<BusinessLineResponseDTO>(BUSINESS_LINE_ENDPOINTS.BUSINESS_LINE_BY_ID(id), updates)
      .pipe(
        map((businessLineDto) => this.mapBusinessLineResponseToBusinessLine(businessLineDto)),
        catchError((error) => {
          console.error(`Error updating business line ${id}:`, error);
          this.businessLinesStore.setLoading(false);
          this.businessLinesStore.setError(error);
          return throwError(() => error);
        }),
        map((updatedBusinessLine) => {
          // Update store state
          this.businessLinesStore.updateBusinessLine(updatedBusinessLine);
          const updatedBusinessLines = this.businessLines();
          this.businessLinesSubject.next(updatedBusinessLines);
          this.businessLinesStore.setLoading(false);
          return updatedBusinessLine;
        }),
      );
  }

  /**
   * Toggle business line status (activate/deactivate)
   */
  toggleBusinessLineStatus(id: number): Observable<BusinessLine> {
    return this.http
      .patch<BusinessLineResponseDTO>(BUSINESS_LINE_ENDPOINTS.TOGGLE_STATUS(id), {})
      .pipe(
        map((businessLineDto) => this.mapBusinessLineResponseToBusinessLine(businessLineDto)),
        catchError((error) => {
          console.error(`Error toggling business line status ${id}:`, error);
          this.businessLinesStore.setLoading(false);
          this.businessLinesStore.setError(error);
          return throwError(() => error);
        }),
        map((updatedBusinessLine) => {
          // Update store state
          this.businessLinesStore.updateBusinessLine(updatedBusinessLine);
          const updatedBusinessLines = this.businessLines();
          this.businessLinesSubject.next(updatedBusinessLines);
          return updatedBusinessLine;
        }),
      );
  }

  /**
   * Delete a business line (deactivate by setting status to inactive)
   */
  deleteBusinessLine(id: number): Observable<boolean> {
    return this.updateBusinessLine(id, { isActive: false }).pipe(map(() => true));
  }

  /**
   * Get business line statistics
   */
  getBusinessLineStatistics(): Observable<BusinessLineStatistics> {
    // Fetch statistics from current cached data or make separate API calls
    const businessLines = this.businessLines();

    if (businessLines.length === 0) {
      // If no cached data, load business lines first
      return this.getBusinessLines({ size: 1000 }).pipe(
        // Get large page to count all
        map(() => {
          const currentBusinessLines = this.businessLines();
          return {
            totalBusinessLines: this.totalElements(),
            activeBusinessLines: currentBusinessLines.filter((bl) => bl.isActive).length,
            inactiveBusinessLines: currentBusinessLines.filter((bl) => !bl.isActive).length,
          };
        }),
      );
    }

    return of({
      totalBusinessLines: this.totalElements(),
      activeBusinessLines: businessLines.filter((bl) => bl.isActive).length,
      inactiveBusinessLines: businessLines.filter((bl) => !bl.isActive).length,
    });
  }

  /**
   * Map BusinessLineResponseDTO from API to frontend BusinessLine interface
   */
  private mapBusinessLineResponseToBusinessLine(
    businessLineDto: BusinessLineResponseDTO,
  ): BusinessLine {
    return {
      id: businessLineDto.id,
      code: businessLineDto.code,
      name: businessLineDto.name,
      description: businessLineDto.description,
      isActive: businessLineDto.isActive,
      createdAt: new Date(businessLineDto.createdAt),
      updatedAt: new Date(businessLineDto.updatedAt),
      // Computed properties for UI compatibility
      status: businessLineDto.isActive ? 'active' : 'inactive',
    };
  }
}
