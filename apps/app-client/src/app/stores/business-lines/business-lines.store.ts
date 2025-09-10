/**
 * Business Lines Store - Simplified Version
 *
 * Store específico para gestión de líneas de negocio (BackOffice Business Lines)
 * sin polling automático. Los servicios actualizan el store manualmente cuando es necesario.
 */

import { Injectable, computed, signal } from '@angular/core';
// Business lines module was removed - defining local types for backward compatibility
export interface BusinessLine {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessLineStatistics {
  totalBusinessLines: number;
  activeBusinessLines: number;
  inactiveBusinessLines: number;
}

@Injectable({
  providedIn: 'root',
})
export class BusinessLinesStore {
  // Private state signals
  private _businessLines = signal<BusinessLine[]>([]);
  private _loading = signal(false);
  private _error = signal<Error | null>(null);
  private _lastFetch = signal<Date | null>(null);
  private _totalElements = signal(0);
  private _currentPage = signal(0);

  // Public readonly signals
  readonly businessLines = this._businessLines.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastFetch = this._lastFetch.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();

  // Computed signals para consultas específicas del dominio
  readonly hasData = computed(() => this.businessLines().length > 0);
  readonly totalBusinessLines = computed(() => this.businessLines().length);

  readonly activeBusinessLines = computed(() =>
    this.businessLines().filter((businessLine) => businessLine.isActive),
  );

  readonly inactiveBusinessLines = computed(() =>
    this.businessLines().filter((businessLine) => !businessLine.isActive),
  );

  readonly businessLinesByStatus = computed(() => {
    const businessLines = this.businessLines();
    return {
      active: businessLines.filter((bl) => bl.isActive),
      inactive: businessLines.filter((bl) => !bl.isActive),
    };
  });

  readonly statistics = computed((): BusinessLineStatistics => {
    const businessLines = this.businessLines();

    return {
      totalBusinessLines: businessLines.length,
      activeBusinessLines: businessLines.filter((bl) => bl.isActive).length,
      inactiveBusinessLines: businessLines.filter((bl) => !bl.isActive).length,
    };
  });

  constructor() {}

  /**
   * Métodos para actualizar el estado desde los servicios
   */

  /**
   * Establece la lista completa de business lines
   */
  setBusinessLines(businessLines: BusinessLine[]): void {
    this._businessLines.set(businessLines);
    this._lastFetch.set(new Date());
    this._error.set(null);
  }

  /**
   * Agrega una nueva business line al store
   */
  addBusinessLine(businessLine: BusinessLine): void {
    const currentBusinessLines = this._businessLines();
    this._businessLines.set([...currentBusinessLines, businessLine]);
  }

  /**
   * Actualiza una business line existente
   */
  updateBusinessLine(updatedBusinessLine: BusinessLine): void {
    const currentBusinessLines = this._businessLines();
    const index = currentBusinessLines.findIndex((bl) => bl.id === updatedBusinessLine.id);

    if (index !== -1) {
      const newBusinessLines = [...currentBusinessLines];
      newBusinessLines[index] = updatedBusinessLine;
      this._businessLines.set(newBusinessLines);
    }
  }

  /**
   * Actualiza una business line por ID con datos parciales
   */
  updateBusinessLineById(businessLineId: number, updates: Partial<BusinessLine>): void {
    const currentBusinessLines = this._businessLines();
    const index = currentBusinessLines.findIndex((bl) => bl.id === businessLineId);

    if (index !== -1) {
      const newBusinessLines = [...currentBusinessLines];
      newBusinessLines[index] = { ...newBusinessLines[index], ...updates };
      this._businessLines.set(newBusinessLines);
    }
  }

  /**
   * Elimina una business line del store
   */
  removeBusinessLine(businessLineId: number): void {
    const currentBusinessLines = this._businessLines();
    const filteredBusinessLines = currentBusinessLines.filter((bl) => bl.id !== businessLineId);
    this._businessLines.set(filteredBusinessLines);
  }

  /**
   * Establece información de paginación
   */
  setPaginationInfo(totalElements: number, currentPage: number): void {
    this._totalElements.set(totalElements);
    this._currentPage.set(currentPage);
  }

  /**
   * Establece el estado de loading
   */
  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  /**
   * Establece un error
   */
  setError(error: Error | null): void {
    this._error.set(error);
  }

  /**
   * Limpia todos los datos del store
   */
  clear(): void {
    this._businessLines.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._lastFetch.set(null);
    this._totalElements.set(0);
    this._currentPage.set(0);
  }

  /**
   * Métodos de consulta
   */

  /**
   * Obtiene una business line por ID
   */
  getBusinessLineById(id: number): BusinessLine | undefined {
    return this.businessLines().find((businessLine) => businessLine.id === id);
  }

  /**
   * Obtiene una business line por código
   */
  getBusinessLineByCode(code: string): BusinessLine | undefined {
    return this.businessLines().find((businessLine) => businessLine.code === code);
  }

  /**
   * Obtiene business lines activas
   */
  getActiveBusinessLines(): BusinessLine[] {
    return this.activeBusinessLines();
  }

  /**
   * Busca business lines por término
   */
  searchBusinessLines(searchTerm: string): BusinessLine[] {
    if (!searchTerm.trim()) return this.businessLines();

    const term = searchTerm.toLowerCase();
    return this.businessLines().filter(
      (businessLine) =>
        businessLine.name.toLowerCase().includes(term) ||
        businessLine.code.toLowerCase().includes(term) ||
        businessLine.description.toLowerCase().includes(term),
    );
  }

  /**
   * Verifica si el store tiene datos frescos (últimos 5 minutos)
   */
  isDataFresh(): boolean {
    const lastFetch = this.lastFetch();
    if (!lastFetch) return false;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastFetch > fiveMinutesAgo;
  }

  /**
   * Obtiene información de debug del store
   */
  getDebugInfo() {
    return {
      businessLinesCount: this.businessLines().length,
      isLoading: this.loading(),
      hasError: this.error() !== null,
      lastFetch: this.lastFetch(),
      isDataFresh: this.isDataFresh(),
      statistics: this.statistics(),
      totalElements: this.totalElements(),
      currentPage: this.currentPage(),
    };
  }
}
