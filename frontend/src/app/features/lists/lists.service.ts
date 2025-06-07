import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environment/environment";

export interface List {
  id: number;
  name: string;
  icon?: string;
  group: { id: number; name: string; position: number };
  position: number;
  createdAt: string;
}

@Injectable({
  providedIn: "root",
})
export class ListsService {
  
  private readonly baseUrl = `${environment.apiUrl}/lists`;

  constructor(private http: HttpClient) {}

  createList(payload: { groupId: number; name: string }): Observable<List> {
    return this.http.post<List>(this.baseUrl, payload);
  }

  getListsByGroup(groupId: number): Observable<List[]> {
    return this.http.get<List[]>(`${this.baseUrl}/group/${groupId}`);
  }

  getListById(id: number): Observable<List> {
    return this.http.get<List>(`${this.baseUrl}/${id}`);
  }

  getListByName(slug: string): Observable<List> {
    return this.http.get<List>(`${this.baseUrl}/by-name/${slug}`);
  }

  updateListName(id: number, name: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, { name });
  }

  deleteList(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  moveAndReorderList(
    movedListId: number,
    newGroupId: number,
    reorderedLists: { id: number; position: number }[]
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/reorder`, {
      movedListId,
      newGroupId,
      reorderedLists,
    });
  }

  getListItems(listId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${listId}/items`);
  }

  addItemToList(payload: {
    listId: number;
    categoryId: number;
    title: string;
    description: string;
    priority: "High" | "Medium" | "Low"; // ✅ Add this line
  }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/items`, payload);
  }

  getDefaultCategory(listId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${listId}/default-category`);
  }

  addCategoryForList(listId: number, categoryName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${listId}/categories`, {
      name: categoryName,
    });
  }

  deleteCategoryForList(listId: number, categoryId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/${listId}/categories/id/${categoryId}`
    );
  }

  getCategoriesForList(listId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${listId}/categories`);
  }

  deleteItem(itemId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/items/${itemId}`);
  }

  reorderItems(
    payload: {
      id: number;
      position: number;
      categoryId: number | null;
      pinned: boolean;
    }[]
  ): Observable<any> {
    return this.http.put(`${environment.apiUrl}/items/reorder`, {
      items: payload,
    });
  }

  reorderCategoriesForList(
    listId: number,
    reorderedCategories: { id: number; position: number }[]
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/${listId}/categories/reorder`, {
      categories: reorderedCategories,
    });
  }

  updateCategoryName(
    listId: number,
    categoryId: number,
    newName: string
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/${listId}/categories/${categoryId}`, {
      name: newName,
    });
  }

  togglePin(id: number, pinned: boolean) {
    return this.http.put(`${environment.apiUrl}/items/${id}/pin`, { pinned });
  }

  updateItem(
    id: number,
    payload: {
      title: string;
      description: string;
      priority: "High" | "Medium" | "Low";
      categoryId: number | null;
      pinned?: boolean;
    }
  ) {
    return this.http.put(`${environment.apiUrl}/items/${id}`, payload);
  }

  completeItem(itemId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/items/complete/${itemId}`, {});
  }

  uncompleteItem(itemId: number): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/items/uncomplete/${itemId}`,
      {}
    );
  }

  getCompletedItems(listId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${listId}/completed-items`);
  }

  getAllListItems(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/items`);
  }

  getAllLists(): Observable<List[]> {
    return this.http.get<List[]>(`${environment.apiUrl}/lists`);
  }
}
