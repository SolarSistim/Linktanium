import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  Renderer2,
  ElementRef,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatDialog } from "@angular/material/dialog";
import { DialogManageCategoriesComponent } from "../../dialogs/dialog-manage-categories/dialog-manage-categories.component";
import { DialogManageLinkGroupsComponent } from "../../dialogs/dialog-manage-link-groups/dialog-manage-link-groups.component";
import { DialogManageLinksComponent } from "../../dialogs/dialog-manage-links/dialog-manage-links.component";
import { DialogManageSettingsComponent } from "../../dialogs/dialog-manage-settings/dialog-manage-settings.component";
import { DialogManageIconsComponent } from "../../dialogs/dialog-manage-icons/dialog-manage-icons.component";
import { RouterModule } from "@angular/router";
import { SettingsService } from "../../settings-components/app-settings/settings.service";

@Component({
  selector: "app-settings-button",
  imports: [MatButtonModule, MatMenuModule, RouterModule],
  templateUrl: "./settings-button.component.html",
  styleUrls: ["./settings-button.component.css"],
})
export class SettingsButtonComponent {
  @Output() refreshRequested = new EventEmitter<void>();

  constructor(
    private dialog: MatDialog,
    private settingsService: SettingsService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.settingsService.loadSettings().subscribe((settings) => {
      const hex = settings["SETTINGS_BUTTON_BACKGROUND_COLOR"] || "#ffffff";
      const opacity = parseFloat(
        settings["SETTINGS_BUTTON_BACKGROUND_OPACITY"] || "1.0"
      );
      const rgba = this.hexToRgba(hex, opacity);

      const btn = this.el.nativeElement.querySelector(".settings-button");
      if (btn) {
        this.renderer.setStyle(btn, "background-color", rgba);
      }
    });
  }

  private hexToRgba(hex: string, opacity: number): string {
    let r = 0,
      g = 0,
      b = 0;
    hex = hex.replace("#", "");

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  DialogManageIconsComponent(): void {
    const dialogRef = this.dialog.open(DialogManageIconsComponent, {
      width: "650px",
    });

    dialogRef.afterClosed().subscribe(() => {
      this.refreshRequested.emit();
    });
  }

  openManageGroupsDialog(categoryId?: number, groupId?: number): void {
    const dialogRef = this.dialog.open(DialogManageLinkGroupsComponent, {
      width: "600px",
      data: {
        categoryId,
        groupId,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.refreshRequested.emit();
    });
  }

  openManageCategoryDialog(categoryId?: number, groupId?: number): void {
    const dialogRef = this.dialog.open(DialogManageCategoriesComponent, {
      width: "600px",
      data: {
        categoryId,
        groupId,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.refreshRequested.emit();
    });
  }

  openManageLinksDialog(categoryId?: number, groupId?: number): void {
    const dialogRef = this.dialog.open(DialogManageLinksComponent, {
      width: "600px",
      data: {
        categoryId,
        groupId,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.refreshRequested.emit();
    });
  }

  openSettingsDialog(categoryId?: number, groupId?: number): void {
    const dialogRef = this.dialog.open(DialogManageSettingsComponent, {
      width: "600px",
      data: {
        categoryId,
        groupId,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.refreshRequested.emit();
    });
  }
}
