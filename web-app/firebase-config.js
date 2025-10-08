// Firebase Configuration
// คุณต้องไปที่ Firebase Console > Project Settings > General > Your apps
// คัดลอก Firebase config และแทนที่ข้อมูลด้านล่าง

const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "my-database-project.firebaseapp.com", 
    projectId: "my-database-project",
    storageBucket: "my-database-project.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id-here"
};

// วิธีหา Firebase Config:
// 1. ไปที่ https://console.firebase.google.com/project/my-database-project
// 2. คลิก Settings (⚙️) > Project settings  
// 3. เลื่อนลงไปหา "Your apps" 
// 4. คลิก "Web app" หรือ "Add app" ถ้ายังไม่มี
// 5. คัดลอก config object มาแทนที่ข้างบน

export default firebaseConfig;