// Email servisini test etmek için basit script
const { emailService } = require('./apps/admin/src/services/emailService.ts');

// Environment variables yükle
require('dotenv').config({ path: './apps/admin/.env.local' });

async function testEmail() {
  try {
    console.log('📧 Email servisi test ediliyor...');
    
    const testData = {
      customerName: 'ALKIM ACAR ACAREL',
      customerEmail: 'alkimacaracarel@gmail.com',
      orderId: 'ORD-TEST-123',
      orderStatus: 'shipped',
      orderItems: [
        { name: 'TheSoul Stone', quantity: 1, price: 3000 }
      ],
      totalAmount: 3000,
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2025-10-02'
    };
    
    const result = await emailService.sendOrderStatusUpdate(testData);
    console.log('✅ Email gönderimi başarılı:', result);
    
    // Email kuyruğunu kontrol et
    const queue = emailService.getQueue();
    console.log('📬 Email kuyruğu:', queue.length, 'email');
    
    if (queue.length > 0) {
      console.log('📧 İlk email detayları:');
      console.log('   To:', queue[0].to);
      console.log('   Subject:', queue[0].subject);
      console.log('   HTML uzunluğu:', queue[0].html.length, 'karakter');
    }
    
  } catch (error) {
    console.error('❌ Email test hatası:', error);
  }
}

testEmail();
