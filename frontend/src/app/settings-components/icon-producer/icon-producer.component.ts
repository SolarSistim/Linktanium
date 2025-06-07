import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
} from "ngx-image-cropper";
import { FormsModule } from "@angular/forms";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { TutorialIconProducerComponent } from "../tutorials/tutorial-components/tutorial-icon-producer/tutorial-icon-producer.component";

@Component({
  selector: "app-icon-producer",
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    ImageCropperComponent,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    TutorialIconProducerComponent,
  ],
  templateUrl: "./icon-producer.component.html",
  styleUrl: "./icon-producer.component.css",
})
export class IconProducerComponent {
  
  exportSizes = [64, 128, 256, 512];
  selectedExportSize = 128;
  imageChangedEvent: Event | null = null;
  croppedBlob: Blob | null = null;
  croppedImageUrl: SafeUrl | null = null;
  exportFilename = "icon";
  showFormatWarning = false;

  constructor(private sanitizer: DomSanitizer) {}

  onImageSelected(event: Event) {
    this.imageChangedEvent = event;

    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const nonTransparentFormats = ["jpg", "jpeg", "bmp", "gif"];
      this.showFormatWarning = ext
        ? nonTransparentFormats.includes(ext)
        : false;

      this.exportFilename = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^\w\-]/g, "_");
    }
  }

  dismissWarning() {
    this.showFormatWarning = false;
  }

  onImageCropped(event: ImageCroppedEvent) {
    if (event.blob && event.objectUrl) {
      this.croppedBlob = event.blob;
      this.croppedImageUrl = this.sanitizer.bypassSecurityTrustUrl(
        event.objectUrl
      );
    }
  }

  exportImage(size: number) {
    if (!this.croppedBlob) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${this.exportFilename || "icon"}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    };

    img.src = URL.createObjectURL(this.croppedBlob);
  }

  onImageLoaded(image: LoadedImage) {
    return;
  }

  onCropperReady() {
    return;
  }

  onLoadImageFailed() {
    console.error("❌ Failed to load image");
  }
}
