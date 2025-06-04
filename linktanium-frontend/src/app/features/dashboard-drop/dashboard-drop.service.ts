import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environment/environment";

@Injectable({
  providedIn: "root",
})
export class DashboardDropService {
  
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  fetchCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/link-categories`);
  }

  reorderGroups(
    categoryId: number,
    groups: { id: number; position: number }[]
  ) {
    return this.http.post(`${this.base}/link-groups/reorder`, {
      categoryId,
      groups,
    });
  }

  reorderLinks(links: { id: number; position: number }[]) {
    return this.http.put(`${this.base}/links/reorder`, links);
  }

  reorderLists(groupId: number, lists: { id: number; position: number }[]) {
    return this.http.put(`${this.base}/lists/reorder-list`, { groupId, lists });
  }

  updateLinkGroup(linkId: number, groupId: number) {
    return this.http.put(`${this.base}/links/${linkId}`, {
      groupId,
    });
  }

  updateGroup(groupId: number, data: any) {
    return this.http.put(`${this.base}/link-groups/${groupId}`, data);
  }

  deleteLink(linkId: number) {
    return this.http.delete(`${this.base}/links/${linkId}`);
  }

  deleteGroup(groupId: number) {
    return this.http.delete(`${this.base}/link-groups/${groupId}`);
  }

  createLinkGroup(payload: {
    name: string;
    categoryId: number;
    position: number;
  }) {
    return this.http.post(`${this.base}/link-groups`, payload);
  }

  deleteCategory(categoryId: number) {
    return this.http.delete(`${this.base}/link-categories/${categoryId}`);
  }

  updateCategory(categoryId: number, data: any) {
    return this.http.put(`${this.base}/link-categories/${categoryId}`, data);
  }

  createCategory(payload: { name: string }) {
    return this.http.post(`${this.base}/link-categories`, payload);
  }

  fetchSimpleCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/link-categories/simple`);
  }

  fetchFullCategory(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/link-categories/${id}/full`);
  }

  createLink(data: {
    name: string;
    url: string;
    icon: string;
    description?: string;
    groupId: number;
    tags?: string[];
    position?: number;
  }) {
    return this.http.post(`${this.base}/links`, data);
  }

  moveAndReorderLink(
    movedLinkId: number,
    newGroupId: number,
    reorderedLinks: { id: number; position: number }[]
  ) {
    return this.http.put(`${this.base}/links/move-and-reorder`, {
      movedLinkId,
      newGroupId,
      reorderedLinks,
    });
  }

  updateLink(
    id: number,
    data: {
      name?: string;
      url?: string;
      icon?: string;
      description?: string;
      groupId?: number | null;
      tags?: string[];
    }
  ) {
    return this.http.put(`${this.base}/links/${id}`, data);
  }

  reorderCategories(data: { id: number; position: number }[]) {
    return this.http.put(`${this.base}/link-categories/reorder`, data);
  }

  reorderLinkGroups(groups: { id: number; position: number }[]) {
    return this.http.post(`${this.base}/link-groups/reorder`, groups);
  }

  getAllLinks() {
    return this.http.get<any[]>(`${this.base}/links`);
  }

  getFullDashboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/link-categories`);
  }

  moveAndReorderList(
    movedListId: number,
    newGroupId: number,
    reorderedLists: { id: number; position: number }[]
  ) {
    return this.http.put(`${this.base}/lists/move-reorder-list`, {
      movedListId,
      newGroupId,
      reorderedLists,
    });
  }
}
