# Quick Test Guide - Upscale/Enhance Fix

## 🚀 Quick Start

This guide will help you quickly verify the Upscale/Enhance fix is working correctly.

## ⏱️ 5-Minute Test

### Prerequisites
- Browser with console open (F12)
- Test image (e.g., Mona Lisa or any photo)
- Active user account

### Steps

1. **Navigate to the app**
   - Open the application in your browser
   - Make sure you're logged in

2. **Upload test image**
   - Click "Add Images" button
   - Select your test image (Mona Lisa recommended)
   - Wait for upload to complete

3. **Verify default mode**
   - Check that mode dropdown shows: "🔍 Upscale/Enhance (Perfect Copy)"
   - This should be selected by default

4. **Enter prompt** (optional)
   - Type: "Create a perfect copy of this uploaded image"
   - Or leave empty to use default prompt

5. **Check advanced options** (optional)
   - Click "Advanced Options"
   - Set Width: 1920
   - Set Height: 1080
   - Set Upscale Quality: 4x - Balanced

6. **Generate**
   - Click the "Generate" button
   - Watch the console for logs

7. **Monitor progress**
   - Status should show: "Creating high-resolution copy..."
   - Progress bar should animate
   - Wait 30-60 seconds

8. **Verify result**
   - Job should complete successfully
   - Output should be a faithful replica of your input
   - Resolution should match your settings (1920x1080)
   - Image should be enhanced (sharper, clearer)

### Expected Console Logs

```
✅ LovableAI: Using upscale/enhance mode for {jobId}
✅ Generating image with Lovable AI: {..., hasReference: true}
✅ Successfully generated 1 image(s) with google/gemini-2.0-flash-exp
✅ Upscaling 1 image(s) to higher resolution with 4x quality
✅ Image upscaled successfully for {jobId}
```

### ✅ Pass Criteria

- [ ] Job submits without errors
- [ ] Console shows correct logs
- [ ] Job completes within 60 seconds
- [ ] Output is a faithful replica (NOT random content)
- [ ] Output resolution matches settings
- [ ] Image quality is enhanced
- [ ] Download button works

### ❌ Fail Criteria

If you see any of these, the fix is NOT working:

- ❌ Error: "No upscaled images generated"
- ❌ Error: "Generation Failed"
- ❌ Output is random content (spider web, etc.)
- ❌ Output is not a replica of input
- ❌ Job never completes
- ❌ Console shows errors

## 🔍 Detailed Test (15 Minutes)

### Test 1: Basic Upscale
1. Upload image
2. Mode: Upscale
3. Prompt: "Perfect copy"
4. Generate
5. **Expected**: Faithful replica

### Test 2: Empty Prompt
1. Upload image
2. Mode: Upscale
3. Prompt: Leave empty
4. Generate
5. **Expected**: Uses default prompt, generates replica

### Test 3: High Resolution
1. Upload image
2. Mode: Upscale
3. Advanced: 1920x1080, 4x upscale
4. Generate
5. **Expected**: High-res replica with ESRGAN upscaling

### Test 4: Multiple Images
1. Upload image
2. Mode: Upscale
3. Advanced: Number of Images = 4
4. Generate
5. **Expected**: 4 replicas generated

### Test 5: Other Modes Still Work
1. Upload image
2. Mode: Reference
3. Prompt: "Futuristic version"
4. Generate
5. **Expected**: Creative variation (not exact copy)

## 🐛 Troubleshooting

### Issue: "No upscaled images generated"

**Cause**: The fix was not applied correctly

**Check**:
1. Open `src/services/lovableAIService.ts`
2. Search for "upscale/enhance mode"
3. Verify the code uses:
   - `numImages` (not `numOutputs`)
   - `upscaleQuality` (not `guidanceScale`)
   - `jobId` is passed
   - `data.images` (not `data.imageUrls`)

**Fix**: Re-apply the changes from `UPSCALE_REGRESSION_FIX.md`

### Issue: Random content generated

**Cause**: Reference image not being passed correctly

**Check**:
1. Open browser Network tab
2. Look for POST to `/functions/v1/generate-image`
3. Check request body includes `referenceImageUrl`

**Fix**: Verify `referenceImageUrl: job.options.imageUrl` is in the request

### Issue: Job never completes

**Cause**: Job tracking not working

**Check**:
1. Open browser console
2. Look for job ID in logs
3. Check database for job record

**Fix**: Verify `jobId` is passed to edge function

### Issue: Low quality output

**Cause**: ESRGAN upscaling not applied

**Check**:
1. Console should show "Upscaling X image(s)"
2. Network tab should show POST to `/functions/v1/upscale-image`

**Fix**: Verify resolution is > 1024x1024 to trigger upscaling

## 📊 Test Results Template

Copy this template to document your test results:

```
# Test Results - Upscale/Enhance Fix

**Date**: ___________
**Tester**: ___________
**Environment**: ___________

## 5-Minute Test
- [ ] Job submitted successfully
- [ ] Console logs correct
- [ ] Job completed
- [ ] Output is replica
- [ ] Resolution correct
- [ ] Quality enhanced
- [ ] Download works

**Result**: ✅ Pass / ❌ Fail

**Notes**:
_______________________________________________________

## Detailed Tests
- [ ] Test 1: Basic Upscale - ✅ Pass / ❌ Fail
- [ ] Test 2: Empty Prompt - ✅ Pass / ❌ Fail
- [ ] Test 3: High Resolution - ✅ Pass / ❌ Fail
- [ ] Test 4: Multiple Images - ✅ Pass / ❌ Fail
- [ ] Test 5: Other Modes - ✅ Pass / ❌ Fail

**Overall Result**: ✅ Pass / ❌ Fail

**Issues Found**:
_______________________________________________________
_______________________________________________________

**Recommendations**:
_______________________________________________________
_______________________________________________________
```

## 🎯 Critical Test (MUST PASS)

This is the most important test - it verifies the original bug is fixed:

### The Mona Lisa Test

1. **Download** a Mona Lisa image (or use any famous artwork)
2. **Upload** to the app
3. **Mode**: "🔍 Upscale/Enhance (Perfect Copy)"
4. **Prompt**: "Create a perfect copy of this uploaded image"
5. **Advanced Options**:
   - Width: 1920
   - Height: 1080
   - Upscale Quality: 4x
6. **Generate**
7. **Wait** 60 seconds
8. **Verify**:
   - ✅ Output is Mona Lisa (NOT a spider web!)
   - ✅ Output is 1920x1080
   - ✅ Output is enhanced quality
   - ✅ Output is a faithful replica

**If this test fails, the bug is NOT fixed!**

## 📞 Need Help?

If you encounter issues:

1. **Check Documentation**
   - `UPSCALE_REGRESSION_FIX.md` - Technical details
   - `TESTING_PLAN_UPSCALE_FIX.md` - Full test plan
   - `REGRESSION_BUG_SUMMARY.md` - Executive summary

2. **Check Console Logs**
   - Look for error messages
   - Check for missing parameters
   - Verify API calls

3. **Check Network Tab**
   - Verify request parameters
   - Check response format
   - Look for failed requests

4. **Check Database**
   - Verify job record exists
   - Check job status
   - Verify outputs are stored

## ✨ Success!

If all tests pass, the fix is working correctly! 🎉

**Next Steps**:
1. Complete full testing plan (20 test cases)
2. Get approval for deployment
3. Deploy to production
4. Monitor for 24 hours
5. Collect user feedback
6. Close issue

---

**Last Updated**: 2025-12-16  
**Version**: 1.0  
**Estimated Time**: 5-15 minutes
