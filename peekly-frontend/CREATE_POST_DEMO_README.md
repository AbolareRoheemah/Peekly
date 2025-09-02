# Create Post Demo Component

This demo component provides a complete UI for testing the post creation flow with the following features:

## Features

- **User Authentication Integration**: Uses Privy for authentication and displays user information
- **File Upload**: Drag & drop or click to upload files with progress tracking
- **Description Field**: Text area for post description
- **Price Setting**: Number input for setting post price in USDFC
- **Real-time Validation**: Form validation with error messages
- **Status Feedback**: Success/error messages with appropriate styling
- **Responsive Design**: Mobile-friendly interface

## Usage

### 1. Navigate to the Demo Page
Visit `/create-post-demo` to access the demo component.

### 2. Authentication
- The component requires user authentication via Privy
- User ID and wallet address are automatically retrieved and displayed
- Unauthenticated users will see an authentication prompt

### 3. File Upload
- Drag and drop files or click "Choose File"
- Supports multiple file types (100MB max per file)
- Real-time progress tracking
- File validation with error handling

### 4. Post Details
- **Description**: Required text description for the post
- **Price**: Required numeric price in USDFC (minimum 0.01)

### 5. Submit
- Click "Create Post" to submit the form
- Files are converted to base64 and sent to the server
- Uses the existing `uploadFileToFilecoin` server action
- Success/error feedback is displayed

## Technical Details

### Dependencies
- `@privy-io/react-auth`: User authentication
- `lucide-react`: Icons
- `next`: React framework
- `tailwindcss`: Styling

### API Integration
- Uses `/api/upload-file` endpoint
- Integrates with existing `uploadFileToFilecoin` server action
- Handles file conversion to base64 format
- Includes user ID and wallet address in requests

### State Management
- File upload progress tracking
- Form validation state
- Submission status
- Error handling

## File Structure

```
src/
├── components/
│   └── create-post-demo.tsx      # Main demo component
├── app/
│   ├── api/
│   │   └── upload-file/
│   │       └── route.ts         # API route handler
│   ├── actions/
│   │   └── file-upload.ts       # Existing server action
│   └── create-post-demo/
│       └── page.tsx             # Demo page
```

## Testing

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/create-post-demo`
3. Sign in with Privy if not authenticated
4. Upload a file, add description and price
5. Submit the form to test the complete flow

## Notes

- The component is designed for demo/testing purposes
- File upload simulation includes progress tracking
- Real file upload uses the existing Filecoin integration
- Error handling covers various scenarios
- Responsive design works on mobile and desktop
