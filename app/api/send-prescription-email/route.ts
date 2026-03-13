import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Import Resend if available, otherwise provide a mock
let resend: any = null
try {
  const { Resend } = require('resend')
  resend = new Resend(process.env.RESEND_API_KEY)
} catch (e) {
  console.log('Resend not installed. Install with: npm install resend')
}

interface EmailPayload {
  appointmentId: string
  patientEmail: string
  patientName: string
  transcription: string
  whiteboardImage: string
  prescription?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    if (!resend) {
      return NextResponse.json(
        {
          error: 'Email service not configured. Please install Resend: npm install resend',
        },
        { status: 503 }
      )
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as EmailPayload

    // Build email content
    const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
          .section h2 { margin-top: 0; color: #2563eb; }
          pre { background: white; padding: 15px; border-radius: 4px; overflow-x: auto; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Medical Appointment Summary</h1>
          </div>

          <p>Dear ${body.patientName},</p>

          <p>Thank you for your appointment. Below is a summary of your visit and medical notes.</p>

          ${body.prescription ? `
            <div class="section">
              <h2>Prescription</h2>
              <pre>${body.prescription}</pre>
            </div>
          ` : ''}

          ${body.notes ? `
            <div class="section">
              <h2>Medical Notes</h2>
              <pre>${body.notes}</pre>
            </div>
          ` : ''}

          ${body.transcription ? `
            <div class="section">
              <h2>Appointment Transcription</h2>
              <pre>${body.transcription}</pre>
            </div>
          ` : ''}

          <div class="footer">
            <p>This is an automated email from MediAI Healthcare System.</p>
            <p>If you have questions about your appointment, please contact your healthcare provider.</p>
          </div>
        </div>
      </body>
    </html>
    `

    // Send email via Resend
    const result = await resend.emails.send({
      from: 'noreply@mediaihealth.com',
      to: body.patientEmail,
      subject: `Medical Appointment Summary - ${body.patientName}`,
      html: emailHtml,
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    // Save email record to database
    await supabase.from('medical_records').insert([
      {
        patient_id: body.appointmentId.split('-')[0], // Extract patient ID if needed
        appointment_id: body.appointmentId,
        transcription: body.transcription,
        prescription: body.prescription || '',
        notes: body.notes || '',
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      },
    ])

    return NextResponse.json({
      success: true,
      messageId: result.id,
    })
  } catch (error: any) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
