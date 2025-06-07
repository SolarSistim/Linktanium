import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { DragDropModule } from "@angular/cdk/drag-drop";

@Component({
  selector: "app-list-item",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    DragDropModule,
  ],
  templateUrl: "./list-item.component.html",
  styleUrls: ["./list-item.component.css"],
})
export class ListItemComponent {
  @Input() item: any;
  @Input() categories: any[] = [];
  @Input() styleSettings: any;
  @Input() isMobile: boolean = false;
  @Input() disableDrag: boolean = false;

  @Output() delete = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() pinToggle = new EventEmitter<MouseEvent>();

  getPriorityColor(priority: string): string {
    return priority === "High"
      ? "#ef5350"
      : priority === "Medium"
      ? "#ffca2c"
      : "#67bb6a";
  }

  toggleDetails(): void {
    this.item.showDetails = !this.item.showDetails;
  }

  startEdit(): void {
    this.item.isEditing = true;
    this.item.showDetails = false;
    this.item.tempTitle = this.item.title;
    this.item.tempPriority = this.item.priority;
    this.item.tempCategoryId = this.item.category?.id || null;
    this.item.tempDescription = this.item.description;
  }

  cancelEdit(): void {
    this.item.isEditing = false;
    this.item.showDetails = false;
    this.item.tempTitle = "";
    this.item.tempDescription = "";
    this.item.tempPriority = "Medium";
    this.item.tempCategoryId = null;
  }
}
