import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface AppointmentEmailData {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  specialty: string;
  notes: string;
  whiteboardImage?: string; // Base64 or URL
  transcription: string;
}

export async function sendAppointmentReceipt(
  patientEmail: string,
  patientName: string,
  doctorName: string,
  appointmentDate: string,
  specialty: string
) {
  try {
    const result = await resend.emails.send({
      from: 'appointments@healthcare.app',
      to: patientEmail,
      subject: `Appointment Confirmed with Dr. ${doctorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Appointment Confirmed</h2>
          <p>Dear ${patientName},</p>
          <p>Your appointment has been successfully booked with:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p><strong>Specialty:</strong> ${specialty}</p>
            <p><strong>Date & Time:</strong> ${appointmentDate}</p>
          </div>
          <p>Please arrive 10 minutes early to complete check-in.</p>
          <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
          <p>Best regards,<br>Healthcare Team</p>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('Error sending appointment receipt:', error);
    throw error;
  }
}

export async function sendAppointmentSummary(
  data: AppointmentEmailData
) {
  try {
    // Prepare attachments
    const attachments = [];

    if (data.whiteboardImage) {
      attachments.push({
        filename: 'whiteboard.png',
        content: data.whiteboardImage.split(',')[1] || data.whiteboardImage, // Handle base64
        encoding: 'base64',
      });
    }

    const result = await resend.emails.send({
      from: 'appointments@healthcare.app',
      to: data.patientEmail,
      subject: `Appointment Summary - Dr. ${data.doctorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Appointment Summary</h2>
          <p>Dear ${data.patientName},</p>
          <p>Thank you for your appointment on ${data.appointmentDate} at ${data.appointmentTime}.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Clinical Notes</h3>
            <p>${data.notes.replace(/\n/g, '<br>')}</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Transcription</h3>
            <p>${data.transcription.replace(/\n/g, '<br>')}</p>
          </div>

          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            If you have any questions or concerns about your appointment, please don't hesitate to contact our office.
          </p>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('Error sending appointment summary:', error);
    throw error;
  }
}

export async function sendPrescriptionEmail(
  patientEmail: string,
  patientName: string,
  prescriptions: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>
) {
  try {
    const prescriptionHTML = prescriptions
      .map(
        (p) =>
          `
        <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
          <p><strong>Medication:</strong> ${p.medication}</p>
          <p><strong>Dosage:</strong> ${p.dosage}</p>
          <p><strong>Frequency:</strong> ${p.frequency}</p>
          <p><strong>Duration:</strong> ${p.duration}</p>
          <p><strong>Instructions:</strong> ${p.instructions}</p>
        </div>
      `
      )
      .join('');

    const result = await resend.emails.send({
      from: 'prescriptions@healthcare.app',
      to: patientEmail,
      subject: 'Your Prescription',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Prescription</h2>
          <p>Dear ${patientName},</p>
          <p>Your doctor has issued the following prescriptions:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            ${prescriptionHTML}
          </div>

          <p style="color: #666; font-size: 12px;">
            Please take these medications as directed by your doctor. If you experience any adverse effects, contact your healthcare provider immediately.
          </p>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('Error sending prescription email:', error);
    throw error;
  }
}
