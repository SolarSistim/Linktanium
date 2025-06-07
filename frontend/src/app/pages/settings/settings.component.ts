import { NgIf, CommonModule } from "@angular/common";
import { Component, OnDestroy, inject, signal, effect } from "@angular/core";
import { MediaMatcher } from "@angular/cdk/layout";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { IconManagerComponent } from "../../settings-components/icon-manager/icon-manager.component";
import { ThemesComponent } from "../../settings-components/themes/themes.component";
import { AboutComponent } from "../../settings-components/about/about.component";
import { AppSettingsComponent } from "../../settings-components/app-settings/app-settings.component";
import { RouterModule } from "@angular/router";
import { ImportExportComponent } from "../../settings-components/import-export/import-export.component";
import { TutorialsComponent } from "../../settings-components/tutorials/tutorials.component";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    IconManagerComponent,
    NgIf,
    CommonModule,
    ThemesComponent,
    AboutComponent,
    AppSettingsComponent,
    RouterModule,
    ImportExportComponent,
    TutorialsComponent,
  ],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.css",
})
export class SettingsComponent implements OnDestroy {
  
  protected readonly navItems = [
    "Icons",
    "Themes",
    "App Settings",
    "Import/Export",
    "About",
    "Tutorials",
  ];

  protected selectedPanel = signal(
    localStorage.getItem("settings.selectedPanel") || "app settings"
  );
  protected readonly isMobile = signal(true);

  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  constructor() {
    const media = inject(MediaMatcher);
    this._mobileQuery = media.matchMedia("(max-width: 600px)");
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () =>
      this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener("change", this._mobileQueryListener);
    effect(() => {
      localStorage.setItem("settings.selectedPanel", this.selectedPanel());
    });
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener("change", this._mobileQueryListener);
  }
}
