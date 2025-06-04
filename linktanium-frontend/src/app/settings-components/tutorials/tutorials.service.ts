import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environment/environment";

export interface Tutorial {
  id: number;
  feature: string;
  display: boolean;
}

@Injectable({
  providedIn: "root",
})
export class TutorialsService {
  private readonly API_URL = `${environment.apiUrl}/tutorials`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Tutorial[]> {
    return this.http.get<Tutorial[]>(this.API_URL);
  }

  getByFeature(feature: string): Observable<Tutorial> {
    return this.http.get<Tutorial>(`${this.API_URL}/feature/${feature}`);
  }

  updateDisplay(id: number, display: boolean): Observable<any> {
    return this.http.post(`${this.API_URL}/toggle-display/${id}`, { display });
  }

  toggleAllTutorials(display: boolean) {
    return this.http.patch(`${environment.apiUrl}/tutorials/toggle-all`, {
      display,
    });
  }
}
