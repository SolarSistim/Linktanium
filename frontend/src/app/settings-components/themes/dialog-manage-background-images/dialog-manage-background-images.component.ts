import { Component, OnInit, inject } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { MatDialogRef, MatDialogModule } from "@angular/material/dialog";
import { ThemesService } from "../themes.service";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";

@Component({
  selector: "app-dialog-manage-background-images",
  standalone: true,
  templateUrl: "./dialog-manage-background-images.component.html",
  styleUrl: "./dialog-manage-background-images.component.css",
  imports: [NgFor, MatDialogModule, MatButtonModule, NgIf, MatMenuModule],
})
export class DialogManageBackgroundImagesComponent implements OnInit {

  images: { filename: string; uploadedAt: string }[] = [];
  dialogRef = inject(MatDialogRef<DialogManageBackgroundImagesComponent>);

  constructor(private themesService: ThemesService) {}

  ngOnInit(): void {
    this.themesService.getAvailableBackgroundImages().subscribe((files) => {
      this.images = files;
    });
  }

  getBackgroundUrl(img: { filename: string }): string {
    return `assets/theme/background/${img.filename}`;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  selectImage(filename: string) {
    this.dialogRef.close(filename);
  }

  confirmDelete(filename: string, event: MouseEvent) {
    event.stopPropagation();

    const confirmed = confirm(`Are you sure you want to delete "${filename}"?`);
    if (!confirmed) return;

    this.themesService.deleteImage(filename).subscribe({
      next: () => {
        this.images = this.images.filter((img) => img.filename !== filename);
      },
      error: (err) => {
        console.error("Failed to delete image:", err);
        alert("Failed to delete image.");
      },
    });
  }
}
