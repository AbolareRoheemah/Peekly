# File Upload Components

This project includes two file upload components built with React and TypeScript:

1. **Basic File Upload** - A simple, standalone file upload component
2. **Server-Side Filecoin Upload** - Advanced file upload using server-side @filoz/synapse-sdk integration

## Features

- 🖱️ Drag & Drop support
- 📁 Multiple file selection
- 📊 Real-time upload progress
- ✅ File validation (size, type)
- 🎨 Modern, responsive UI
- 🔧 Highly customizable
- 📱 Mobile-friendly
- 🌐 Server-side Filecoin storage integration
- 🔒 Secure private key handling

## Installation

### 1. Install Dependencies

```bash
# Using bun (recommended)
bun add @filoz/synapse-sdk next-safe-action zod lucide-react

# Or using npm
npm install @filoz/synapse-sdk next-safe-action zod lucide-react

# Or using yarn
yarn add @filoz/synapse-sdk next-safe-action zod lucide-react
```

### 2. Environment Variables

Create a `.env.local` file in your project root:

```env
# Server-side Filecoin Synapse SDK Configuration
SYNAPSE_PRIVATE_KEY=your_private_key_here
SYNAPSE_RPC_URL=your_rpc_url_here (optional, defaults to calibration testnet)
```

**Note:** The server uses Filecoin's calibration testnet by default for testing. For production, use mainnet RPC URLs with proper Pandora service configuration.

## Components

### Basic File Upload

A simple file upload component with drag & drop support.

```tsx
import FileUpload from "@/components/file-upload";

<FileUpload
  onUploadComplete={(fileId) => console.log(fileId)}
  onUploadError={(error) => console.error(error)}
  maxFileSize={50 * 1024 * 1024} // 50MB
  acceptedFileTypes={["image/*", "application/pdf"]}
/>
```

**Props:**
- `onUploadComplete?: (fileId: string) => void` - Callback when upload completes
- `onUploadError?: (error: string) => void` - Callback when upload fails
- `maxFileSize?: number` - Maximum file size in bytes (default: 100MB)
- `acceptedFileTypes?: string[]` - Array of accepted MIME types (default: ["*/*"])
- `className?: string` - Additional CSS classes

### Server-Side Filecoin Upload

Advanced file upload component that integrates with server-side @filoz/synapse-sdk for decentralized storage on Filecoin.

```tsx
import SynapseFileUpload from "@/components/synapse-file-upload";

<SynapseFileUpload
  onUploadComplete={(fileId, commp) => {
    console.log("File uploaded to Filecoin:", fileId, commp);
    // commp is the Filecoin piece commitment
  }}
  onUploadError={(error) => console.error(error)}
  maxFileSize={100 * 1024 * 1024} // 100MB
  acceptedFileTypes={["*/*"]}
/>
```

**Props:**
- `onUploadComplete?: (fileId: string, commp: string) => void` - Callback when upload completes (commp is Filecoin piece commitment)
- `onUploadError?: (error: string) => void` - Callback when upload fails
- `maxFileSize?: number` - Maximum file size in bytes (default: 100MB)
- `acceptedFileTypes?: string[]` - Array of accepted MIME types (default: ["*/*"])
- `className?: string` - Additional CSS classes

## Server Actions

### File Upload Action

The component uses a server action to handle file uploads securely:

```typescript
// src/app/actions/file-upload.ts
export const uploadFileToFilecoin = createSafeAction(
  FileUploadSchema,
  async (data: FileUploadInput): Promise<FileUploadResult> => {
    // Server-side file processing and Filecoin upload
  }
);
```

## Usage Examples

### Basic File Upload with Custom Validation

```tsx
import FileUpload from "@/components/file-upload";

function MyComponent() {
  const handleUploadComplete = (fileId: string) => {
    console.log("File uploaded successfully:", fileId);
    // Handle the uploaded file
  };

  const handleUploadError = (error: string) => {
    console.error("Upload failed:", error);
    // Show error message to user
  };

  return (
    <FileUpload
      onUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      maxFileSize={25 * 1024 * 1024} // 25MB
      acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
      className="my-8"
    />
  );
}
```

### Server-Side Filecoin Upload

```tsx
import SynapseFileUpload from "@/components/synapse-file-upload";

function MyComponent() {
  const handleUploadComplete = (fileId: string, commp: string) => {
    console.log("File uploaded to Filecoin:", fileId, commp);
    // Store file reference and commp in database
    // commp can be used to retrieve the file from Filecoin network
  };

  const handleUploadError = (error: string) => {
    console.error("Filecoin upload failed:", error);
    // Show error message to user
  };

  return (
    <SynapseFileUpload
      onUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      maxFileSize={200 * 1024 * 1024} // 200MB
      acceptedFileTypes={["*/*"]}
    />
  );
}
```

### File Type Restrictions

```tsx
// Images only
acceptedFileTypes={["image/*"]}

// Specific image formats
acceptedFileTypes={["image/jpeg", "image/png", "image/gif"]}

// Documents
acceptedFileTypes={["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]}

// All files
acceptedFileTypes={["*/*"]}
```

## Demo Page

Visit `/file-upload-demo` to see both components in action with live examples and configuration details.

## About Server-Side Filecoin Storage

The Synapse SDK integration now works server-side, providing several benefits:

- **Security:** Private keys are never exposed to the client
- **Reliability:** Better error handling and retry mechanisms
- **Control:** Centralized upload limits and validation policies
- **Scalability:** Handle multiple concurrent uploads efficiently
- **Monitoring:** Better logging and monitoring capabilities

Files are uploaded to your server first, then processed and stored on the Filecoin network using the Synapse SDK.

## Styling

The components use Tailwind CSS classes and follow your project's existing design system. You can customize the appearance by:

1. Passing custom `className` props
2. Modifying the component's internal Tailwind classes
3. Using CSS custom properties for theming

## Error Handling

Both components provide comprehensive error handling:

- File size validation
- File type validation
- Upload process errors
- Network errors
- Server-side processing errors

Errors are passed to the `onUploadError` callback and can be handled according to your application's needs.

## Performance Considerations

- Files are processed one at a time to avoid overwhelming the server
- Progress updates are throttled to maintain smooth UI
- Large files are handled efficiently with proper memory management
- Components use React's `useCallback` for optimal performance
- Server-side processing reduces client-side memory usage

## Browser Support

- Modern browsers with ES6+ support
- Drag & Drop API support
- File API support
- Fetch API support

## Troubleshooting

### Common Issues

1. **Server action not found**
   - Ensure the server action file is properly created
   - Check that `next-safe-action` is installed
   - Verify the import path in your component

2. **File uploads failing**
   - Check file size limits
   - Verify accepted file types
   - Check server console for detailed error messages
   - Ensure server environment variables are properly set

3. **Filecoin integration errors**
   - Check your private key configuration
   - Ensure environment variables are properly set
   - Verify network connectivity to Filecoin RPC endpoints
   - Ensure you have sufficient Filecoin balance for storage fees

4. **Drag & Drop not working**
   - Ensure you're using a modern browser
   - Check that the drop zone is properly configured
   - Verify event handlers are properly bound

### Debug Mode

Enable debug logging by setting the environment variable:

```env
NEXT_PUBLIC_DEBUG=true
```

This will provide detailed console logs for troubleshooting upload issues.

## Contributing

When modifying these components:

1. Maintain the existing API structure
2. Add proper TypeScript types for new props
3. Include error handling for new features
4. Test with various file types and sizes
5. Ensure mobile responsiveness
6. Keep server-side processing secure

## License

This component library is part of the Peekly project and follows the same licensing terms.
