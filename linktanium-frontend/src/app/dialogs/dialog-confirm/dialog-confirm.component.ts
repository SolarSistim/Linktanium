import { Component, Inject } from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogActions,
} from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-dialog-confirm",
  imports: [CommonModule, MatButtonModule, MatDialogContent, MatDialogActions],
  templateUrl: "./dialog-confirm.component.html",
  styleUrl: "./dialog-confirm.component.css",
})
export class DialogConfirmComponent {
  
  constructor(
    public dialogRef: MatDialogRef<DialogConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
