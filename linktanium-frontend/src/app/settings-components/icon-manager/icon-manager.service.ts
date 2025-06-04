import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environment/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class IconManagerService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  fetchIcons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/icons`);
  }

  uploadIcon(file: File, title: string, description: string): Observable<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    return this.http.post(`${this.base}/icons`, formData);
  }

  updateIcon(
    id: number,
    title: string,
    description: string,
    filename: string
  ): Observable<any> {
    return this.http.put(`${this.base}/icons/${id}`, {
      title,
      description,
      filename,
    });
  }

  deleteIcon(id: number): Observable<any> {
    return this.http.delete(`${this.base}/icons/${id}`);
  }
}
