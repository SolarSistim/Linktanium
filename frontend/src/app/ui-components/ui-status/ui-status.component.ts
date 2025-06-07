import { Component, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StatusMessageService } from "./ui-status.service";
import { Subscription } from "rxjs";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
@Component({
  selector: "app-ui-status",
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: "./ui-status.component.html",
  styleUrl: "./ui-status.component.css",
})
export class UiStatusComponent implements OnDestroy {
  message: string | null = null;
  status: "loading" | "success" | "error" = "loading";
  private sub = new Subscription();
  constructor(
    private statusService: StatusMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.sub.add(
      this.statusService.message$.subscribe((msg) => {
        setTimeout(() => {
          this.message = msg;
          this.cdr.detectChanges();
        }, 0);
      })
    );
    this.sub.add(
      this.statusService.status$.subscribe((st) => {
        setTimeout(() => {
          this.status = st;
          this.cdr.detectChanges();
        }, 0);
      })
    );
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
