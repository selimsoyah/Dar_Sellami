import nodemailer from 'nodemailer';

const RESTAURANT_EMAIL = 'sellamisendacontact@gmail.com';


// Create Gmail transporter (FIXED: createTransport not createTransporter)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ...rest of your code stays the same...

type OrderDetails = {
  orderId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  deliveryType: 'delivery' | 'pickup';
  items: Array<{name: string; quantity: number; price: number}>;
  total: number;
  address?: string;
  governorate?: string;
  pickupTime?: string;
  notes?: string;
};

export async function sendOrderConfirmation(orderDetails: OrderDetails) {
  const { firstName, lastName, email, orderId, items, total, deliveryType } = orderDetails;
  
  console.log('📧 Gmail service starting...');
  console.log('📧 Customer email:', email);
  console.log('📧 Restaurant email:', RESTAURANT_EMAIL);
  console.log('📧 Gmail account:', process.env.GMAIL_EMAIL);
  
  if (!email) {
    console.log('❌ No customer email provided');
    return { success: false, message: 'No customer email provided' };
  }
  
  try {
    console.log('📧 Sending confirmation email to customer...');
    
    // Send confirmation email to customer
    await transporter.sendMail({
      from: '"Dar Sellami Restaurant" <sellamisendacontact@gmail.com>',
      to: email,
      subject: `✅ Order Confirmation #${orderId} - Dar Sellami`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #5c3c25; text-align: center; margin-bottom: 30px;">🍽️ Dar Sellami</h1>
            
            <h2 style="color: #5c3c25;">Thank you for your order, ${firstName}! 🎉</h2>
            <p style="font-size: 16px; color: #333;">Your order has been received and will be prepared with care.</p>
            
            <div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #5c3c25;">
              <h3 style="margin-top: 0; color: #5c3c25;">📋 Order Summary</h3>
              <p><strong>Order Number:</strong> ${orderId}</p>
              <p><strong>Customer:</strong> ${firstName} ${lastName}</p>
              <p><strong>Service Type:</strong> ${deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}</p>
              ${deliveryType === 'pickup' && orderDetails.pickupTime ? `<p><strong>Pickup Time:</strong> ${orderDetails.pickupTime}</p>` : ''}
              ${deliveryType === 'delivery' && orderDetails.address ? `<p><strong>Delivery Address:</strong> ${orderDetails.address}, ${orderDetails.governorate}</p>` : ''}
              ${orderDetails.notes ? `<p><strong>Special Notes:</strong> ${orderDetails.notes}</p>` : ''}
            </div>
            
            <h3 style="color: #5c3c25;">🛒 Your Order:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #5c3c25; color: white;">
                  <th style="text-align: left; padding: 12px; border-radius: 4px 0 0 0;">Item</th>
                  <th style="text-align: center; padding: 12px;">Qty</th>
                  <th style="text-align: right; padding: 12px;">Price</th>
                  <th style="text-align: right; padding: 12px; border-radius: 0 4px 0 0;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px; font-weight: 500;">${item.name}</td>
                    <td style="padding: 12px; text-align: center;">${item.quantity}</td>
                    <td style="padding: 12px; text-align: right;">$${item.price.toFixed(2)}</td>
                    <td style="padding: 12px; text-align: right; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="background-color: #5c3c25; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <h3 style="margin: 0; font-size: 24px;">💰 Total: $${total.toFixed(2)}</h3>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #2e7d32; margin-top: 0;">📞 Contact Information</h4>
              <p style="margin: 5px 0; color: #2e7d32;"><strong>Email:</strong> sellamisendacontact@gmail.com</p>
              <p style="margin: 5px 0; color: #2e7d32;"><strong>Phone:</strong> Available upon request</p>
              <p style="margin: 5px 0; color: #2e7d32;">Feel free to contact us if you have any questions about your order!</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">Thank you for choosing Dar Sellami! 🙏</p>
            </div>
          </div>
        </div>
      `,
    });
    
    console.log('✅ Customer email sent successfully');
    
    console.log('📧 Sending notification email to restaurant...');
    
    // Send notification to restaurant owner
    await transporter.sendMail({
      from: '"Order Notification System" <sellamisendacontact@gmail.com>',
      to: RESTAURANT_EMAIL,
      subject: `🔔 New Order #${orderId} - ${deliveryType === 'delivery' ? 'Delivery' : 'Pickup'} ($${total.toFixed(2)})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #d32f2f; text-align: center; margin-bottom: 20px;">🚨 NEW ORDER ALERT</h1>
            
            <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d32f2f;">
              <h2 style="color: #d32f2f; margin-top: 0;">Order #${orderId} Received! 🎉</h2>
              <p style="font-size: 18px; margin: 0;"><strong>Total Amount: $${total.toFixed(2)}</strong></p>
            </div>
            
            <div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #5c3c25; margin-top: 0;">👤 Customer Information</h3>
              <table style="width: 100%;">
                <tr><td style="padding: 5px 0;"><strong>Name:</strong></td><td>${firstName} ${lastName}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Phone:</strong></td><td style="color: #d32f2f; font-weight: bold;">${orderDetails.phone}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Email:</strong></td><td>${email}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Service:</strong></td><td><strong>${deliveryType === 'delivery' ? '🚚 DELIVERY' : '🏪 PICKUP'}</strong></td></tr>
                ${deliveryType === 'pickup' && orderDetails.pickupTime ? `<tr><td style="padding: 5px 0;"><strong>Pickup Time:</strong></td><td style="color: #d32f2f; font-weight: bold;">${orderDetails.pickupTime}</td></tr>` : ''}
                ${deliveryType === 'delivery' && orderDetails.address ? `<tr><td style="padding: 5px 0; vertical-align: top;"><strong>Delivery Address:</strong></td><td style="color: #d32f2f; font-weight: bold;">${orderDetails.address}<br>${orderDetails.governorate}</td></tr>` : ''}
                ${orderDetails.notes ? `<tr><td style="padding: 5px 0; vertical-align: top;"><strong>Special Notes:</strong></td><td style="background-color: #fff3cd; padding: 10px; border-radius: 4px;">${orderDetails.notes}</td></tr>` : ''}
              </table>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">🛒 Order Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #1976d2; color: white;">
                    <th style="text-align: left; padding: 10px;">Item</th>
                    <th style="text-align: center; padding: 10px;">Qty</th>
                    <th style="text-align: right; padding: 10px;">Price</th>
                    <th style="text-align: right; padding: 10px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => `
                    <tr style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 10px; font-weight: 500;">${item.name}</td>
                      <td style="padding: 10px; text-align: center; font-weight: bold; color: #d32f2f;">${item.quantity}</td>
                      <td style="padding: 10px; text-align: right;">$${item.price.toFixed(2)}</td>
                      <td style="padding: 10px; text-align: right; font-weight: bold;">$${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                  <tr style="background-color: #4caf50; color: white;">
                    <td colspan="3" style="padding: 15px; text-align: right; font-size: 18px;"><strong>TOTAL:</strong></td>
                    <td style="padding: 15px; text-align: right; font-size: 18px; font-weight: bold;">$${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: #856404; margin-top: 0;">⚡ Quick Actions</h3>
              <p style="margin: 10px 0; color: #856404;">
                <strong>📞 Call customer:</strong> ${orderDetails.phone}<br>
                <strong>📧 Email customer:</strong> ${email}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #666; font-size: 14px;">This email was automatically generated by your order system.</p>
            </div>
          </div>
        </div>
      `,
    });
    
    console.log('✅ Restaurant notification email sent successfully');
    console.log('🎉 All emails sent via Gmail SMTP!');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Gmail SMTP error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send email via Gmail'
    };
  }
}