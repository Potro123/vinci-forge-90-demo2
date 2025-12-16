# Bug Fix: Image Reference Mode for Generation

## Problem
When users uploaded an image with a prompt like "Create a new image with a perfect replica of da Vinci Mona Lisa. Take this image of reference", the generation failed with error: **"Edge Function returned a non-2xx status code"**.

### Root Cause
The system was treating ALL uploaded images as "edit mode" - attempting to modify the uploaded image rather than using it as a reference/inspiration for creating a new image. The `edit-image` edge function was being called, which uses a different AI model that may have limitations or availability issues.

## Solution
Added a new **Image Mode** feature that allows users to choose between:

1. **Reference Mode** (default): Use the uploaded image as inspiration to create a new image
2. **Edit Mode**: Modify the uploaded image based on the prompt

### Changes Made

#### 1. Backend Changes

**`supabase/functions/generate-image/index.ts`**
- Added `referenceImageUrl` parameter to the schema
- Updated the API call to include reference image in the message content when provided
- Now supports multimodal input (text + image) for reference-based generation

**`src/services/lovableAIService.ts`**
- Modified the condition to only call `edit-image` when `imageMode === 'edit'`
- When `imageMode === 'reference'` (or undefined), it calls `generate-image` with the reference image
- Passes `referenceImageUrl` to the generate-image function

#### 2. Frontend Changes

**`src/types/job.ts`**
- Added `imageMode?: 'edit' | 'reference'` to `GenerationOptions` interface

**`src/components/Hero.tsx`**
- Added `imageMode` state (defaults to 'reference')
- Added a dropdown selector to switch between "Use as Reference" and "Edit Image" modes
- Updated placeholder text to reflect the selected mode
- Updated the info message to show current mode
- Passes `imageMode` in the job options

### User Experience Improvements

1. **Clear Mode Selection**: Users can now explicitly choose how they want to use their uploaded images
2. **Better Defaults**: Reference mode is the default, which is more intuitive for most use cases
3. **Contextual Placeholders**: The prompt placeholder changes based on the selected mode
4. **Visual Feedback**: Clear messages indicate which mode is active

### How It Works Now

**Reference Mode (Default)**:
```
User uploads Mona Lisa image
Prompt: "Create a new image with a perfect replica of da Vinci Mona Lisa"
→ Calls generate-image with referenceImageUrl
→ AI creates a NEW image inspired by the reference
```

**Edit Mode**:
```
User uploads an image
Prompt: "Make the background blue and add sunglasses"
→ Calls edit-image function
→ AI modifies the EXISTING image
```

### Testing
- Build completed successfully with no errors
- All TypeScript types are properly defined
- The UI now shows a dropdown when images are uploaded for image generation

## Next Steps for User
1. Upload your reference image (e.g., Mona Lisa)
2. Ensure "Use as Reference" is selected in the dropdown (it's the default)
3. Enter your prompt describing what you want to create
4. Click Generate

The AI will now use your uploaded image as a reference/inspiration to create a new image, rather than trying to edit it.
