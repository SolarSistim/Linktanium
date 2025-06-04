import { Component, EventEmitter, Output, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
} from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { DashboardDropService } from "../../features/dashboard-drop/dashboard-drop.service";

@Component({
  selector: "app-dialog-add-category",
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
  templateUrl: "./dialog-add-category.component.html",
  styleUrls: ["./dialog-add-category.component.css"],
})
export class DialogAddCategoryComponent {
  
  @Output() categoryAdded = new EventEmitter<void>();
  dashboardDropService = inject(DashboardDropService);
  dialogRef = inject(MatDialogRef<DialogAddCategoryComponent>);
  newCategoryName = "";

  save(closeAfterSave: boolean = false) {
    const name = this.newCategoryName.trim();
    if (!name) return;

    this.dashboardDropService.fetchCategories().subscribe((categories) => {
      const position = categories.length;

      const payload = { name, position };

      this.dashboardDropService.createCategory(payload).subscribe({
        next: () => {
          this.categoryAdded.emit();
          if (closeAfterSave) {
            this.dialogRef.close();
          } else {
            this.newCategoryName = "";
          }
        },
        error: (err) => {
          console.error("Failed to create category", err);
          alert("Failed to create category.");
        },
      });
    });
  }

  saveAndAddAnother() {
    this.save(false);
  }

  saveAndClose() {
    this.save(true);
  }

  cancel() {
    this.dialogRef.close();
  }
}
