import { Component, Inject } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { HttpClient } from "@angular/common/http";
import { ListsService } from "../../features/lists/lists.service";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-dialog-add-list",
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
  ],
  templateUrl: "./dialog-add-list.component.html",
  styleUrl: "./dialog-add-list.component.css",
})
export class DialogAddListComponent {
  
  listName = "";

  constructor(
    private dialogRef: MatDialogRef<DialogAddListComponent>,
    private http: HttpClient,
    private listsService: ListsService,
    @Inject(MAT_DIALOG_DATA) public data: { groupId: number }
  ) {}

  cancel() {
    this.dialogRef.close();
  }

  save() {
    const payload = {
      name: this.listName.trim(),
      groupId: this.data.groupId,
    };

    this.listsService.createList(payload).subscribe({
      next: (res) => {
        console.log("List created:", res);
        this.dialogRef.close({ created: true, list: res });
      },
      error: (err) => {
        console.error(err);
        alert("Failed to create list.");
      },
    });
  }
}
