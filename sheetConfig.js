/**
 * sheetConfig.js
 * การตั้งค่า Google Sheet URLs และ GIDs
 */

module.exports = {
  // ✅ ใส่ Sheet ID ของคุณที่นี่
  sheetId: "1LFkaZSMJDC548v5GyNxp_hJxaog6NOocwPbwMFEveDg",
  
  // ✅ GID ของแต่ละแท็บ (อัปเดตตามที่พบจริง)
  gids: {
    toolsMaster: "0",           // Sheet หลักที่มีข้อมูลเครื่องมือ
    // หากมี Sheet อื่นๆ เพิ่มเติมจะอัปเดตภายหลัง
    employees: null,            // ยังไม่พบ
    transactions: null,         // ยังไม่พบ  
    summary: null               // ยังไม่พบ
  },
  
  // ✅ ฟังก์ชันสร้าง CSV export URL
  getCsvUrl: function(gid) {
    return `https://docs.google.com/spreadsheets/d/${this.sheetId}/export?format=csv&gid=${gid}`;
  },
  
  // ✅ ฟังก์ชันสร้าง Sheet URL สำหรับดูข้อมูล
  getSheetUrl: function(gid) {
    return `https://docs.google.com/spreadsheets/d/${this.sheetId}/edit#gid=${gid}`;
  }
};
