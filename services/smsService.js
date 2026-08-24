/**
 * TextBee SMS Gateway Service for DrivePulse Pro
 * Sends real-time SMS notifications for OTPs, Booking Confirmations, and Pickup Verification Codes.
 */

const sendSMS = async ({ recipients, message }) => {
  try {
    const apiKey = process.env.TEXTBEE_API_KEY;
    const deviceId = process.env.TEXTBEE_DEVICE_ID || '6a8c51a3b30f973be0d642fd';

    if (!apiKey) {
      console.warn('⚠️ [TextBee SMS] TEXTBEE_API_KEY is not set in .env. Skipping live SMS dispatch. Message payload:', message);
      return { success: false, message: 'TEXTBEE_API_KEY not configured' };
    }

    // Format recipients with country code if needed (default to +91 for 10-digit Indian numbers)
    const formattedRecipients = recipients.map((r) => {
      const clean = r.toString().replace(/[^0-9]/g, '');
      if (clean.length === 10) return `+91${clean}`;
      if (!r.startsWith('+')) return `+${clean}`;
      return r;
    });

    console.log(`📱 [TextBee SMS] Sending SMS to ${formattedRecipients.join(', ')}...`);

    const response = await fetch('https://api.textbee.dev/api/v1/gateway/send-sms', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId,
        recipients: formattedRecipients,
        message,
      }),
    });

    const data = await response.json();
    console.log('✅ [TextBee SMS] Response:', data);
    return { success: response.ok, data };
  } catch (error) {
    console.error('❌ [TextBee SMS] Error sending SMS:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP for Password Reset / Mobile Verification
 */
const sendOtpSMS = async (phone, otp) => {
  const message = `[DrivePulse Pro] Your verification OTP code is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
  return await sendSMS({ recipients: [phone], message });
};

/**
 * Send Booking Submission Alert
 */
const sendBookingSubmittedSMS = async (phone, bookingRef, vehicleTitle) => {
  const message = `[DrivePulse Pro] Booking ${bookingRef} for ${vehicleTitle} submitted successfully! Status: Waiting for Provider Approval.`;
  return await sendSMS({ recipients: [phone], message });
};

/**
 * Send Booking Approval & Pickup Verification Code
 */
const sendBookingApprovedSMS = async (phone, bookingRef, vehicleTitle, verificationCode) => {
  const message = `[DrivePulse Pro] Great news! Booking ${bookingRef} for ${vehicleTitle} is APPROVED! Your Pickup Verification Code is: ${verificationCode}. Present this at vehicle pickup.`;
  return await sendSMS({ recipients: [phone], message });
};

module.exports = {
  sendSMS,
  sendOtpSMS,
  sendBookingSubmittedSMS,
  sendBookingApprovedSMS,
};
