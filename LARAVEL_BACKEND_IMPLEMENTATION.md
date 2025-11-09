# Laravel Backend Implementation - Video Upload API

## 📁 الملفات المطلوبة

### 1. Route (routes/api.php)

```php
<?php

use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;

// Video upload endpoint
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/video-creators/{creatorId}/upload-video', [VideoController::class, 'adminUploadVideo']);
    Route::get('/video-creators/{creatorId}/videos', [VideoController::class, 'getCreatorVideos']);
    Route::delete('/videos/{id}', [VideoController::class, 'deleteVideo']);
});
```

---

### 2. Controller (app/Http/Controllers/VideoController.php)

```php
<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class VideoController extends Controller
{
    /**
     * رفع فيديو جديد (Admin only)
     * يستقبل title و video URL من Cloudinary
     */
    public function adminUploadVideo(Request $request, $creatorId)
    {
        // التحقق من صلاحيات Admin
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'error' => 'غير مصرح - يجب أن تكون Admin',
            ], 403);
        }

        // Validation
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'video' => 'required|string|url|max:500', // URL من Cloudinary
        ], [
            'title.required' => 'العنوان مطلوب',
            'title.string' => 'العنوان يجب أن يكون نص',
            'title.max' => 'العنوان لا يمكن أن يتجاوز 255 حرف',
            'video.required' => 'رابط الفيديو مطلوب',
            'video.url' => 'رابط الفيديو غير صحيح',
            'video.max' => 'رابط الفيديو طويل جداً',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'خطأ في التحقق من البيانات',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // التحقق من أن Creator موجود
            $creator = \App\Models\VideoCreator::find($creatorId);
            if (!$creator) {
                return response()->json([
                    'error' => 'Creator غير موجود',
                ], 404);
            }

            // إنشاء الفيديو في قاعدة البيانات
            $video = Video::create([
                'video_creator_id' => $creatorId,
                'title' => $request->title,
                'url' => $request->video, // URL من Cloudinary
            ]);

            // Log للتدقيق
            Log::info('Video uploaded successfully', [
                'video_id' => $video->id,
                'creator_id' => $creatorId,
                'admin_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'تم حفظ الفيديو بنجاح',
                'video' => [
                    'id' => $video->id,
                    'title' => $video->title,
                    'url' => $video->url,
                    'created_at' => $video->created_at,
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Video save failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'creator_id' => $creatorId,
                'admin_id' => Auth::id(),
            ]);

            return response()->json([
                'error' => 'حدث خطأ أثناء حفظ الفيديو',
                'message' => config('app.debug') ? $e->getMessage() : 'حدث خطأ غير متوقع',
            ], 500);
        }
    }

    /**
     * جلب جميع فيديوهات Creator معين
     */
    public function getCreatorVideos($creatorId)
    {
        try {
            $videos = Video::where('video_creator_id', $creatorId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'videos' => $videos,
                'count' => $videos->count(),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch videos', [
                'error' => $e->getMessage(),
                'creator_id' => $creatorId,
            ]);

            return response()->json([
                'error' => 'حدث خطأ أثناء جلب الفيديوهات',
            ], 500);
        }
    }

    /**
     * حذف فيديو
     */
    public function deleteVideo($id)
    {
        // التحقق من صلاحيات Admin
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'error' => 'غير مصرح - يجب أن تكون Admin',
            ], 403);
        }

        try {
            $video = Video::findOrFail($id);
            $video->delete();

            Log::info('Video deleted', [
                'video_id' => $id,
                'admin_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'تم حذف الفيديو بنجاح',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to delete video', [
                'error' => $e->getMessage(),
                'video_id' => $id,
            ]);

            return response()->json([
                'error' => 'حدث خطأ أثناء حذف الفيديو',
            ], 500);
        }
    }
}
```

---

### 3. Model (app/Models/Video.php)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Video extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_creator_id',
        'title',
        'url', // Cloudinary URL
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * العلاقة مع VideoCreator
     */
    public function videoCreator(): BelongsTo
    {
        return $this->belongsTo(VideoCreator::class, 'video_creator_id');
    }
}
```

---

### 4. Migration (database/migrations/xxxx_create_videos_table.php)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_creator_id')->constrained('video_creators')->onDelete('cascade');
            $table->string('title');
            $table->text('url'); // Cloudinary URL
            $table->timestamps();

            // Indexes
            $table->index('video_creator_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
```

---

### 5. Request Validation (app/Http/Requests/UploadVideoRequest.php) - Optional

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'video' => 'required|string|url|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'العنوان مطلوب',
            'title.string' => 'العنوان يجب أن يكون نص',
            'title.max' => 'العنوان لا يمكن أن يتجاوز 255 حرف',
            'video.required' => 'رابط الفيديو مطلوب',
            'video.url' => 'رابط الفيديو غير صحيح',
            'video.max' => 'رابط الفيديو طويل جداً',
        ];
    }
}
```

---

## 🔧 الإعدادات المطلوبة

### 1. CORS Configuration (config/cors.php)

```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000', 'https://yourdomain.com'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 2. Sanctum Configuration (config/sanctum.php)

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,127.0.0.1')),
```

---

## 📝 ملاحظات مهمة

### ✅ المميزات:
1. **بسيط جداً**: لا يوجد رفع ملفات على السيرفر
2. **آمن**: التحقق من صلاحيات Admin
3. **سريع**: فقط حفظ URL في قاعدة البيانات
4. **Logging**: تسجيل جميع العمليات للتدقيق
5. **Error Handling**: معالجة أخطاء شاملة

### 🔒 الأمان:
- التحقق من صلاحيات Admin
- Validation للبيانات
- Logging للعمليات
- Error handling آمن

### 🚀 الاستخدام:

**Request:**
```json
POST /api/video-creators/17/upload-video
Headers: {
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
Body: {
  "title": "Video Title",
  "video": "https://res.cloudinary.com/dg0zyscka/video/upload/v1234567/video.mp4"
}
```

**Response (Success):**
```json
{
  "message": "تم حفظ الفيديو بنجاح",
  "video": {
    "id": 1,
    "title": "Video Title",
    "url": "https://res.cloudinary.com/...",
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "خطأ في التحقق من البيانات",
  "errors": {
    "title": ["العنوان مطلوب"],
    "video": ["رابط الفيديو غير صحيح"]
  }
}
```

---

## 🎯 الخطوات التالية

1. **تشغيل Migration:**
   ```bash
   php artisan migrate
   ```

2. **إضافة Route في api.php**

3. **إنشاء Controller**

4. **اختبار API باستخدام Postman أو Frontend**

---

## 📊 Database Schema

```sql
CREATE TABLE videos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    video_creator_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (video_creator_id) REFERENCES video_creators(id) ON DELETE CASCADE,
    INDEX idx_video_creator_id (video_creator_id),
    INDEX idx_created_at (created_at)
);
```

---

**✅ الكود جاهز للاستخدام مباشرة!**

