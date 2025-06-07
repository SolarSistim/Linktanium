import { Component, OnInit, inject, ViewChild } from "@angular/core";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";
import { CommonModule } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { SearchComponent } from "../../features/search/search.component";
import { MatMenuModule } from "@angular/material/menu";
import { DashboardDropComponent } from "../../features/dashboard-drop/dashboard-drop.component";
import { UiStatusComponent } from "../../ui-components/ui-status/ui-status.component";
import { StatusMessageService } from "../../ui-components/ui-status/ui-status.service";
import { DialogManageIconsComponent } from "../../dialogs/dialog-manage-icons/dialog-manage-icons.component";
import { SettingsButtonComponent } from "../../ui-components/settings-button/settings-button.component";
import { SettingsService } from "../../settings-components/app-settings/settings.service";
import { UiLoaderComponent } from "../../ui-components/ui-loader/ui-loader.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    SearchComponent,
    CommonModule,
    MatMenuModule,
    DashboardDropComponent,
    UiStatusComponent,
    SettingsButtonComponent,
    UiLoaderComponent,
  ],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {

  showLogo = false;
  searchFeature = false;
  backgroundColor = "#212529";
  logoHeight = '';
  logoWidth = '';

  constructor(
    private statusService: StatusMessageService,
    private dialog: MatDialog,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.settingsService.loadSettings().subscribe((settings) => {
      this.showLogo = settings["LOGO_ENABLE"] !== "FALSE";
      this.searchFeature = settings["SEARCH_FEATURE"] !== "FALSE";
      this.logoHeight = settings['LOGO_HEIGHT_PX'];
      this.logoWidth = settings['LOGO_WIDTH_PX'];
    });
  }

  testStatus(type: "loading" | "success" | "error") {
    this.statusService.show(`Test: ${type}`, type);
  }

  openEditIconsDialog(): void {
    const dialogRef = this.dialog.open(DialogManageIconsComponent, {
      width: "700px",
    });

    dialogRef.afterClosed().subscribe(() => {
      return;
    });
  }
}
