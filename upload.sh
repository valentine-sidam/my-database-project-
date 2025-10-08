#!/bin/bash
# upload.sh - สคริปต์สำหรับอัปโหลดข้อมูลทั้งหมด

echo "🚀 กำลังอัปโหลดข้อมูลทั้งหมดเข้า Firebase..."
echo ""

# ตรวจสอบไฟล์ Firebase key
if [ ! -f "my-database-project-firebase-adminsdk.json" ]; then
    echo "❌ ไม่พบไฟล์ Firebase Admin SDK key"
    echo "📝 กรุณาดาวน์โหลดจาก Firebase Console และวางไว้ในโฟลเดอร์นี้"
    exit 1
fi

echo "✅ พบไฟล์ Firebase Admin SDK key"
echo ""

# รันการอัปโหลด
node uploadAllData.js

echo ""
echo "🎉 เสร็จสิ้น! ตรวจสอบข้อมูลได้ที่:"
echo "   https://console.firebase.google.com/project/my-database-project/firestore"