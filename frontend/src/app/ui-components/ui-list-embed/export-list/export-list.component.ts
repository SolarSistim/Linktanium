import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";

@Component({
  selector: "app-export-list",
  standalone: true,
  imports: [CommonModule, FormsModule, MatCheckboxModule],
  templateUrl: "./export-list.component.html",
  styleUrls: ["./export-list.component.css"],
})
export class ExportListComponent implements OnInit {
  
  @Input() listName: string = "";
  @Output() closeExport = new EventEmitter<void>();
  @Output() confirmExport = new EventEmitter<void>();
  @Output() exportOptionsValid = new EventEmitter<boolean>();
  @Input() items: any[] = [];
  @Input() categories: { id: number; name: string }[] = [];

  exportTitle = true;
  exportCategories = true;
  justExportItems = false;

  ngOnInit(): void {
    this.emitExportOptionsValid();
  }

  onJustExportItemsChanged() {
    if (this.justExportItems) {
      this.exportTitle = false;
      this.exportCategories = false;
    }
    this.emitExportOptionsValid();
  }

  onExportOptionChange() {
    if (this.exportTitle || this.exportCategories) {
      this.justExportItems = false;
    }
    this.emitExportOptionsValid();
  }

  emitExportOptionsValid() {
    const isValid =
      this.exportTitle || this.exportCategories || this.justExportItems;
    this.exportOptionsValid.emit(isValid);
  }

  exportToTxt() {
    let content = "";

    if (this.justExportItems) {
      content = this.items
        .map((item, index) => {
          let line = `${index + 1}. ${item.title}`;
          if (item.description?.trim()) {
            line += `\nDescription: ${item.description.trim()}`;
          }
          return line;
        })
        .join("\n");
    } else {
      if (this.exportTitle) {
        content += `List: ${this.listName}\n\n`;
      }

      if (this.exportCategories) {
        const itemsByCategory: { [category: string]: any[] } = {};

        for (const item of this.items) {
          const category = item.category?.name || "Uncategorized";
          if (!itemsByCategory[category]) itemsByCategory[category] = [];
          itemsByCategory[category].push(item);
        }

        const categories = Object.keys(itemsByCategory);
        categories.forEach((category, catIdx) => {
          const categoryNumber = catIdx + 1;
          content += `Category ${categoryNumber} - ${category}:\n`;

          itemsByCategory[category].forEach((item, itemIdx) => {
            content += `${categoryNumber}.${itemIdx + 1} ${item.title}`;
            if (item.description?.trim()) {
              content += `\nDescription: ${item.description.trim()}`;
            }
            content += "\n";
          });

          content += "\n";
        });
      } else {
        content += this.items
          .map((item, index) => {
            let line = `${index + 1}. ${item.title}`;
            if (item.description?.trim()) {
              line += `\nDescription: ${item.description.trim()}`;
            }
            return line;
          })
          .join("\n");
      }
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.listName || "list"}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  onConfirmExportClick() {
    this.exportToTxt();
    this.confirmExport.emit();
  }
}
