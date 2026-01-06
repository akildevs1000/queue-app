import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    image: string; // ✅ Assume this is a full URL or relative path
    user: object;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    products?: Product[]; // ✅ Add this line
    [key: string]: unknown;
}

export interface User {
    id: number;
    machine_id: string;
    name: string;
    email: string;
    ip: string;
    port: string;
    media_type: string;
    media_url: string;
    media_height: string;
    media_width: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface TokenCounts {
    served: number;
    pending: number;
}

export interface ServiceList {
    id: string;
    name: string;
}

export interface CounterList {
    id: string;
    name: string;
}
