import { Component, EventEmitter, Output, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ManageIconsService } from "../manage-icons.service";

@Component({
  selector: "app-icon-selector",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: "./icon-selector.component.html",
  styleUrls: ["./icon-selector.component.css"],
})
export class IconSelectorComponent {
  
  @Output() iconSelected = new EventEmitter<string>();
  @Input() showUploadSection = false;
  @Input() allowIconSelection = true;
  @Input() selectedIcon: string | null = null;
  @Output() uploadInProgress = new EventEmitter<boolean>();

  icons: any[] = [];
  filterText = "";

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  title: string = "";
  description: string = "";
  uploading = false;
  filenameExists = false;
  blinking = false;
  private justUploadedFilename: string | null = null;

  constructor(private iconService: ManageIconsService) {
    this.fetchIcons();
  }

  fetchIcons() {
    this.iconService.fetchIcons().subscribe((icons) => {
      this.icons = icons;

      if (this.justUploadedFilename) {
        const uploadedIcon = this.icons.find(
          (icon) =>
            icon.filename.toLowerCase() ===
            this.justUploadedFilename?.toLowerCase()
        );
        if (uploadedIcon) {
          this.selectedIcon = uploadedIcon.filename;
          this.iconSelected.emit(uploadedIcon.filename);
        }
        this.justUploadedFilename = null;
      }
    });
  }

  get filteredIcons() {
    const text = this.filterText.trim().toLowerCase();
    if (!text) return this.icons;
    return this.icons.filter((icon) => icon.title.toLowerCase().includes(text));
  }

  selectIcon(icon: any) {
    if (this.allowIconSelection) {
      this.iconSelected.emit(icon.filename);
    }
  }

  openFileExplorer() {
    this.filterText = "";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".png";
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.previewUrl = URL.createObjectURL(file);
        this.title = file.name.replace(/\.[^/.]+$/, "");

        this.checkFilenameExists(file.name);

        this.uploadInProgress.emit(true);
      }
    };
    fileInput.click();
  }

  checkFilenameExists(filename: string) {
    this.filenameExists = this.icons.some(
      (icon) => icon.filename.toLowerCase() === filename.toLowerCase()
    );
    if (this.filenameExists) {
      this.startBlinking();
    }
  }

  startBlinking() {
    this.blinking = true;
    setTimeout(() => {
      this.blinking = false;
    }, 1800);
  }

  uploadIcon() {
    if (!this.selectedFile || !this.title.trim()) return;
    this.uploading = true;

    const filenameToSelect = this.selectedFile.name;

    this.iconService
      .uploadIcon(this.selectedFile, this.title, this.description)
      .subscribe({
        next: () => {
          this.justUploadedFilename = filenameToSelect;
          this.resetUpload();
          this.fetchIcons();

          this.uploadInProgress.emit(false);
        },
        error: (err) => {
          console.error("Failed to upload icon", err);
          alert("Failed to upload icon.");
        },
        complete: () => {
          this.uploading = false;
        },
      });
  }

  clearFilter() {
    this.filterText = "";
  }

  resetUpload() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.title = "";
    this.description = "";
    this.filenameExists = false;
    this.blinking = false;

    this.uploadInProgress.emit(false);
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = "/assets/icons/missingicon.png";
  }
}
