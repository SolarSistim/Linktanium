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

@Component({
  selector: "app-dialog-edit-single-category",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    MatDialogActions,
  ],
  templateUrl: "./dialog-edit-single-category.component.html",
  styleUrls: ["./dialog-edit-single-category.component.css"],
})
export class DialogEditSingleCategoryComponent implements OnInit {
  
  category: any = { id: null, name: "" };
  originalName = "";
  loading = true;

  constructor(
    private dialogRef: MatDialogRef<DialogEditSingleCategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categoryId: number },
    private dashboardDropService: DashboardDropService
  ) {}

  ngOnInit() {
    this.dashboardDropService.fetchCategories().subscribe((categories) => {
      const match = categories.find(
        (cat: any) => cat.id === this.data.categoryId
      );
      if (match) {
        this.category = { ...match };
        this.originalName = match.name;
      }
      this.loading = false;
    });
  }

  save() {
    this.dashboardDropService
      .updateCategory(this.category.id, { name: this.category.name })
      .subscribe({
        next: () => {
          console.log("Category updated successfully");
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error("Update failed", err);
          alert("Failed to update category.");
        },
      });
  }

  delete() {
    if (confirm(`Are you sure you want to delete "${this.category.name}"?`)) {
      this.dashboardDropService.deleteCategory(this.category.id).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error("Delete failed", err);
          alert("Failed to delete category.");
        },
      });
    }
  }

  get isUnchanged(): boolean {
    return this.category.name === this.originalName;
  }

  cancel() {
    this.dialogRef.close();
  }
}
