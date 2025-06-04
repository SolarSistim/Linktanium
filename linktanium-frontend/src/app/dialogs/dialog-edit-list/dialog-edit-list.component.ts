import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ListsService } from "../../features/lists/lists.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-dialog-edit-list",
  templateUrl: "./dialog-edit-list.component.html",
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  styleUrls: ["./dialog-edit-list.component.css"],
  standalone: true,
})
export class DialogEditListComponent {
  
  updatedName: string = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { list: any },
    private dialogRef: MatDialogRef<DialogEditListComponent>,
    private listsService: ListsService
  ) {
    this.updatedName = data.list?.name || "";
  }

  save() {
    const trimmed = this.updatedName.trim();
    if (!trimmed) return;

    this.listsService.updateListName(this.data.list.id, trimmed).subscribe({
      next: () => {
        this.dialogRef.close({ updatedName: trimmed });
      },
      error: (err) => {
        console.error("❌ Failed to update list name:", err);
        alert("Failed to update list name");
      },
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
