import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('[Email] SMTP not configured. Email would have been sent to:', options.to);
    console.warn('[Email] Subject:', options.subject);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"AutoCapital Wheels" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    });
    console.log('[Email] Sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

export function getEmailStyles(): string {
  return `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
      .container { max-width: 600px; margin: 24px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .header { background: #111827; padding: 24px 32px; }
      .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.05em; }
      .header p { color: #9ca3af; margin: 4px 0 0; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }
      .badge { display: inline-block; background: #f59e0b; color: #000; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.05em; margin-top: 8px; text-transform: uppercase; }
      .body { padding: 32px; }
      .section-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; margin: 24px 0 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
      .info-row { display: flex; margin-bottom: 10px; }
      .info-label { width: 140px; font-size: 13px; color: #6b7280; flex-shrink: 0; }
      .info-value { font-size: 13px; color: #111827; font-weight: 500; }
      .vehicle-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; }
      .vehicle-name { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 4px; }
      .vehicle-price { font-size: 18px; font-weight: 800; color: #1d4ed8; }
      .message-box { background: #f9fafb; border-left: 3px solid #d1d5db; padding: 12px 16px; margin: 8px 0; font-size: 13px; color: #374151; border-radius: 0 4px 4px 0; }
      .btn { display: inline-block; background: #111827; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; margin: 16px 0; }
      .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; }
      .footer p { margin: 0; font-size: 12px; color: #9ca3af; }
      .id-badge { font-family: monospace; background: #f3f4f6; border: 1px solid #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 13px; }
    </style>
  `;
}

function emailWrapper(content: string, badge?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">${getEmailStyles()}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AUTOCAPITAL WHEELS</h1>
          <p>TRUSTED CARS. TRUSTED DEALS.</p>
          ${badge ? `<span class="badge">${badge}</span>` : ''}
        </div>
        <div class="body">${content}</div>
        <div class="footer">
          <p>AutoCapital Wheels &bull; <a href="tel:+918800243707" style="color:#6b7280;">+91 8800243707</a> &bull; autocapitalwheels@gmail.com</p>
          <p style="margin-top:4px;">Plot No. 12, Wazirpur Industrial Area, New Delhi, Delhi 110052</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ---- Email Templates ----

export function buildEnquiryEmail(data: {
  enquiry_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_city?: string;
  vehicle?: { year?: number; make?: string; model?: string; variant?: string; price?: number };
  message?: string;
  preferred_contact?: string;
  preferred_time?: string;
  test_drive_requested?: boolean;
  created_at: string;
}): string {
  const vehicleName = data.vehicle
    ? `${data.vehicle.year ?? ''} ${data.vehicle.make ?? ''} ${data.vehicle.model ?? ''} ${data.vehicle.variant ?? ''}`.trim()
    : 'Not specified';

  const priceStr = data.vehicle?.price
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(data.vehicle.price))
    : 'N/A';

  return emailWrapper(`
    <h2 style="margin:0 0 4px;font-size:20px;color:#111827;">New Vehicle Enquiry</h2>
    <p style="margin:0;color:#6b7280;font-size:14px;">Received on ${new Date(data.created_at).toLocaleString('en-IN')}</p>

    <div class="vehicle-card">
      <p class="vehicle-name">${vehicleName}</p>
      <p class="vehicle-price">${priceStr}</p>
    </div>

    <p class="section-title">Customer Details</p>
    <div class="info-row"><span class="info-label">Enquiry ID</span><span class="info-value"><span class="id-badge">${data.enquiry_id}</span></span></div>
    <div class="info-row"><span class="info-label">Name</span><span class="info-value">${data.customer_name}</span></div>
    <div class="info-row"><span class="info-label">Phone</span><span class="info-value"><a href="tel:${data.customer_phone}" style="color:#1d4ed8;">${data.customer_phone}</a></span></div>
    <div class="info-row"><span class="info-label">Email</span><span class="info-value">${data.customer_email || 'Not provided'}</span></div>
    <div class="info-row"><span class="info-label">City</span><span class="info-value">${data.customer_city || 'Not provided'}</span></div>
    <div class="info-row"><span class="info-label">Preferred Contact</span><span class="info-value">${data.preferred_contact || 'Phone'}</span></div>
    <div class="info-row"><span class="info-label">Preferred Time</span><span class="info-value">${data.preferred_time || 'Any time'}</span></div>
    <div class="info-row"><span class="info-label">Test Drive?</span><span class="info-value">${data.test_drive_requested ? '✅ Yes' : 'No'}</span></div>

    ${data.message ? `<p class="section-title">Message</p><div class="message-box">${data.message}</div>` : ''}

    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/enquiries" class="btn">View in Admin Panel →</a>
  `, 'New Enquiry');
}

export function buildSellRequestEmail(data: {
  request_id: string;
  owner_name: string;
  owner_phone: string;
  owner_email?: string;
  owner_city?: string;
  make: string;
  model: string;
  variant?: string;
  manufacturing_year: number;
  fuel_type?: string;
  transmission?: string;
  kms_driven?: number;
  number_of_owners?: number;
  expected_price?: number;
  vehicle_condition?: string;
  accident_history?: boolean;
  insurance_status?: string;
  rc_available?: boolean;
  additional_info?: string;
  photo_count?: number;
  created_at: string;
}): string {
  const expectedPrice = data.expected_price
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(data.expected_price))
    : 'Not specified';

  return emailWrapper(`
    <h2 style="margin:0 0 4px;font-size:20px;color:#111827;">New Sell Car Request</h2>
    <p style="margin:0;color:#6b7280;font-size:14px;">Received on ${new Date(data.created_at).toLocaleString('en-IN')}</p>

    <p class="section-title">Vehicle Details</p>
    <div class="vehicle-card">
      <p class="vehicle-name">${data.manufacturing_year} ${data.make} ${data.model}${data.variant ? ` ${data.variant}` : ''}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Expected Price: <strong style="color:#111827;">${expectedPrice}</strong></p>
    </div>

    <div class="info-row"><span class="info-label">Request ID</span><span class="info-value"><span class="id-badge">${data.request_id}</span></span></div>
    <div class="info-row"><span class="info-label">Fuel Type</span><span class="info-value">${data.fuel_type || 'N/A'}</span></div>
    <div class="info-row"><span class="info-label">Transmission</span><span class="info-value">${data.transmission || 'N/A'}</span></div>
    <div class="info-row"><span class="info-label">KMs Driven</span><span class="info-value">${data.kms_driven?.toLocaleString('en-IN') || 'N/A'} km</span></div>
    <div class="info-row"><span class="info-label">Owners</span><span class="info-value">${data.number_of_owners || 'N/A'}</span></div>
    <div class="info-row"><span class="info-label">Condition</span><span class="info-value">${data.vehicle_condition || 'N/A'}</span></div>
    <div class="info-row"><span class="info-label">Accident History</span><span class="info-value">${data.accident_history ? '⚠️ Yes' : '✅ No'}</span></div>
    <div class="info-row"><span class="info-label">Insurance</span><span class="info-value">${data.insurance_status || 'N/A'}</span></div>
    <div class="info-row"><span class="info-label">RC Available</span><span class="info-value">${data.rc_available ? '✅ Yes' : 'No'}</span></div>
    <div class="info-row"><span class="info-label">Photos Uploaded</span><span class="info-value">${data.photo_count || 0} photo(s)</span></div>

    <p class="section-title">Owner Details</p>
    <div class="info-row"><span class="info-label">Name</span><span class="info-value">${data.owner_name}</span></div>
    <div class="info-row"><span class="info-label">Phone</span><span class="info-value"><a href="tel:${data.owner_phone}" style="color:#1d4ed8;">${data.owner_phone}</a></span></div>
    <div class="info-row"><span class="info-label">Email</span><span class="info-value">${data.owner_email || 'Not provided'}</span></div>
    <div class="info-row"><span class="info-label">City</span><span class="info-value">${data.owner_city}</span></div>

    ${data.additional_info ? `<p class="section-title">Additional Information</p><div class="message-box">${data.additional_info}</div>` : ''}

    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/sell-requests" class="btn">View in Admin Panel →</a>
  `, 'Sell Request');
}

export function buildTestDriveEmail(data: {
  request_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  vehicle?: { year?: number; make?: string; model?: string; variant?: string };
  preferred_date: string;
  preferred_time?: string;
  location?: string;
  message?: string;
  created_at: string;
}): string {
  const vehicleName = data.vehicle
    ? `${data.vehicle.year ?? ''} ${data.vehicle.make ?? ''} ${data.vehicle.model ?? ''} ${data.vehicle.variant ?? ''}`.trim()
    : 'Not specified';

  return emailWrapper(`
    <h2 style="margin:0 0 4px;font-size:20px;color:#111827;">New Test Drive Request</h2>
    <p style="margin:0;color:#6b7280;font-size:14px;">Received on ${new Date(data.created_at).toLocaleString('en-IN')}</p>

    <div class="vehicle-card">
      <p class="vehicle-name">${vehicleName}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Preferred Date: <strong style="color:#111827;">${new Date(data.preferred_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
    </div>

    <p class="section-title">Request Details</p>
    <div class="info-row"><span class="info-label">Request ID</span><span class="info-value"><span class="id-badge">${data.request_id}</span></span></div>
    <div class="info-row"><span class="info-label">Name</span><span class="info-value">${data.customer_name}</span></div>
    <div class="info-row"><span class="info-label">Phone</span><span class="info-value"><a href="tel:${data.customer_phone}" style="color:#1d4ed8;">${data.customer_phone}</a></span></div>
    <div class="info-row"><span class="info-label">Email</span><span class="info-value">${data.customer_email || 'Not provided'}</span></div>
    <div class="info-row"><span class="info-label">Preferred Time</span><span class="info-value">${data.preferred_time || 'Any time'}</span></div>
    <div class="info-row"><span class="info-label">Location</span><span class="info-value">${data.location || 'Not specified'}</span></div>
    ${data.message ? `<p class="section-title">Message</p><div class="message-box">${data.message}</div>` : ''}

    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/test-drives" class="btn">View in Admin Panel →</a>
  `, 'Test Drive');
}

export function buildContactEmail(data: {
  message_id: string;
  name: string;
  phone?: string;
  email: string;
  subject?: string;
  message: string;
  created_at: string;
}): string {
  return emailWrapper(`
    <h2 style="margin:0 0 4px;font-size:20px;color:#111827;">New Contact Message</h2>
    <p style="margin:0;color:#6b7280;font-size:14px;">Received on ${new Date(data.created_at).toLocaleString('en-IN')}</p>

    <p class="section-title">Details</p>
    <div class="info-row"><span class="info-label">Message ID</span><span class="info-value"><span class="id-badge">${data.message_id}</span></span></div>
    <div class="info-row"><span class="info-label">Name</span><span class="info-value">${data.name}</span></div>
    <div class="info-row"><span class="info-label">Email</span><span class="info-value"><a href="mailto:${data.email}" style="color:#1d4ed8;">${data.email}</a></span></div>
    <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${data.phone || 'Not provided'}</span></div>
    ${data.subject ? `<div class="info-row"><span class="info-label">Subject</span><span class="info-value">${data.subject}</span></div>` : ''}

    <p class="section-title">Message</p>
    <div class="message-box">${data.message}</div>

    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/enquiries" class="btn">View in Admin Panel →</a>
  `, 'Contact Message');
}
