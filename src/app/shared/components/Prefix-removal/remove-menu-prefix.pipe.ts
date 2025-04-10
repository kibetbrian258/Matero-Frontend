import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeMenuPrefix',
  standalone: true,
})
export class RemoveMenuPrefixPipe implements PipeTransform {
  transform(value: string): string {
    // Check if the string starts with "menu." and remove it
    if (value && value.startsWith('menu.')) {
      return value.substring(5);
    }
    return value;
  }
}
