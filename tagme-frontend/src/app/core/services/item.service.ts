import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Item } from '../models/item.model';

export interface ItemFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private endpoint = 'items';

  constructor(private apiService: ApiService) {}

  getItems(filters?: ItemFilters): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ItemFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.apiService.get(`${this.endpoint}/pagination`, params);
  }

  getItem(id: number): Observable<Item> {
    return this.apiService.get(`${this.endpoint}/${id}`);
  }

  createItem(item: FormData): Observable<Item> {
    return this.apiService.post(this.endpoint, item);
  }

  updateItem(id: string, item: FormData): Observable<Item> {
    return this.apiService.put(`${this.endpoint}/${id}`, item);
  }

  deleteItem(id: string): Observable<void> {
    return this.apiService.delete(`${this.endpoint}/${id}`);
  }
}
