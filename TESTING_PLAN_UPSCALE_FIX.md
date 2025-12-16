# Testing Plan: Upscale/Enhance Mode Fix

## Overview

This document outlines the comprehensive testing plan to verify that the Upscale/Enhance (Perfect Copy) regression bug has been fixed and the feature works as originally designed.

## Test Environment

- **Frontend**: React application with Hero component
- **Backend**: Supabase Edge Functions (generate-image, upscale-image)
- **AI Models**: Lovable AI (Gemini 2.0/2.5 Flash) + Replicate (ESRGAN, Flux)
- **Storage**: Supabase Storage (generated-models bucket)

## Pre-Test Checklist

- [ ] Code changes deployed to edge functions
- [ ] Frontend changes deployed
- [ ] Test user account with active subscription
- [ ] Test images prepared (various sizes and formats)
- [ ] Browser console open for debugging
- [ ] Network tab open to monitor API calls

## Test Cases

### Test Case 1: Basic Upscale with Prompt ✅

**Objective**: Verify basic upscale functionality with user-provided prompt

**Steps**:
1. Navigate to the main generation page
2. Upload a test image (e.g., Mona Lisa, 512x512)
3. Verify mode is set to "🔍 Upscale/Enhance (Perfect Copy)"
4. Enter prompt: "Create a perfect copy of this uploaded image"
5. Leave advanced options at defaults (1024x1024, 4x upscale)
6. Click "Generate"

**Expected Results**:
- ✅ Job submits successfully (no errors in console)
- ✅ Job status shows "Creating high-resolution copy..."
- ✅ Progress updates appear in real-time
- ✅ Job completes within 30-60 seconds
- ✅ Output image is a faithful replica of the input
- ✅ Output resolution is 1024x1024 or higher
- ✅ Image quality is enhanced (sharper, clearer)
- ✅ Download button works
- ✅ Image is stored in Supabase Storage

**Pass Criteria**: All expected results met

---

### Test Case 2: Upscale with Empty Prompt ✅

**Objective**: Verify default prompt is used when user provides no prompt

**Steps**:
1. Upload a test image
2. Mode: "🔍 Upscale/Enhance (Perfect Copy)"
3. Leave prompt field empty
4. Click "Generate"

**Expected Results**:
- ✅ System uses default prompt: "Create a perfect high-resolution copy of this image, preserving every detail, color, texture, and composition exactly as shown."
- ✅ Job completes successfully
- ✅ Output is a faithful replica
- ✅ No errors about missing prompt

**Pass Criteria**: All expected results met

---

### Test Case 3: High-Resolution Upscale (1920x1080) ✅

**Objective**: Verify ESRGAN upscaling is applied for high-resolution outputs

**Steps**:
1. Upload a test image
2. Mode: "🔍 Upscale/Enhance (Perfect Copy)"
3. Prompt: "Perfect copy"
4. Advanced Options:
   - Width: 1920
   - Height: 1080
   - Upscale Quality: 4x
5. Click "Generate"

**Expected Results**:
- ✅ Job submits successfully
- ✅ Console logs show "Upscaling X image(s) to higher resolution with 4x quality"
- ✅ Output image is exactly 1920x1080
- ✅ Image quality is significantly enhanced
- ✅ ESRGAN upscaling was applied (check network tab for upscale-image call)
- ✅ Job completes within 60-90 seconds

**Pass Criteria**: All expected results met

---

### Test Case 4: Ultra High-Resolution with 8x Upscale ✅

**Objective**: Verify maximum quality upscaling works

**Steps**:
1. Upload a test image
2. Mode: "🔍 Upscale/Enhance (Perfect Copy)"
3. Advanced Options:
   - Width: 2048
   - Height: 2048
   - Upscale Quality: 8x
4. Click "Generate"

**Expected Results**:
- ✅ Job submits successfully
- ✅ Console logs show "Upscaling with 8x quality"
- ✅ Output image is 2048x2048
- ✅ Image quality is exceptional (ultra-sharp)
- ✅ Job completes within 90-120 seconds
- ✅ File size is larger due to higher quality

**Pass Criteria**: All expected results met

---

### Test Case 5: Multiple Image Generation ✅

**Objective**: Verify multiple copies can be generated in one job

**Steps**:
1. Upload a test image
2. Mode: "🔍 Upscale/Enhance (Perfect Copy)"
3. Advanced Options:
   - Number of Images: 4
   - Width: 1920
   - Height: 1080
4. Click "Generate"

**Expected Results**:
- ✅ Job submits successfully
- ✅ Console logs show "Generating 4 image(s)"
- ✅ Job completes with 4 output images
- ✅ All 4 images are faithful replicas
- ✅ All 4 images are 1920x1080
- ✅ All 4 images have ESRGAN upscaling applied
- ✅ Job completes within 2-3 minutes

**Pass Criteria**: All expected results met

---

### Test Case 6: Different Image Formats ✅

**Objective**: Verify upscale works with various image formats

**Steps**:
1. Test with PNG image
2. Test with JPEG image
3. Test with WebP image
4. For each format:
   - Upload image
   - Mode: "🔍 Upscale/Enhance (Perfect Copy)"
   - Click "Generate"

**Expected Results**:
- ✅ All formats upload successfully
- ✅ All formats generate successfully
- ✅ Output format matches input format (or converts to optimal format)
- ✅ No format-related errors

**Pass Criteria**: All expected results met for all formats

---

### Test Case 7: Reference Mode (Not Upscale) ✅

**Objective**: Verify reference mode still works correctly

**Steps**:
1. Upload a test image
2. Change mode to "🎨 Use as Reference (Inspired)"
3. Prompt: "A futuristic version of this artwork"
4. Click "Generate"

**Expected Results**:
- ✅ Job submits successfully
- ✅ Output is INSPIRED by input (not exact copy)
- ✅ Output shows creative interpretation
- ✅ Different from upscale mode behavior

**Pass Criteria**: All expected results met

---

### Test Case 8: Edit Mode (Not Upscale) ✅

**Objective**: Verify edit mode still works correctly

**Steps**:
1. Upload a test image
2. Change mode to "✨ Edit Image (Modify)"
3. Prompt: "Make the background blue"
4. Click "Generate"

**Expected Results**:
- ✅ Job submits successfully
- ✅ Output shows the requested modification
- ✅ Background is blue (or shows attempt to modify)
- ✅ Different from upscale mode behavior

**Pass Criteria**: All expected results met

---

### Test Case 9: Error Handling - No Image ✅

**Objective**: Verify proper error handling when no image is uploaded

**Steps**:
1. Do NOT upload an image
2. Enter prompt: "Create a perfect copy"
3. Click "Generate"

**Expected Results**:
- ✅ Error message appears: "Please enter a prompt or upload images"
- ✅ Job does not submit
- ✅ No backend calls made

**Pass Criteria**: All expected results met

---

### Test Case 10: Error Handling - Invalid Image ✅

**Objective**: Verify proper error handling for invalid images

**Steps**:
1. Try to upload a non-image file (e.g., .txt, .pdf)
2. Observe behavior

**Expected Results**:
- ✅ Error message appears: "Invalid file type"
- ✅ File is not uploaded
- ✅ User can try again with valid image

**Pass Criteria**: All expected results met

---

### Test Case 11: Job Status Updates ✅

**Objective**: Verify real-time job status updates work correctly

**Steps**:
1. Upload a test image
2. Mode: "🔍 Upscale/Enhance (Perfect Copy)"
3. Click "Generate"
4. Watch job status in UI

**Expected Results**:
- ✅ Status changes: "Queued" → "Running" → "Completed"
- ✅ Progress messages update:
  - "Preparing generation..."
  - "Creating high-resolution copy..."
  - "Generation complete!"
- ✅ Progress bar animates
- ✅ Status updates appear within 1-2 seconds

**Pass Criteria**: All expected results met

---

### Test Case 12: Database Persistence ✅

**Objective**: Verify jobs are properly stored in database

**Steps**:
1. Complete a successful upscale job
2. Check Supabase database (jobs table)
3. Verify job record

**Expected Results**:
- ✅ Job record exists in database
- ✅ Job status is "completed"
- ✅ Outputs array contains image URLs
- ✅ Image URLs are permanent (Supabase Storage URLs)
- ✅ Job metadata is correct (user_id, type, options)

**Pass Criteria**: All expected results met

---

### Test Case 13: Storage Verification ✅

**Objective**: Verify images are stored in Supabase Storage

**Steps**:
1. Complete a successful upscale job
2. Check Supabase Storage (generated-models bucket)
3. Verify image files

**Expected Results**:
- ✅ Image files exist in storage
- ✅ File path: `{userId}/{jobId}/image_0.{format}`
- ✅ Files are accessible via public URL
- ✅ Images can be downloaded directly
- ✅ File size is appropriate for resolution

**Pass Criteria**: All expected results met

---

### Test Case 14: Console Logging ✅

**Objective**: Verify proper logging for debugging

**Steps**:
1. Open browser console
2. Complete an upscale job
3. Review console logs

**Expected Results**:
- ✅ Log: "LovableAI: Using upscale/enhance mode for {jobId}"
- ✅ Log: "Generating image with Lovable AI: {..., hasReference: true}"
- ✅ Log: "Successfully generated X image(s) with {model}"
- ✅ Log: "Upscaling X image(s) to higher resolution with Xx quality"
- ✅ Log: "Image upscaled successfully for {jobId}"
- ✅ No error logs (unless expected)

**Pass Criteria**: All expected results met

---

### Test Case 15: Network Monitoring ✅

**Objective**: Verify correct API calls are made

**Steps**:
1. Open browser Network tab
2. Complete an upscale job
3. Review network requests

**Expected Results**:
- ✅ POST to `/functions/v1/generate-image` with correct body:
  ```json
  {
    "prompt": "...",
    "referenceImageUrl": "...",
    "width": 1920,
    "height": 1080,
    "numImages": 1,
    "upscaleQuality": 4,
    "jobId": "..."
  }
  ```
- ✅ Response status: 200 OK
- ✅ Response body contains `images` array
- ✅ If resolution > 1024: POST to `/functions/v1/upscale-image`
- ✅ No failed requests (except expected fallbacks)

**Pass Criteria**: All expected results met

---

### Test Case 16: Performance Testing ✅

**Objective**: Verify acceptable performance

**Steps**:
1. Upload various image sizes (small, medium, large)
2. Generate with different resolutions
3. Measure completion times

**Expected Results**:
- ✅ Small image (512x512) → 1024x1024: 30-45 seconds
- ✅ Medium image (1024x1024) → 1920x1080: 45-60 seconds
- ✅ Large image (2048x2048) → 2048x2048: 60-90 seconds
- ✅ No timeouts
- ✅ No memory issues

**Pass Criteria**: All expected results met

---

### Test Case 17: Concurrent Jobs ✅

**Objective**: Verify multiple jobs can run simultaneously

**Steps**:
1. Submit 3 upscale jobs in quick succession
2. Monitor all jobs

**Expected Results**:
- ✅ All jobs submit successfully
- ✅ All jobs process independently
- ✅ All jobs complete successfully
- ✅ No job interference
- ✅ Correct outputs for each job

**Pass Criteria**: All expected results met

---

### Test Case 18: Fallback Model Testing ✅

**Objective**: Verify fallback to Replicate works if Lovable AI fails

**Steps**:
1. (Simulate Lovable AI failure if possible, or test naturally)
2. Upload image and generate
3. Monitor which model is used

**Expected Results**:
- ✅ If Lovable AI fails: System falls back to Replicate
- ✅ Console log: "All Lovable AI models failed, falling back to Replicate"
- ✅ Job still completes successfully
- ✅ Output quality is acceptable

**Pass Criteria**: All expected results met

---

### Test Case 19: User Experience Flow ✅

**Objective**: Verify complete user experience is smooth

**Steps**:
1. As a new user, navigate to the app
2. Upload an image
3. Observe default mode selection
4. Read placeholder text
5. Generate with default settings
6. Download result

**Expected Results**:
- ✅ Mode defaults to "🔍 Upscale/Enhance (Perfect Copy)"
- ✅ Placeholder text is helpful: "Optional: Add specific details to enhance (or leave empty for perfect copy)..."
- ✅ Info message explains mode: "🔍 Upscale mode: AI will create a perfect high-resolution copy of your image"
- ✅ Process is intuitive and self-explanatory
- ✅ Result meets user expectations

**Pass Criteria**: All expected results met

---

### Test Case 20: Regression Prevention ✅

**Objective**: Verify the original bug does not reoccur

**Steps**:
1. Upload Mona Lisa image
2. Mode: "🔍 Upscale/Enhance (Perfect Copy)"
3. Prompt: "Create a perfect copy of this uploaded image"
4. Advanced Options: 1920x1080, 4x upscale
5. Click "Generate"

**Expected Results**:
- ✅ Job does NOT fail with "No upscaled images generated"
- ✅ Job does NOT generate random content (spider webs, etc.)
- ✅ Output IS a faithful replica of Mona Lisa
- ✅ Output IS at 1920x1080 resolution
- ✅ Output IS enhanced with 4x upscaling
- ✅ All original functionality is restored

**Pass Criteria**: All expected results met - **THIS IS THE CRITICAL TEST**

---

## Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Basic Upscale with Prompt | ⏳ Pending | |
| 2. Upscale with Empty Prompt | ⏳ Pending | |
| 3. High-Resolution Upscale | ⏳ Pending | |
| 4. Ultra High-Resolution 8x | ⏳ Pending | |
| 5. Multiple Image Generation | ⏳ Pending | |
| 6. Different Image Formats | ⏳ Pending | |
| 7. Reference Mode | ⏳ Pending | |
| 8. Edit Mode | ⏳ Pending | |
| 9. Error Handling - No Image | ⏳ Pending | |
| 10. Error Handling - Invalid | ⏳ Pending | |
| 11. Job Status Updates | ⏳ Pending | |
| 12. Database Persistence | ⏳ Pending | |
| 13. Storage Verification | ⏳ Pending | |
| 14. Console Logging | ⏳ Pending | |
| 15. Network Monitoring | ⏳ Pending | |
| 16. Performance Testing | ⏳ Pending | |
| 17. Concurrent Jobs | ⏳ Pending | |
| 18. Fallback Model Testing | ⏳ Pending | |
| 19. User Experience Flow | ⏳ Pending | |
| 20. Regression Prevention | ⏳ Pending | **CRITICAL** |

## Sign-Off

**Tester**: ___________________  
**Date**: ___________________  
**Overall Result**: ⏳ Pending / ✅ Pass / ❌ Fail  

**Notes**:
_______________________________________________________
_______________________________________________________
_______________________________________________________

## Deployment Checklist

After all tests pass:

- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] UPSCALE_REGRESSION_FIX.md reviewed
- [ ] Edge functions deployed to production
- [ ] Frontend deployed to production
- [ ] Smoke test in production environment
- [ ] Monitor error logs for 24 hours
- [ ] User feedback collected
- [ ] Mark issue as resolved

## Rollback Plan

If critical issues are found:

1. Revert `src/services/lovableAIService.ts` changes
2. Redeploy edge functions
3. Notify users of temporary service interruption
4. Investigate root cause
5. Implement fix with additional testing
6. Redeploy with confidence

## Success Criteria

The fix is considered successful when:

- ✅ All 20 test cases pass
- ✅ Test Case 20 (Regression Prevention) passes - **CRITICAL**
- ✅ No new bugs introduced
- ✅ Performance is acceptable
- ✅ User experience is smooth
- ✅ Error handling is robust
- ✅ Documentation is complete

## Next Steps

1. Execute all test cases
2. Document results in summary table
3. Fix any issues found
4. Re-test failed cases
5. Complete sign-off
6. Deploy to production
7. Monitor production for 24-48 hours
8. Collect user feedback
9. Close issue

---

**Last Updated**: 2025-12-16  
**Version**: 1.0  
**Status**: Ready for Testing
