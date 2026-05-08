/**
 * Core type definitions for ControlApp Mobile
 */

export interface UserSettings {
    completed_tours: string[];
}

// User type
export interface User {
    id: string;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at?: string;
    global_theme?: string;
    profile_photo_url?: string;
    unread_messages_count?: number;
    pending_invitations_count?: number;
    enabled_tools?: string[];
    settings?: UserSettings;
}

export interface Invitation {
    id: string;
    uuid: string;
    email: string;
    rol: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
    expires_at?: string;
    accepted_at?: string;
    cancelled_at?: string;
    invitador?: User;
    proyecto?: Project;
}

// Project type
export interface Project {
    id: string;
    uuid: string;
    nombre: string;
    descripcion?: string;
    theme?: string;
    currency?: string;
    owner_id: string;
    image_path?: string;
    es_personal?: boolean;
    created_at?: string;
    updated_at?: string;
}

// Account type
export interface Account {
    id: string;
    uuid: string;
    nombre: string;
    tipo: string; // bank, cash, credit_card, etc.
    saldo: number;
    banco?: string;
    moneda: string;
    color?: string;
    icono?: string;
    estado: string;
    proyecto_id: string;
    propietario_id?: string;
    propietario_type?: string;
    propietario?: User;
    created_at?: string;
}

// Transaction type
export interface Transaction {
    id: string;
    monto: number;
    descripcion: string;
    fecha: string;
    tipo: 'ingreso' | 'egreso';
    cuenta_id: string;
    categoria_id?: string;
    categoria?: Category;
}

// Category type
export interface Category {
    id: string;
    nombre: string;
    tipo: 'ingreso' | 'egreso';
    color?: string;
    proyecto_id?: string;
}

// Task type
export interface Task {
    id: string;
    titulo: string;
    descripcion?: string;
    estado: 'pendiente' | 'en_progreso' | 'completada';
    prioridad: 'baja' | 'media' | 'alta';
    fecha_vencimiento?: string;
    proyecto_id: string;
    asignado_a?: string;
    asignado?: User;
}

// Inventory Item type
export interface InventoryItem {
    id: string;
    nombre: string;
    descripcion?: string;
    cantidad: number;
    unidad: string;
    precio_unitario?: number;
    categoria?: string;
    proyecto_id: string;
}

// Lote (Production batch) type
export interface Lote {
    id: string;
    nombre: string;
    proceso_id: string;
    estado: string;
    etapa_actual?: number;
    proyecto_id: string;
    created_at?: string;
    updated_at?: string;
}

// Chat types
export interface MessageReaction {
    type: string;
    count: number;
    user_reacted?: boolean;
}

export interface Message {
    id: string;
    content: string;
    user_id: string;
    parent_id?: string;
    user: User;
    reactions?: MessageReaction[];
    replies_count?: number;
    created_at: string;
    updated_at: string;
    is_deleted?: boolean;
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
