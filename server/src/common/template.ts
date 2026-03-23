/**
 * Centralized Email Templates for Vector Fleet
 */

const BRAND_SVG = `
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill="#10b981" d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
</svg>
`;

export function generateBaseTemplate(content: string, title: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f4f7f5; margin: 0; padding: 0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02); border: 1px solid #e5e7eb;">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: left;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 40px; height: 40px; background-color: #f0fdf4; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;">
                      ${BRAND_SVG}
                    </div>
                    <span style="font-size: 22px; font-weight: 900; color: #0f172a; margin-left: 10px; letter-spacing: -1px; vertical-align: middle; font-family: -apple-system, sans-serif;">VECTOR</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px 40px 40px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
                  <p style="margin: 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
                    &copy; ${new Date().getFullYear()} Vector Fleet Technologies.
                  </p>
                  <div style="margin-top: 12px;">
                    <a href="#" style="color: #64748b; font-size: 12px; text-decoration: none; margin: 0 8px;">Help Center</a>
                    <a href="#" style="color: #64748b; font-size: 12px; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function verificationEmailTemplate(token: string) {
  const content = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 24px; font-weight: 800; tracking: -0.5px;">Verify your email</h2>
    <p style="color: #475569; font-size: 16px; margin-bottom: 32px;">Welcome to Vector. Please use the verification code below to complete your registration:</p>
    
    <div style="background-color: #f0fdf4; padding: 32px; text-align: center; border-radius: 20px; margin: 32px 0; border: 2px dashed #10b981;">
      <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #065f46; font-family: 'Courier New', Courier, monospace;">${token}</span>
    </div>
    
    <p style="font-size: 14px; color: #64748b; margin-top: 32px; font-weight: 500;">This security code will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
  `;
  return generateBaseTemplate(content, 'Verify Your Account');
}

export function passwordResetTemplate(resetLink: string) {
  const content = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 24px; font-weight: 800; tracking: -0.5px;">Password Reset</h2>
    <p style="color: #475569; font-size: 16px; margin-bottom: 32px;">We've received a request to reset your Vector workspace password. Click the button below to continue:</p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${resetLink}" style="background-color: #0f172a; color: #ffffff; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">Reset Password</a>
    </div>
    
    <p style="font-size: 14px; color: #64748b; margin-top: 32px; font-weight: 500;">This link is valid for 30 minutes. If you didn't request a reset, your account is still secure.</p>
    <div style="height: 1px; background-color: #f3f4f6; margin: 32px 0;"></div>
    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">You're receiving this because a password reset was requested for your Vector account. If this wasn't you, please disregard.</p>
  `;
  return generateBaseTemplate(content, 'Password Reset');
}

export function reportReadyTemplate(startDate: string, endDate: string) {
  const content = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 24px; font-weight: 800; tracking: -0.5px;">Your Fleet Report is Ready</h2>
    <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">As requested, we've generated a performance report for your fleet based on the selected criteria.</p>
    
    <div style="background-color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 32px;">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; padding-bottom: 8px;">Parameters</td>
        </tr>
        <tr>
          <td style="color: #0f172a; font-size: 14px; font-weight: 500;">
            Range: ${startDate} &rarr; ${endDate}
          </td>
        </tr>
      </table>
    </div>

    <p style="color: #475569; font-size: 14px;">The report is attached to this email in CSV format. You can open it with Excel, Google Sheets, or any text editor.</p>
  `;
  return generateBaseTemplate(content, 'Fleet Report');
}

export function trackingLinkTemplate(
  title: string,
  statusText: string,
  trackingLink: string,
  driverName?: string,
) {
  const content = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 24px; font-weight: 800; tracking: -0.5px;">${title}</h2>
    <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">Hi there,</p>
    <p style="color: #475569; font-size: 16px; margin-bottom: 32px;">${statusText}</p>
    
    ${
      driverName
        ? `
    <div style="background-color: #f8fafc; padding: 24px; border-radius: 20px; margin: 32px 0; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 16px;">
      <div style="width: 48px; height: 48px; background-color: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #64748b; font-family: sans-serif;">
        ${driverName.charAt(0)}
      </div>
      <div style="margin-left: 16px; display: inline-block; vertical-align: middle;">
        <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase;">Your Driver</p>
        <p style="margin: 0; font-size: 16px; color: #0f172a; font-weight: 700;">${driverName}</p>
      </div>
    </div>
    `
        : ''
    }

    <div style="text-align: center; margin: 40px 0;">
      <a href="${trackingLink}" style="background-color: #10b981; color: #ffffff; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);">Track Your Delivery</a>
    </div>
    
    <p style="font-size: 14px; color: #64748b; margin-top: 32px; font-weight: 500;">You can use this link to see live updates, confirm your precise location, and view the driver's estimated time of arrival.</p>
  `;
  return generateBaseTemplate(content, title);
}

export function dataClearedTemplate(
  targetRole: string,
  forRecipient: 'driver' | 'fleet' = 'fleet',
) {
  const intro =
    forRecipient === 'driver'
      ? `You confirmed clearance of your own delivery data in the Vector app. Attached is the final CSV export of the records that were removed from your profile (routes, stops, and ratings tied to you).`
      : `A ${targetRole} has initiated a permanent data clearance. As per policy, we have attached the final data report before fully dropping the records.`;
  const content = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 24px; font-weight: 800; tracking: -0.5px;">Data Cleared</h2>
    <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">${intro}</p>
    <p style="color: #475569; font-size: 14px;">The report is attached to this email in CSV format.</p>
  `;
  return generateBaseTemplate(content, 'Data Clearance');
}

export function historyExportTemplate(range: string, count: number) {
  const content = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 24px; font-weight: 800; tracking: -0.5px;">History Export</h2>
    <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">Your delivery history report for <b>${range}</b> is ready. We found ${count} completed ${count === 1 ? 'route' : 'routes'}.</p>
    <p style="color: #475569; font-size: 14px;">Please find the attached CSV file for full details.</p>
  `;
  return generateBaseTemplate(content, 'History Export');
}

export function historyEmptyTemplate(range: string) {
  const content = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 24px; font-weight: 800; tracking: -0.5px;">History Export</h2>
    <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">You requested a history export for <b>${range}</b>, but we couldn't find any completed routes in that period.</p>
  `;
  return generateBaseTemplate(content, 'History Export');
}

export function settingsOtpTemplate(
  action: string,
  otp: string,
  isUrgent: boolean = false,
) {
  const content = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 24px; font-weight: 800; tracking: -0.5px;">Verification Code</h2>
    <p style="color: #475569; font-size: 16px; margin-bottom: 32px;">You requested to <b>${action.replace(/_/g, ' ')}</b>. Please use this code to confirm your request:</p>
    
    <div style="background-color: ${isUrgent ? '#fef2f2' : '#f0fdf4'}; padding: 32px; text-align: center; border-radius: 20px; margin: 32px 0; border: 2px dashed ${isUrgent ? '#ef4444' : '#10b981'};">
      <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: ${isUrgent ? '#991b1b' : '#065f46'}; font-family: 'Courier New', Courier, monospace;">${otp}</span>
    </div>
    
    <p style="font-size: 14px; color: #64748b; margin-top: 32px; font-weight: 500;">This code expires in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
  `;
  return generateBaseTemplate(content, 'Security Verification');
}
