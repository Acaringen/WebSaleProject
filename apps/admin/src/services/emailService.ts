// Email bildirim servisi
// API route üzerinden email gönderimi

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

interface OrderStatusEmailData {
  customerName: string
  customerEmail: string
  orderId: string
  orderStatus: string
  orderItems: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  trackingNumber?: string
  estimatedDelivery?: string
}

export class EmailService {
  private static instance: EmailService
  private emailQueue: EmailData[] = []

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  // Email kuyruğuna ekle
  private addToQueue(emailData: EmailData): void {
    this.emailQueue.push(emailData)
    console.log(`📧 Email kuyruğa eklendi: ${emailData.to} - ${emailData.subject}`)
  }

  // API route üzerinden email gönderimi
  private async sendEmail(data: OrderStatusEmailData): Promise<boolean> {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      
      if (result.success) {
        console.log(`✅ Email başarıyla gönderildi: ${data.customerEmail}`)
        if (result.mock) {
          console.log('⚠️  Mock email gönderildi - Gmail credentials ayarlanmamış')
        }
        return true
      } else {
        console.error('❌ Email gönderme hatası:', result.error)
        return false
      }
    } catch (error) {
      console.error('❌ Email gönderme hatası:', error)
      return false
    }
  }

  // Sipariş durumu değişikliği emaili
  async sendOrderStatusUpdate(data: OrderStatusEmailData): Promise<boolean> {
    try {
      const statusMessages = {
        created: {
          subject: 'Siparişiniz Alındı',
          message: 'Siparişiniz başarıyla alındı ve işleme alındı.'
        },
        approved: {
          subject: 'Siparişiniz Onaylandı',
          message: 'Siparişiniz onaylandı ve hazırlanmaya başlandı.'
        },
        shipped: {
          subject: 'Siparişiniz Kargoya Verildi',
          message: `Siparişiniz kargoya verildi.${data.trackingNumber ? ` Kargo takip numarası: ${data.trackingNumber}` : ''}`
        },
        delivered: {
          subject: 'Siparişiniz Teslim Edildi',
          message: 'Siparişiniz başarıyla teslim edildi.'
        },
        cancelled: {
          subject: 'Siparişiniz İptal Edildi',
          message: 'Siparişiniz iptal edildi.'
        }
      }

      const statusInfo = statusMessages[data.orderStatus as keyof typeof statusMessages]
      if (!statusInfo) {
        throw new Error('Geçersiz sipariş durumu')
      }

      const emailData: EmailData = {
        to: data.customerEmail,
        subject: `${statusInfo.subject} - Sipariş #${data.orderId}`,
        html: this.generateOrderStatusEmailHTML(data, statusInfo),
        text: this.generateOrderStatusEmailText(data, statusInfo)
      }

      this.addToQueue(emailData)
      
      // API route üzerinden email gönderimi
      const emailSent = await this.sendEmail(data)
      
      return emailSent
    } catch (error) {
      console.error('Email gönderme hatası:', error)
      return false
    }
  }

  // HTML email template
  private generateOrderStatusEmailHTML(data: OrderStatusEmailData, statusInfo: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${statusInfo.subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .order-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; color: #2563eb; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusInfo.subject}</h1>
            <p>Merhaba ${data.customerName},</p>
            <p>${statusInfo.message}</p>
          </div>
          
          <div class="content">
            <h2>Sipariş Detayları</h2>
            <div class="order-details">
              <p><strong>Sipariş No:</strong> #${data.orderId}</p>
              <p><strong>Durum:</strong> ${this.getStatusLabel(data.orderStatus)}</p>
              ${data.trackingNumber ? `<p><strong>Kargo Takip No:</strong> ${data.trackingNumber}</p>` : ''}
              ${data.estimatedDelivery ? `<p><strong>Tahmini Teslimat:</strong> ${data.estimatedDelivery}</p>` : ''}
            </div>
            
            <h3>Sipariş Edilen Ürünler</h3>
            ${data.orderItems.map(item => `
              <div class="item">
                <span>${item.name} x ${item.quantity}</span>
                <span>₺${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
            
            <div class="item total">
              <span>Toplam Tutar</span>
              <span>₺${data.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Bu email WebSale sistemi tarafından otomatik olarak gönderilmiştir.</p>
            <p>Siparişlerinizi <a href="http://localhost:3000/orders">buradan</a> takip edebilirsiniz.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Text email template
  private generateOrderStatusEmailText(data: OrderStatusEmailData, statusInfo: any): string {
    return `
${statusInfo.subject}

Merhaba ${data.customerName},

${statusInfo.message}

Sipariş Detayları:
- Sipariş No: #${data.orderId}
- Durum: ${this.getStatusLabel(data.orderStatus)}
${data.trackingNumber ? `- Kargo Takip No: ${data.trackingNumber}` : ''}
${data.estimatedDelivery ? `- Tahmini Teslimat: ${data.estimatedDelivery}` : ''}

Sipariş Edilen Ürünler:
${data.orderItems.map(item => `- ${item.name} x ${item.quantity} = ₺${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Toplam Tutar: ₺${data.totalAmount.toFixed(2)}

Siparişlerinizi http://localhost:3000/orders adresinden takip edebilirsiniz.

Bu email WebSale sistemi tarafından otomatik olarak gönderilmiştir.
    `.trim()
  }

  // Durum etiketleri
  private getStatusLabel(status: string): string {
    const labels = {
      created: 'Sipariş Alındı',
      approved: 'Onaylandı',
      shipped: 'Kargoya Verildi',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    }
    return labels[status as keyof typeof labels] || status
  }

  // Email kuyruğunu temizle (test için)
  clearQueue(): void {
    this.emailQueue = []
  }

  // Kuyruktaki emailleri getir (test için)
  getQueue(): EmailData[] {
    return this.emailQueue
  }
}

export const emailService = EmailService.getInstance()
