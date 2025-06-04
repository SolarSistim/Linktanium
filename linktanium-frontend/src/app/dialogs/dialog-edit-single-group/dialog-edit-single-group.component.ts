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
  selector: "app-dialog-edit-single-group",
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
  templateUrl: "./dialog-edit-single-group.component.html",
  styleUrls: ["./dialog-edit-single-group.component.css"],
})
export class DialogEditSingleGroupComponent implements OnInit {
  
  group: any = { id: null, name: "" };
  originalName = "";
  loading = true;

  constructor(
    private dialogRef: MatDialogRef<DialogEditSingleGroupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { groupId: number },
    private dashboardDropService: DashboardDropService
  ) {}

  ngOnInit() {
    this.dashboardDropService.fetchCategories().subscribe((categories) => {
      for (const cat of categories) {
        const match = cat.groups.find((g: any) => g.id === this.data.groupId);
        if (match) {
          this.group = { ...match };
          this.originalName = match.name;
          break;
        }
      }
      this.loading = false;
    });
  }

  get isUnchanged(): boolean {
    return this.group.name.trim() === this.originalName.trim();
  }

  save() {
    this.dashboardDropService
      .updateGroup(this.group.id, { name: this.group.name })
      .subscribe({
        next: () => {
          console.log("Group updated successfully");
          this.originalName = this.group.name;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error("Update failed", err);
          alert("Failed to update group.");
        },
      });
  }

  delete() {
    if (confirm(`Are you sure you want to delete "${this.group.name}"?`)) {
      this.dashboardDropService.deleteGroup(this.group.id).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error("Delete failed", err);
          alert("Failed to delete group.");
        },
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
