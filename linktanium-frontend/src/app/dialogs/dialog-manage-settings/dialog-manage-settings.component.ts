import { Component, inject } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-dialog-manage-settings",
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: "./dialog-manage-settings.component.html",
  styleUrl: "./dialog-manage-settings.component.css",
})
export class DialogManageSettingsComponent {
  private dialogRef = inject(MatDialogRef<DialogManageSettingsComponent>);

  closeDialog() {
    this.dialogRef.close();
  }
}
