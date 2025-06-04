import { environment } from "../../../environment/environment";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, shareReplay } from "rxjs";

export interface Setting {
  id: number;
  key: string;
  value: string;
}

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  private settingsUrl = `${environment.apiUrl}/settings`;
  private settingsCache$: Observable<Record<string, string>> | undefined;

  constructor(private http: HttpClient) {}

  loadSettings(): Observable<Record<string, string>> {
    if (!this.settingsCache$) {
      this.settingsCache$ = this.http.get<Setting[]>(this.settingsUrl).pipe(
        map((settings) =>
          settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
          }, {} as Record<string, string>)
        ),
        shareReplay(1)
      );
    }
    return this.settingsCache$;
  }

  getSettingByKey(key: string): Observable<string | undefined> {
    return this.loadSettings().pipe(map((all) => all[key]));
  }

  clearCache(): void {
    this.settingsCache$ = undefined!;
  }

  saveSetting(key: string, value: string): Observable<any> {
    const url = `${this.settingsUrl}?key=${encodeURIComponent(
      key
    )}&value=${encodeURIComponent(value)}`;
    return this.http.post(url, null);
  }

  uploadImage(formData: FormData): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/settings/upload-image`,
      formData
    );
  }
}
