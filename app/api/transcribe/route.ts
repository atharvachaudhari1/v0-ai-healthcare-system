import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

const TranscriptionSchema = z.object({
  transcription: z.string(),
  diagnosis: z.string(),
  treatment_plan: z.string(),
  follow_up: z.string(),
  key_findings: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = imageFile.type || 'image/png';

    // Use Gemini Vision to transcribe the whiteboard
    const model = google.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType,
        },
      },
      {
        text: `You are a medical documentation expert. Please analyze this whiteboard image from a doctor's appointment and provide:
1. A complete transcription of all visible text
2. The diagnosis or clinical impression
3. Recommended treatment plan
4. Follow-up recommendations
5. Key clinical findings

Format your response as JSON with the following structure:
{
  "transcription": "complete text from the whiteboard",
  "diagnosis": "clinical diagnosis or impression",
  "treatment_plan": "recommended treatments",
  "follow_up": "follow-up recommendations",
  "key_findings": ["finding1", "finding2", ...]
}`,
      },
    ]);

    const responseText = result.response.text();

    // Parse the JSON response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      const validated = TranscriptionSchema.parse(parsedResponse);

      return NextResponse.json(validated);
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
      return NextResponse.json({
        transcription: responseText,
        diagnosis: '',
        treatment_plan: '',
        follow_up: '',
        key_findings: [],
      });
    }
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 }
    );
  }
}
