/**
 * Core type definitions for ControlApp Mobile
 */

// User type
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at?: string;
}

// Project type
export interface Project {
    id: number;
    nombre: string;
    descripcion?: string;
    theme?: string;
    currency?: string;
    owner_id: number;
    created_at?: string;
    updated_at?: string;
}

// Account type
export interface Account {
    id: number;
    nombre: string;
    tipo: 'bank' | 'cash' | 'credit' | 'investment' | 'other';
    saldo_inicial: number;
    saldo_actual: number;
    proyecto_id: number;
    propietario_id?: number;
    propietario_type?: string;
    propietario?: User;
}

// Transaction type
export interface Transaction {
    id: number;
    monto: number;
    descripcion: string;
    fecha: string;
    tipo: 'ingreso' | 'egreso';
    cuenta_id: number;
    categoria_id?: number;
    categoria?: Category;
}

// Category type
export interface Category {
    id: number;
    nombre: string;
    tipo: 'ingreso' | 'egreso';
    color?: string;
    proyecto_id?: number;
}

// Task type
export interface Task {
    id: number;
    titulo: string;
    descripcion?: string;
    estado: 'pendiente' | 'en_progreso' | 'completada';
    prioridad: 'baja' | 'media' | 'alta';
    fecha_vencimiento?: string;
    proyecto_id: number;
    asignado_a?: number;
    asignado?: User;
}

// Inventory Item type
export interface InventoryItem {
    id: number;
    nombre: string;
    descripcion?: string;
    cantidad: number;
    unidad: string;
    precio_unitario?: number;
    categoria?: string;
    proyecto_id: number;
}

// Lote (Production batch) type
export interface Lote {
    id: number;
    nombre: string;
    proceso_id: number;
    estado: string;
    etapa_actual?: number;
    proyecto_id: number;
    created_at?: string;
    updated_at?: string;
}

// API Response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
