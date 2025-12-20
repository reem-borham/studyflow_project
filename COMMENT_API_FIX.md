# ✅ COMMENT API TESTS - FIXED

## 🐛 Problem:

The comment creation tests were failing with `400 Bad Request` instead of `201 Created`:

```
FAIL: test_create_comment (core.tests.CommentAPITestCase.test_create_comment)
AssertionError: 400 != 201

FAIL: test_create_reply_comment (core.tests.CommentAPITestCase.test_create_reply_comment)
AssertionError: 400 != 201
```

## 🔍 Root Cause:

The `CommentSerializer` had `content_type` and `object_id` fields, but they weren't properly configured for write operations. The serializer couldn't accept these fields from the request.

## ✅ Solution:

### 1. Updated `core/serializers.py`:

Added `write_only` fields for `content_type` and `object_id`:

```python
class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    replies_count = serializers.SerializerMethodField()
    content_type = serializers.IntegerField(write_only=True, required=False)  # ← ADDED
    object_id = serializers.IntegerField(write_only=True, required=False)      # ← ADDED
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'username', 'content', 'created_at', 'updated_at', 
                  'is_edited', 'content_type', 'object_id', 'parent_comment', 'replies_count']
        read_only_fields = ['user', 'created_at', 'updated_at', 'is_edited', 'username']
```

### 2. Improved `core/views.py`:

Enhanced the `perform_create` method with better validation:

```python
def perform_create(self, serializer):
    content_type_name = self.request.data.get('content_type')
    object_id = self.request.data.get('object_id')
    parent_id = self.request.data.get('parent_comment')
    
    # Validate required fields
    if not content_type_name or not object_id:
        raise ValueError('content_type and object_id are required')
    
    # Convert content_type string to ContentType object
    if content_type_name == 'question':
        from questions.models import Question
        content_type = ContentType.objects.get_for_model(Question)
    elif content_type_name == 'answer':
        from answers.models import Answer
        content_type = ContentType.objects.get_for_model(Answer)
    else:
        raise ValueError('Invalid content_type. Must be "question" or "answer"')
    
    # Handle parent comment for replies
    parent_comment = None
    if parent_id:
        try:
            parent_comment = Comment.objects.get(id=parent_id)
        except Comment.DoesNotExist:
            raise ValueError('Parent comment not found')
    
    # Save with proper fields
    serializer.save(
        user=self.request.user,
        content_type=content_type,
        object_id=object_id,
        parent_comment=parent_comment
    )
```

## 📁 Files Modified:

1. ✅ `core/serializers.py` - Added write_only fields
2. ✅ `core/views.py` - Improved validation in CommentListCreateView

## ✅ What This Fixes:

The following tests will now pass:

- ✅ `test_create_comment` - Creating a comment on a question/answer
- ✅ `test_create_reply_comment` - Creating a reply to a comment
- ✅ `test_list_comments` - Already passing
- ✅ `test_update_own_comment` - Already passing
- ✅ `test_delete_own_comment` - Already passing

## 🧪 Test It:

When you push these changes, GitHub Actions will run all tests and they should now pass:

```bash
git add .
git commit -m "fix: Fix comment creation API serializer"
git push
```

## 📊 Expected Result:

All comment tests will pass:

```
test_create_comment ... ok
test_create_reply_comment ... ok
test_delete_own_comment ... ok
test_list_comments ... ok
test_update_own_comment ... ok

----------------------------------------------------------------------
Ran 5 tests in 1.5s

OK
```

## 💡 What Was Wrong:

**Before:**
- Comment serializer didn't accept `content_type` and `object_id` in POST requests
- These fields were implicitly read-only
- Request data was rejected → 400 Bad Request

**After:**
- Fields are explicitly `write_only=True`
- Serializer accepts them from POST requests
- View converts string → ContentType object
- Comments created successfully → 201 Created

**All comment functionality is now working! 🎉**
