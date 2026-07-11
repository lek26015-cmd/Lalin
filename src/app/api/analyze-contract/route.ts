import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ContractAnalysisResult } from '@/types/contract';

export const dynamic = 'force-dynamic';

const PROMPT = `คุณเป็นผู้เชี่ยวชาญด้านการวิเคราะห์สัญญาสินเชื่อและหนี้สินของไทย
วิเคราะห์รูปสัญญาหนี้/สินเชื่อนี้ แล้วดึงข้อมูลออกมาเป็น JSON

ดึงข้อมูลต่อไปนี้:
1. debt_name: ชื่อหนี้/ประเภทสินเชื่อ
2. total_amount: ยอดหนี้/วงเงินทั้งหมด (ตัวเลข)
3. monthly_payment: ยอดผ่อนต่อเดือน (ตัวเลข)
4. minimum_payment: ยอดจ่ายขั้นต่ำ (ตัวเลข, null ถ้าไม่ระบุ)
5. interest_tiers: อัตราดอกเบี้ยแบบขั้นบันได เป็น array ของ object
   - from_installment: งวดเริ่มต้น
   - to_installment: งวดสุดท้าย (null ถ้าจนจบสัญญา)
   - interest_rate: อัตราดอกเบี้ย % ต่อปี
   - condition_note: เงื่อนไขพิเศษของขั้นนี้
6. default_interest_rate: อัตราดอกเบี้ยหลัก % ต่อปี
7. start_date: วันเริ่มสัญญา (YYYY-MM-DD format, null ถ้าไม่ระบุ)
8. paid_installments: จำนวนงวดที่จ่ายแล้ว (null ถ้าไม่ระบุ)
9. special_conditions: เงื่อนไขพิเศษอื่นๆ เป็น array ของ string
10. contract_type: ประเภทสัญญา (เช่น สินเชื่อรถ, สินเชื่อบ้าน, บัตรเครดิต, สินเชื่อส่วนบุคคล)
11. creditor_name: ชื่อเจ้าหนี้/ธนาคาร (null ถ้าไม่ระบุ)
12. raw_summary: สรุปเนื้อหาสัญญาแบบสั้นๆ 2-3 ประโยค เป็นภาษาไทย

ถ้าข้อมูลไหนไม่ชัดเจนหรือไม่มี ให้ใส่ null หรือ array ว่าง
ตอบเป็น JSON เท่านั้น ไม่ต้องมี markdown wrapper`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error: 'ยังไม่ได้ตั้งค่า GOOGLE_GEMINI_API_KEY',
          hint: 'เพิ่ม GOOGLE_GEMINI_API_KEY=your-key-here ใน .env.local',
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { image, mimeType } = body as {
      image: string; // base64 encoded
      mimeType: string;
    };

    if (!image) {
      return Response.json({ error: 'ไม่มีรูปภาพ' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent([
      PROMPT,
      {
        inlineData: {
          data: image,
          mimeType: mimeType || 'image/jpeg',
        },
      },
    ]);

    const responseText = result.response.text();
    const parsed: ContractAnalysisResult = JSON.parse(responseText);

    return Response.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Contract analysis failed:', error);
    return Response.json(
      {
        error: 'วิเคราะห์สัญญาไม่สำเร็จ',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
