# Quick Test Guide - File Upload Limit Increase

## 🚀 5-Minute Quick Test

### Prerequisites
- Browser with developer tools open (F12)
- Test file between 10MB and 100MB (e.g., high-res image or video)
- Active user account

### Steps

1. **Prepare Test File**
   - Find or create a file between 10MB and 100MB
   - Note the exact file size

2. **Navigate to App**
   - Open the application
   - Make sure you're logged in

3. **Upload File**
   - Click "Add Images" button
   - Select your test file
   - Watch for upload progress

4. **Verify Success**
   - File should upload without "File too large" error
   - File should appear in uploaded images list
   - No console errors

### Expected Results

✅ **PASS Criteria**:
- File uploads successfully
- No "exceeds 10MB limit" error
- File appears in the list
- No console errors

❌ **FAIL Criteria**:
- "File too large" error appears
- Upload fails or hangs
- Console shows errors
- File doesn't appear in list

## 🧪 Comprehensive Test (15 Minutes)

### Test 1: Small File (< 10MB)
- **File**: 5MB image
- **Expected**: Uploads successfully (should work as before)

### Test 2: Medium File (10MB - 100MB)
- **File**: 50MB image or video
- **Expected**: Uploads successfully (NEW - previously would fail)

### Test 3: Large File (100MB - 500MB)
- **File**: 200MB video or RAW image
- **Expected**: Uploads successfully (NEW - previously would fail)

### Test 4: Very Large File (500MB - 1GB)
- **File**: 800MB video
- **Expected**: Uploads successfully (may take 2-5 minutes)

### Test 5: File Exceeding Limit (> 1GB)
- **File**: 1.5GB video
- **Expected**: Shows error "exceeds 1GB limit"

### Test 6: Folder Upload
- **Folder**: Multiple files totaling 200MB
- **Expected**: All files upload successfully

## 🔍 What Changed

### Before (10MB Limit)
```
User uploads 50MB file
❌ Error: "File exceeds 10MB limit"
❌ Upload rejected
```

### After (1GB Limit)
```
User uploads 50MB file
✅ Upload starts
✅ Progress shown
✅ Upload completes
✅ File appears in list
```

## 📊 File Size Reference

| Size | Example Files |
|------|---------------|
| 10MB | High-quality JPEG |
| 50MB | RAW photo, short video |
| 100MB | 4K photo, 1-min HD video |
| 500MB | Long HD video, multiple RAW photos |
| 1GB | 4K video, large batch of photos |

## 🐛 Troubleshooting

### Issue: Still getting "10MB limit" error

**Cause**: Frontend changes not deployed

**Fix**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check if changes are in `src/components/Hero.tsx`

### Issue: Upload hangs or times out

**Cause**: Network timeout or slow connection

**Fix**:
1. Check internet connection speed
2. Try smaller file first
3. Check browser console for errors
4. Check Supabase storage status

### Issue: "Storage quota exceeded"

**Cause**: User or project storage limit reached

**Fix**:
1. Check Supabase dashboard for storage usage
2. Delete old files if needed
3. Increase storage quota if available

## 📝 Quick Test Results

Copy and fill out:

```
Date: __________
Tester: __________

Test 1 (5MB file): ✅ Pass / ❌ Fail
Test 2 (50MB file): ✅ Pass / ❌ Fail
Test 3 (200MB file): ✅ Pass / ❌ Fail
Test 4 (800MB file): ✅ Pass / ❌ Fail
Test 5 (>1GB file): ✅ Pass / ❌ Fail
Test 6 (Folder): ✅ Pass / ❌ Fail

Overall: ✅ Pass / ❌ Fail

Notes:
_________________________________
_________________________________
```

## ⚡ Performance Expectations

| File Size | Expected Upload Time |
|-----------|---------------------|
| 10MB | 5-10 seconds |
| 50MB | 15-30 seconds |
| 100MB | 30-60 seconds |
| 500MB | 2-4 minutes |
| 1GB | 4-8 minutes |

*Times vary based on internet connection speed*

## ✅ Success Checklist

Before marking as complete:

- [ ] Can upload files between 10MB-100MB
- [ ] Can upload files between 100MB-500MB
- [ ] Can upload files between 500MB-1GB
- [ ] Files >1GB are rejected with clear error
- [ ] Upload progress is shown
- [ ] Files appear in the list after upload
- [ ] No console errors
- [ ] Performance is acceptable

## 🎯 Critical Test

**The 50MB Test** (Must Pass):

1. Get a 50MB file (previously would fail)
2. Upload it using "Add Images"
3. **Expected**: Uploads successfully without error
4. **Verify**: File appears in uploaded images list

**If this test fails, the fix is NOT working!**

## 📞 Need Help?

- **Full Documentation**: See `FILE_UPLOAD_LIMIT_INCREASE.md`
- **Code Changes**: See `src/components/Hero.tsx`
- **Database Migration**: See `supabase/migrations/20251216000000_increase_file_upload_limit.sql`

---

**Last Updated**: 2025-12-16  
**Version**: 1.0  
**Estimated Time**: 5-15 minutes
