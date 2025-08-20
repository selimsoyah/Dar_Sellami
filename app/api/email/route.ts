import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmation } from '../../../lib/emailService';

export async function POST(req: NextRequest) {
  try {
    console.log('📧 Email API route called');
    const body = await req.json();
    console.log('📧 Request body received:', JSON.stringify(body));
    
    const { orderDetails } = body;
    
    if (!orderDetails) {
      console.log('❌ Missing order details');
      return NextResponse.json({ success: false, message: 'Order details are required' }, { status: 400 });
    }
    
    console.log('📧 Order details for email:', JSON.stringify(orderDetails));
    console.log('📧 Calling sendOrderConfirmation...');
    
    const result = await sendOrderConfirmation(orderDetails);
    console.log('📧 Email sending result:', result);
    
    if (result.success) {
      console.log('✅ Email sent successfully');
      return NextResponse.json({ success: true });
    } else {
      console.error('❌ Email sending failed:', result.message);
      return NextResponse.json({ success: false, message: result.message }, { status: 500 });
    }
  } catch (error) {
    console.error('💥 Email API error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}