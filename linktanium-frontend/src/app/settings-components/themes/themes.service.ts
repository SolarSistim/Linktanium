import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environment/environment";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ThemesService {
  
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  loadThemes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/themes`);
  }

  saveTheme(name: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/themes`, { name, data });
  }

  deleteTheme(name: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/themes/${encodeURIComponent(name)}`
    );
  }

  getAvailableBackgroundImages(): Observable<
    { filename: string; uploadedAt: string }[]
  > {
    return this.http
      .get<{ filename: string; uploadedAt: string }[]>(
        `${this.apiUrl}/themes/list-images`
      )
      .pipe(map((res: any) => res.images));
  }

  uploadThemeImage(
    formData: FormData
  ): Observable<{ message: string; filename: string }> {
    return this.http.post<{ message: string; filename: string }>(
      `${this.apiUrl}/themes/upload-image`,
      formData
    );
  }

  deleteImage(filename: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/themes/delete-image/${encodeURIComponent(filename)}`
    );
  }
}
