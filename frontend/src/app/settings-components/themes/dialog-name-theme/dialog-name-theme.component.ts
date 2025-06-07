import { Component, Inject } from "@angular/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-dialog-name-theme",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: "./dialog-name-theme.component.html",
  styleUrl: "./dialog-name-theme.component.css",
})
export class DialogNameThemeComponent {
  themeName: string = "";

  constructor(
    public dialogRef: MatDialogRef<DialogNameThemeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    const name = this.themeName.trim();
    if (name) {
      this.dialogRef.close(name);
    }
  }
}
