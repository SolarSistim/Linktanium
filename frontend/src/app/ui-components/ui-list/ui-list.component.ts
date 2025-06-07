import { Component, Input, Output, EventEmitter, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { MatDialog } from "@angular/material/dialog";
import { ListsService } from "../../features/lists/lists.service";
import { DialogEditListComponent } from "../../dialogs/dialog-edit-list/dialog-edit-list.component";
import { SettingsService } from "../../settings-components/app-settings/settings.service";

@Component({
  selector: "app-ui-list",
  standalone: true,
  imports: [CommonModule, MatMenuModule],
  templateUrl: "./ui-list.component.html",
  styleUrl: "./ui-list.component.css",
})
export class UiListComponent {
  
  listStyles: {
    backgroundColor: string;
    fontColor: string;
    listIconColor: string;
    fontWeight: string;
    fontSize: number;
    borderColor: string;
    borderWidth: string;
    borderRadius: string;
  } = {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    fontColor: "#ffffff",
    listIconColor: "",
    fontWeight: "400",
    fontSize: 13,
    borderColor: "#ffffff",
    borderWidth: "1px",
    borderRadius: "3px",
  };

  listItems: any[] = [];
  loading = true;

  @Input() showHandles = false;
  @Input() list!: any;
  @Output() openList = new EventEmitter<void>();
  @Output() listDeleted = new EventEmitter<void>();
  private settingsService = inject(SettingsService);

  private listsService = inject(ListsService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.settingsService.loadSettings().subscribe((settings) => {
      const bgHex = settings["LIST_BACKGROUND_COLOR"] || "#000000";
      const opacity = parseFloat(settings["LIST_BACKGROUND_OPACITY"] || "0.2");
      const r = parseInt(bgHex.substring(1, 3), 16);
      const g = parseInt(bgHex.substring(3, 5), 16);
      const b = parseInt(bgHex.substring(5, 7), 16);
      this.listStyles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;

      this.listStyles.fontColor = settings["LIST_FONT_COLOR"] || "#ffffff";

      // Here
      this.listStyles.listIconColor = settings["LIST_ICON_COLOR"] || "#ffffff";

      this.listStyles.fontWeight = settings["LIST_FONT_WEIGHT"] || "400";
      this.listStyles.fontSize = parseInt(
        settings["LIST_FONT_SIZE"] || "13",
        10
      );
      this.listStyles.borderColor = settings["LIST_BORDER_COLOR"] || "#ffffff";
      this.listStyles.borderWidth = settings["LIST_BORDER_WIDTH"];
      this.listStyles.borderRadius =
        settings["LIST_BORDER_CORNER_RADIUS"] || "1px";
    });
  }

  open() {
    this.openList.emit();
  }

  openEditDialog() {
    const dialogRef = this.dialog.open(DialogEditListComponent, {
      width: "400px",
      data: { list: this.list },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.updatedName) {
        this.list.name = result.updatedName;
      }
    });
  }

  confirmDelete() {
    if (
      confirm(`Are you sure you want to delete the list "${this.list.name}"?`)
    ) {
      this.listsService.deleteList(this.list.id).subscribe({
        next: () => {
          this.listDeleted.emit();
          console.log("List delete emitted");
        },
        error: (err) => {
          console.error("❌ Failed to delete list:", err);
          alert("Something went wrong while deleting the list.");
        },
      });
    }
  }
}
