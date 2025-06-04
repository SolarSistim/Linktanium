import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ListsService } from "../../../features/lists/lists.service";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { IndicatorCurrentlyFilteringComponent } from "../../indicator-glow/indicator-glow.component";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-completed-list-items",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    IndicatorCurrentlyFilteringComponent,
    MatIconModule,
  ],
  templateUrl: "./completed-list-items.component.html",
  styleUrls: ["./completed-list-items.component.css"],
})
export class CompletedListItemsComponent implements OnInit {
  @Output() restoreAll = new EventEmitter<void>();
  @Input() listId!: number;
  @Input() styleSettings: any;
  @Output() itemRestored = new EventEmitter<any>();
  @Output() countChanged = new EventEmitter<number>();

  items: any[] = [];
  loading = true;
  filterText: string = "";
  selectedSortOption: string = "date-desc";

  constructor(private listsService: ListsService) {}

  ngOnInit(): void {
    if (!this.listId) return;
    this.listsService.getCompletedItems(this.listId).subscribe({
      next: (items) => {
        this.items = items;
        this.countChanged.emit(this.items.length);
        this.loading = false;
      },
      error: (err) => {
        console.error("❌ Failed to load completed items:", err);
        this.loading = false;
      },
    });
  }

  get isFiltering(): boolean {
    return this.filterText.trim().length > 0;
  }

  get filteredItems(): any[] {
    let filtered = this.items;

    if (this.filterText) {
      const lower = this.filterText.toLowerCase();
      filtered = filtered.filter((item) =>
        item.title?.toLowerCase().includes(lower)
      );
    }

    switch (this.selectedSortOption) {
      case "title-asc":
        filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        filtered = filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "date-asc":
        filtered = filtered.sort(
          (a, b) =>
            new Date(a.completedAt).getTime() -
            new Date(b.completedAt).getTime()
        );
        break;
      case "date-desc":
        filtered = filtered.sort(
          (a, b) =>
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime()
        );
        break;
    }

    return filtered;
  }

  get isFilterActiveAndEmpty(): boolean {
    return this.filterText.trim().length > 0 && this.filteredItems.length === 0;
  }

  restoreItem(item: any) {
    this.listsService.uncompleteItem(item.id).subscribe({
      next: (restored) => {
        this.itemRestored.emit(restored);
        this.items = this.items.filter((i) => i.id !== item.id);
        this.countChanged.emit(this.items.length);
      },
      error: (err) => {
        console.error("❌ Failed to restore item:", err);
        alert("Failed to restore item.");
      },
    });
  }

  restoreAllItems() {
    const itemsToRestore = [...this.items];
    const restoreRequests = itemsToRestore.map((item) =>
      this.listsService.uncompleteItem(item.id).toPromise()
    );

    Promise.all(restoreRequests)
      .then((restoredItems) => {
        restoredItems.forEach((item) => this.itemRestored.emit(item));
        this.items = [];
        this.countChanged.emit(0);
      })
      .catch((err) => {
        console.error("❌ Failed to restore all items:", err);
        alert("Failed to restore all items.");
      });
  }

  restoreAllItemsFromChild() {
    this.restoreAll.emit();
  }
}
