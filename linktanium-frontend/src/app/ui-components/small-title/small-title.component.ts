import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-small-title',
  imports: [],
  templateUrl: './small-title.component.html',
  styleUrl: './small-title.component.css'
})
export class SmallTitleComponent {

  @Input() title: string = '';

}
