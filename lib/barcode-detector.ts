/**
 * Client-side barcode detection utilities
 * Uses browser APIs for PDF417 barcode detection
 */

export interface BarcodeDetectionResult {
  success: boolean;
  data: string[];
  error?: string;
}

export class ClientBarcodeDetector {
  private detector: BarcodeDetector | null = null;

  constructor() {
    // Check if BarcodeDetector is supported
    if (!('BarcodeDetector' in window)) {
      console.warn('BarcodeDetector not supported in this browser');
    }
  }

  async initialize(): Promise<boolean> {
    try {
      if (!('BarcodeDetector' in window)) {
        return false;
      }

      this.detector = new BarcodeDetector({ 
        formats: ['pdf417'] 
      });
      return true;
    } catch (error) {
      console.error('Failed to initialize BarcodeDetector:', error);
      return false;
    }
  }

  async detectFromFile(file: File): Promise<BarcodeDetectionResult> {
    if (!this.detector) {
      return {
        success: false,
        data: [],
        error: 'BarcodeDetector not initialized'
      };
    }

    try {
      // Create image element from file
      const image = await this.createImageFromFile(file);
      
      // Detect barcodes
      const barcodes = await this.detector.detect(image);
      
      if (barcodes.length === 0) {
        return {
          success: false,
          data: [],
          error: 'No PDF417 barcode found in image'
        };
      }

      // Extract raw values from detected barcodes
      const results = barcodes
        .map(barcode => barcode.rawValue)
        .filter(value => value && value.length > 0);

      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error('Barcode detection failed:', error);
      return {
        success: false,
        data: [],
        error: `Detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async detectFromImageData(imageData: ImageData): Promise<BarcodeDetectionResult> {
    if (!this.detector) {
      return {
        success: false,
        data: [],
        error: 'BarcodeDetector not initialized'
      };
    }

    try {
      // Detect barcodes from ImageData
      const barcodes = await this.detector.detect(imageData);
      
      if (barcodes.length === 0) {
        return {
          success: false,
          data: [],
          error: 'No PDF417 barcode found in image'
        };
      }

      // Extract raw values from detected barcodes
      const results = barcodes
        .map(barcode => barcode.rawValue)
        .filter(value => value && value.length > 0);

      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error('Barcode detection failed:', error);
      return {
        success: false,
        data: [],
        error: `Detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async createImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image'));
      
      // Create object URL from file
      const url = URL.createObjectURL(file);
      image.src = url;
      
      // Clean up object URL after image loads
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
    });
  }

  isSupported(): boolean {
    return 'BarcodeDetector' in window;
  }

  getSupportedFormats(): string[] {
    if (!this.detector) return [];
    
    try {
      return BarcodeDetector.getSupportedFormats();
    } catch {
      return ['pdf417']; // Default assumption
    }
  }
}

// Utility function for easy usage
export async function detectBarcodeFromFile(file: File): Promise<BarcodeDetectionResult> {
  const detector = new ClientBarcodeDetector();
  
  const initialized = await detector.initialize();
  if (!initialized) {
    return {
      success: false,
      data: [],
      error: 'BarcodeDetector not supported in this browser'
    };
  }

  return await detector.detectFromFile(file);
}

// Check browser support
export function isBarcodeDetectionSupported(): boolean {
  return 'BarcodeDetector' in window;
}
