import { Component, inject, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import {
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
} from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { environment } from "../../../environment/environment";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatMenuModule } from "@angular/material/menu";
import { ManageIconsService } from "./manage-icons.service";
import { MatTabsModule } from "@angular/material/tabs";

@Component({
  selector: "app-dialog-manage-icons",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    MatDialogActions,
    MatTooltipModule,
    MatMenuModule,
    MatTabsModule,
  ],
  templateUrl: "./dialog-manage-icons.component.html",
  styleUrl: "./dialog-manage-icons.component.css",
})
export class DialogManageIconsComponent {
  
  private dialogRef = inject(MatDialogRef<DialogManageIconsComponent>);
  private readonly base = environment.apiUrl;
  private http = inject(HttpClient);
  private iconService = inject(ManageIconsService);
  icons: any[] = [];
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  title: string = "";
  description: string = "";
  filenameExists = false;
  blinking = false;
  editingIconId: number | null = null;
  editedTitle: string = "";
  editedDescription: string = "";
  filterText: string = "";
  showIconNote = true;
  allowEdit = true;
  editedFilename: string = "";
  selectedTabIndex = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const savedSetting = localStorage.getItem("showIconNote");
    this.showIconNote = savedSetting !== "false";
    setTimeout(() => {
      this.fetchIcons();
    });
  }

  get filteredIcons() {
    if (!this.filterText.trim()) {
      return this.icons;
    }

    const text = this.filterText.trim().toLowerCase();
    return this.icons.filter(
      (icon) =>
        icon.filename?.toLowerCase().includes(text) ||
        "" ||
        icon.title?.toLowerCase().includes(text) ||
        "" ||
        icon.description?.toLowerCase().includes(text) ||
        ""
    );
  }

  fetchIcons() {
    this.iconService.fetchIcons().subscribe((data) => {
      this.icons = [...data];
      this.cdr.detectChanges();
    });
  }

  openFileExplorer() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.previewUrl = URL.createObjectURL(file);
        this.title = file.name.replace(/\.[^/.]+$/, "");

        this.filenameExists = this.icons.some(
          (icon) => icon.filename.toLowerCase() === file.name.toLowerCase()
        );

        if (this.filenameExists) {
          this.startBlinking();
        }
      }
    };
    input.click();
  }

  confirmDelete(icon: any) {
    if (!icon) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${icon.title}"?`
    );

    if (confirmDelete) {
      this.iconService.deleteIcon(icon.id).subscribe({
        next: (res: any) => {
          this.fetchIcons();
        },
        error: (err) => {
          console.error("Failed to delete icon:", err);
        },
      });
    }
  }

  startBlinking() {
    this.blinking = true;
    setTimeout(() => {
      this.blinking = false;
    }, 1800);
  }

  resetUpload() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.title = "";
    this.description = "";
    this.filenameExists = false;
  }

  uploadIcon() {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.iconService
      .uploadIcon(
        this.selectedFile,
        this.title || this.selectedFile.name.replace(".png", ""),
        this.description || ""
      )
      .subscribe({
        next: () => {
          this.uploading = false;
          this.resetUpload();
          this.fetchIcons();
        },
        error: (err) => {
          console.error(err);
          this.uploading = false;
        },
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  startEditingIcon(icon: any) {
    this.editingIconId = icon.id;
    this.editedTitle = icon.title;
    this.editedDescription = icon.description;
    this.editedFilename = icon.filename;
  }

  cancelEditing() {
    this.editingIconId = null;
    this.editedTitle = "";
    this.editedDescription = "";
  }

  getEditingIcon() {
    return this.icons.find((icon) => icon.id === this.editingIconId) || null;
  }

  clearFilter() {
    this.filterText = "";
  }

  saveEditedIcon(icon: any) {
    if (!this.editedTitle.trim() || !this.editedFilename.trim()) return;

    this.iconService
      .updateIcon(
        icon.id,
        this.editedTitle.trim(),
        this.editedDescription.trim(),
        this.editedFilename.trim()
      )
      .subscribe({
        next: () => {
          this.cancelEditing();
          this.fetchIcons();
        },
        error: (err) => {
          console.error("Failed to update icon:", err);
        },
      });
  }

  hasChanges(): boolean {
    const editingIcon = this.getEditingIcon();
    if (!editingIcon) return false;

    return (
      editingIcon.title !== this.editedTitle.trim() ||
      editingIcon.description !== this.editedDescription.trim() ||
      editingIcon.filename !== this.editedFilename.trim()
    );
  }

  confirmDeleteDuringEdit(icon: any) {
    if (!icon) {
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${icon.title}"?`
    );
    if (confirmDelete) {
      this.http.delete(`${this.base}/icons/${icon.id}`).subscribe({
        next: () => {
          this.cancelEditing();
          this.fetchIcons();
        },
        error: (err) => {
          console.error("Failed to delete icon:", err);
        },
      });
    }
  }

  showNote() {
    this.showIconNote = true;
    localStorage.setItem("showIconNote", "true");
  }

  dontShowAgain() {
    this.showIconNote = false;
    localStorage.setItem("showIconNote", "false");
  }

  multiUploadFiles: {
    file: File;
    previewUrl: string;
    title: string;
    description: string;
  }[] = [];

  duplicateFiles: {
    file: File;
    previewUrl: string;
    title: string;
    description: string;
  }[] = [];

  handleMultiIconSelect(event: any) {
    const files: FileList = event.target.files;
    this.multiUploadFiles = [];
    this.duplicateFiles = [];

    const existingFilenames = this.icons.map((icon) =>
      icon.filename.toLowerCase()
    );

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^/.]+$/, "");
      const isDuplicate = existingFilenames.includes(file.name.toLowerCase());

      const iconData = {
        file,
        previewUrl,
        title,
        description: "",
      };

      if (isDuplicate) {
        this.duplicateFiles.push(iconData);
      } else {
        this.multiUploadFiles.push(iconData);
      }
    }
  }

  uploadMultipleIcons() {
    this.uploading = true;

    const uploads = this.multiUploadFiles.map((icon) =>
      this.iconService.uploadIcon(icon.file, icon.title, icon.description)
    );

    Promise.all(uploads.map((req) => req.toPromise()))
      .then(() => {
        this.uploading = false;
        this.resetMultiUpload();
        this.fetchIcons();
      })
      .catch((err) => {
        console.error("Failed to upload one or more icons:", err);
        this.uploading = false;
      });
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
  }

  resetMultiUpload() {
    this.multiUploadFiles = [];
    this.duplicateFiles = [];
  }
}
