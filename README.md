# أذكاري — إضافة متصفح متعددة المنصات

إضافة إسلامية ترسل محتوى موثوقًا في إشعارات المتصفح، مع مواقيت صلاة حسب الموقع.

## ما الذي تفعله؟

- إرسال أذكار أو أدعية بفاصل زمني تختاره.
- إرسال آيات القرآن بالترتيب؛ تحفظ موضعك وتكمل من الآية التالية.
- إرسال أحاديث من صحيح البخاري بالترتيب.
- فتح أذكار الصباح والمساء تلقائيًا في الوقت الذي تختاره.
- حساب مواقيت الصلاة وفق موقعك، وإظهار الصلاة التالية، والتنبيه عند دخول كل صلاة.
- تشغيل ملف الأذان المتاح في المصدر على المتصفحات التي تدعم تشغيل صوت الخلفية؛ تبقى رسالة التنبيه فعالة على كل المتصفحات.

## مصادر البيانات

المحتوى القرآني والأذكار والأحاديث وملف الأذان يُحمّل عند الحاجة من [Islamic-Api](https://github.com/itsSamBz/Islamic-Api). يُستخدم [AlAdhan](https://aladhan.com/prayer-times-api) فقط لحساب مواقيت الصلاة الدقيقة من الإحداثيات؛ مستودع Islamic-Api يوفّر جداول وطرق الحساب لكنه لا ينفذ حسابًا جغرافيًا مباشرًا.

## المتصفحات المدعومة

| العائلة  | المتصفحات                                                                            |
| -------- | ------------------------------------------------------------------------------------ |
| Chromium | Chrome، Edge، Brave، Opera، Vivaldi، Arc، وChromium                                  |
| Firefox  | Firefox لسطح المكتب                                                                  |
| Safari   | Safari 16.4 أو أحدث على macOS وSafari على iPhone/iPad عبر تطبيق Safari Web Extension |

المتصفحات التي لا تدعم نظام الإضافات (مثل Internet Explorer) لا يمكن تثبيت إضافة عليها تقنيًا.

## التثبيت على Chrome / Edge / Brave / Opera / Vivaldi / Arc

1. افتح صفحة الإضافات في المتصفح (`chrome://extensions` أو `edge://extensions`).
2. فعّل **وضع المطوّر / Developer mode**.
3. اختر **Load unpacked / تحميل بدون حزمة**.
4. اختر هذا المجلد: `C:\Users\engmo\Desktop\Azkar`.

## Firefox

1. شغّل `powershell -ExecutionPolicy Bypass -File .\build.ps1 -Target firefox` من هذا المجلد.
2. افتح `about:debugging#/runtime/this-firefox`.
3. اختر **Load Temporary Add-on**، ثم اختر `dist\firefox\manifest.json`.

سيطلب المتصفح إذن الإشعارات عند الحاجة. يمكن تغيير وقت التذكير، تعطيله، أو إضافة أذكار خاصة من واجهة الإضافة.

## Safari (macOS وiPhone/iPad)

Safari يتطلب تحويل الإضافة إلى تطبيق Apple صغير باستخدام جهاز Mac وXcode:

1. انسخ هذا المجلد إلى جهاز Mac.
2. في Terminal شغّل `pwsh ./build.ps1 -Target safari`، ثم شغّل الأمر التالي:
   ```sh
   xcrun safari-web-extension-converter /المسار/Azkar/dist/safari --project-location /المسار/Azkar-Safari
   ```
3. افتح المشروع الناتج في Xcode، ثم شغّله مرة واحدة.
4. فعّل **أذكاري** من إعدادات Safari > Extensions. سيظهر أيضًا على iPhone/iPad المرتبطين بنفس Apple ID بعد تثبيت التطبيق.

هذا هو مسار Apple الرسمي لتثبيت إضافات Safari خارج متجر App Store. للنشر العام في Safari Extensions Gallery يلزم توقيع ونشر التطبيق عبر Apple Developer.

## إنشاء حزمة مناسبة للمتصفح

من PowerShell داخل المجلد، شغّل أحد الأوامر التالية:

```powershell
.\build.ps1 -Target chrome
.\build.ps1 -Target firefox
.\build.ps1 -Target safari
```

ينشئ الأمر مجلدًا وملف ZIP داخل `dist`. نسخة Chrome هي النسخة الافتراضية الموجودة في جذر المشروع. تستعمل Chrome صوت الأذان في الخلفية؛ Firefox وSafari يعرضان إشعار دخول الصلاة، وقد يختلف تشغيل الصوت بسبب قيود النظام على الصوت بالخلفية.
