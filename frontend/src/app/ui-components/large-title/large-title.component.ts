import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-large-title',
  imports: [],
  templateUrl: './large-title.component.html',
  styleUrl: './large-title.component.css'
})
export class LargeTitleComponent {

  @Input() title: string = '';

}
