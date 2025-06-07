import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-indicator-glow',
  imports: [],
  templateUrl: './indicator-glow.component.html',
  styleUrl: './indicator-glow.component.css'
})
export class IndicatorCurrentlyFilteringComponent {

  @Input() text: string = '';
  @Output() iconClicked = new EventEmitter<void>();

  onIconClick(event: MouseEvent): void {
    event.stopPropagation();
    this.iconClicked.emit();
  }

}
