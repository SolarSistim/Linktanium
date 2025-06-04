import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ListsService } from "../../../features/lists/lists.service";
import { SettingsService } from "../../../settings-components/app-settings/settings.service";

@Component({
  selector: "app-add-list-item",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: "./add-list-item.component.html",
  styleUrls: ["./add-list-item.component.css"],
})
export class AddListItemComponent implements OnChanges {
  @Input() listId!: number;
  @Input() categories: any[] = [];
  @Input() styleSettings: any;
  @Input() selectedCategoryId: number | null = null;
  @Output() itemCreated = new EventEmitter<{ keepFormOpen: boolean }>();

  newTitle = "";
  newDescription = "";
  newPriority: "High" | "Medium" | "Low" = "Medium";

  constructor(
    private listsService: ListsService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.settingsService.getSettingByKey("LIST_DEFAULT_PRIORITY").subscribe({
      next: (value) => {
        const valid = ["High", "Medium", "Low"];
        if (typeof value === "string" && valid.includes(value)) {
          this.newPriority = value as "High" | "Medium" | "Low";
        }
      },
      error: (err) => {
        console.warn("Could not load LIST_DEFAULT_PRIORITY setting:", err);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes["categories"] &&
      this.categories?.length > 0 &&
      this.selectedCategoryId == null
    ) {
      this.selectedCategoryId = this.categories[0].id;
    }
  }

  submit(keepFormOpen: boolean) {
    if (!this.newTitle.trim() || !this.selectedCategoryId || !this.listId)
      return;

    this.listsService
      .addItemToList({
        listId: this.listId,
        categoryId: this.selectedCategoryId,
        title: this.newTitle.trim(),
        description: this.newDescription.trim(),
        priority: this.newPriority,
      })
      .subscribe({
        next: () => {
          this.itemCreated.emit({ keepFormOpen });

          this.resetForm();

          if (!keepFormOpen) {
          }
        },
        error: (err) => {
          console.error("❌ Failed to add item:", err);
          alert("Failed to add item");
        },
      });
  }

  resetForm() {
    this.newTitle = "";
    this.newDescription = "";

    this.settingsService.getSettingByKey("LIST_DEFAULT_PRIORITY").subscribe({
      next: (value) => {
        const valid = ["High", "Medium", "Low"];
        if (typeof value === "string" && valid.includes(value)) {
          this.newPriority = value as "High" | "Medium" | "Low";
        } else {
          this.newPriority = "Medium";
        }
      },
      error: () => {
        this.newPriority = "Medium";
      },
    });
  }
}
