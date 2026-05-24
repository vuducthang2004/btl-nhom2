export interface Category {
  id: number;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  description: string | null;
  basePrice: number;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  toppings?: ToppingInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface ToppingInfo {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  sortOrder?: number;
}

export interface CreateMenuItemRequest {
  categoryId: number;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  sortOrder?: number;
  toppingIds?: number[];
}

export interface UpdateMenuItemRequest {
  categoryId?: number;
  name?: string;
  description?: string;
  basePrice?: number;
  imageUrl?: string;
  sortOrder?: number;
  toppingIds?: number[];
}

export interface CreateToppingRequest {
  name: string;
  price: number;
}

export interface UpdateToppingRequest {
  name?: string;
  price?: number;
}
