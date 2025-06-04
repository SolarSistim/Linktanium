import { Component, Inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { DashboardDropService } from "../../features/dashboard-drop/dashboard-drop.service";
import { IconSelectorComponent } from "../dialog-manage-icons/icon-selector/icon-selector.component";
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "app-dialog-edit-single-link",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    MatDialogActions,
    IconSelectorComponent,
  ],
  templateUrl: "./dialog-edit-single-link.component.html",
  styleUrls: ["./dialog-edit-single-link.component.css"],
})
export class DialogEditSingleLinkComponent implements OnInit {
  
  linkWasUpdated = false;
  link: any = { id: null, name: "", url: "", description: "" };
  original: any = {};
  loading = true;
  selectedIcon = "default.png";
  isSelectingIcon = false;
  uploadInProgress = false;
  previewActive = false;

  constructor(
    private dialogRef: MatDialogRef<DialogEditSingleLinkComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { linkId: number },
    private dropService: DashboardDropService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dropService.getFullDashboard().subscribe((categories) => {
      for (const cat of categories) {
        for (const group of cat.groups) {
          const match = group.links.find((l: any) => l.id === this.data.linkId);
          if (match) {
            this.link = { ...match };
            this.original = { ...match };
            this.selectedIcon = match.icon || "default.png";
            break;
          }
        }
      }
      this.loading = false;

      this.cdr.detectChanges();
    });
  }

  handleUploadInProgress(isUploading: boolean) {
    this.uploadInProgress = isUploading;
  }

  handlePreviewActive(isPreviewing: boolean) {
    this.previewActive = isPreviewing;
  }

  save() {
    const { name, url, description } = this.link;
    this.dropService
      .updateLink(this.link.id, {
        name,
        url,
        description,
        icon: this.selectedIcon,
      })
      .subscribe({
        next: () => {
          console.log("Link updated successfully");
          this.original = { ...this.link };
          this.linkWasUpdated = true;
        },
        error: (err) => {
          console.error("Failed to update link", err);
          alert("Failed to update link.");
        },
      });
  }

  startSelectingIcon() {
    this.isSelectingIcon = true;
  }

  stopSelectingIcon() {
    this.isSelectingIcon = false;
  }

  delete() {
    if (confirm(`Are you sure you want to delete "${this.link.name}"?`)) {
      this.dropService.deleteLink(this.link.id).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error("Failed to delete link", err);
          alert("Failed to delete link.");
        },
      });
    }
  }

  cancel() {
    this.dialogRef.close(this.linkWasUpdated);
  }

  get isUnchanged(): boolean {
    return (
      this.link.name === this.original.name &&
      this.link.url === this.original.url &&
      this.link.description === this.original.description &&
      this.selectedIcon === (this.original.icon || "default.png")
    );
  }

  saveAndClose() {
    const { name, url, description } = this.link;

    if (!name.trim() || !url.trim() || this.isUnchanged) {
      this.dialogRef.close(false);
      return;
    }

    this.dropService
      .updateLink(this.link.id, {
        name,
        url,
        description,
        icon: this.selectedIcon,
      })
      .subscribe({
        next: () => {
          this.linkWasUpdated = true;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error("Failed to update link", err);
          alert("Failed to update link.");
        },
      });
  }

  saveOnly() {
    const { name, url, description } = this.link;

    if (!name.trim() || !url.trim() || this.isUnchanged) {
      return;
    }

    this.dropService
      .updateLink(this.link.id, {
        name,
        url,
        description,
        icon: this.selectedIcon,
      })
      .subscribe({
        next: () => {
          console.log("Link updated successfully");
          this.original = { ...this.link, icon: this.selectedIcon };
          this.linkWasUpdated = true;
        },
        error: (err) => {
          console.error("Failed to update link", err);
          alert("Failed to update link.");
        },
      });
  }
}
