# Frontend Components

This directory contains the React components for the Driver's License Parser application.

## Components

### `LicenseUpload.tsx`
Main upload interface component that handles:
- **Drag & Drop**: File upload with visual feedback
- **File Validation**: Image type and size validation
- **Progress Tracking**: Upload progress with loading states
- **Error Handling**: User-friendly error messages
- **API Integration**: Communicates with `/api/parse-license` endpoint

**Features:**
- Drag and drop file upload
- File type validation (images only)
- File size validation (max 10MB)
- Progress indicators during upload
- Error state handling
- Success state with result display

### `LicenseResult.tsx`
Advanced result display component with:
- **Tabbed Interface**: Overview, Details, and Raw Data tabs
- **Formatted Display**: Clean presentation of parsed data
- **Confidence Indicators**: Visual confidence scoring
- **Raw Data Access**: View original barcode and JSON data

**Tabs:**
- **Overview**: Key personal and license information
- **Details**: Physical characteristics, restrictions, technical details
- **Raw**: Original barcode data and parsed JSON

### `LoadingSpinner.tsx`
Reusable loading component with:
- **Multiple Sizes**: Small, medium, large variants
- **Custom Text**: Optional loading text
- **Smooth Animation**: CSS-based spinning animation

## Usage

### Basic Upload Interface
```tsx
import LicenseUpload from '@/components/LicenseUpload';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LicenseUpload />
    </div>
  );
}
```

### Custom Result Display
```tsx
import LicenseResult from '@/components/LicenseResult';

<LicenseResult 
  result={parsedLicenseData} 
  onUploadAnother={() => resetUpload()} 
/>
```

### Loading States
```tsx
import LoadingSpinner from '@/components/LoadingSpinner';

<LoadingSpinner size="lg" text="Processing license..." />
```

## API Integration

The components integrate with the `/api/parse-license` endpoint:

```typescript
// POST /api/parse-license
// Content-Type: multipart/form-data
// Body: { file: File }

// Response:
{
  id: number;
  data: {
    jurisdiction: string;
    idNumber: string;
    firstName: string;
    lastName: string;
    // ... other fields
    confidence: number;
  };
}
```

## Styling

Components use Tailwind CSS classes for styling:
- **Responsive Design**: Mobile-first approach
- **Color Scheme**: Green for success, red for errors, blue for info
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Consistent padding and margins
- **Animations**: Smooth transitions and loading states

## Error Handling

The upload component handles various error scenarios:
- **Invalid File Type**: Non-image files
- **File Too Large**: Files exceeding 10MB
- **Network Errors**: API connection issues
- **Parsing Errors**: PDF417 barcode not found
- **Server Errors**: Backend processing failures

## Accessibility

Components include accessibility features:
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG compliant color ratios

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **File API**: Drag and drop support
- **Fetch API**: Modern HTTP requests
- **ES6+ Features**: Arrow functions, destructuring, etc.

## Dependencies

- **react-dropzone**: Drag and drop functionality
- **React Hooks**: useState, useCallback, useRef
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type safety and IntelliSense
