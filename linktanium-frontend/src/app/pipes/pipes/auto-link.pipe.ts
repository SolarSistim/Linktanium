import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({ name: "autoLink" })
export class AutoLinkPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string): SafeHtml {
    if (!text) return "";

    const urlPattern =
      /(\b(https?:\/\/|www\.)[\w-]+(\.[\w-]+)+(:\d+)?(\/[^\s]*)?)/gi;

    const linkedText = text.replace(urlPattern, (url) => {
      const href = url.startsWith("http") ? url : `https://${url}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">${url}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(linkedText);
  }
}
