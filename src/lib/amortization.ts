/**
 * Amortization Calculator — คำนวณตัดลดต้นลดดอก
 *
 * สูตร:
 *   ดอกเบี้ยรายเดือน = (ยอดคงเหลือ × อัตราดอกเบี้ย%) / 12
 *   ลดต้น = ยอดจ่าย − ดอกเบี้ยรายเดือน
 *   จ่ายขั้นต่ำ = ดอกเบี้ยรายเดือน (ไม่ลดต้นเลย)
 */

export interface AmortizationRow {
  installment: number;
  balance: number;       // ยอดคงเหลือก่อนจ่าย
  payment: number;       // ยอดที่จ่าย
  interestPortion: number; // ส่วนดอกเบี้ย
  principalPortion: number; // ส่วนลดต้น
  remainingBalance: number; // ยอดหลังจ่าย
  interestRate: number;  // อัตราดอกที่ใช้ (%)
}

export interface PaymentSummary {
  monthlyInterest: number;     // ดอกเบี้ยรายเดือน
  minimumPayment: number;      // จ่ายขั้นต่ำ (= ดอกเบี้ยรายเดือน)
  principalPortion: number;    // ส่วนลดต้น ณ ยอดจ่ายปัจจุบัน
  interestPortion: number;     // ส่วนดอกเบี้ย ณ ยอดจ่ายปัจจุบัน
  interestRate: number;        // อัตราดอกเบี้ยที่ใช้
  totalInterestIfMinimum: number; // ดอกทั้งหมดถ้าจ่ายขั้นต่ำ (ไม่มีที่สิ้นสุด)
}

export interface PaymentLevelComparison {
  paymentAmount: number;
  label: string;
  principalPortion: number;
  interestPortion: number;
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalPaid: number;
}

/**
 * คำนวณ payment summary สำหรับงวดปัจจุบัน
 */
export function calculatePaymentSummary(
  balance: number,
  monthlyPayment: number,
  annualRate: number
): PaymentSummary {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyInterest = balance * monthlyRate;
  const minimumPayment = Math.ceil(monthlyInterest);
  const interestPortion = Math.min(monthlyInterest, monthlyPayment);
  const principalPortion = Math.max(monthlyPayment - monthlyInterest, 0);

  return {
    monthlyInterest: Math.round(monthlyInterest * 100) / 100,
    minimumPayment,
    principalPortion: Math.round(principalPortion * 100) / 100,
    interestPortion: Math.round(interestPortion * 100) / 100,
    interestRate: annualRate,
    totalInterestIfMinimum: -1, // ไม่มีที่สิ้นสุดถ้าจ่ายแค่ดอก
  };
}

/**
 * สร้างตารางผ่อนชำระ (amortization schedule)
 * รองรับ tiered interest rates
 */
export function generateAmortizationSchedule(
  balance: number,
  monthlyPayment: number,
  tiers: { from: number; to: number | null; rate: number }[],
  defaultRate: number,
  startInstallment: number = 1,
  maxInstallments: number = 360
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  let currentBalance = balance;

  for (let i = 0; i < maxInstallments && currentBalance > 0.01; i++) {
    const installment = startInstallment + i;

    // Find applicable rate
    const tier = tiers.find(
      (t) => installment >= t.from && (t.to === null || installment <= t.to)
    );
    const rate = tier?.rate ?? defaultRate;
    const monthlyRate = rate / 100 / 12;

    const interestPortion = currentBalance * monthlyRate;
    const actualPayment = Math.min(monthlyPayment, currentBalance + interestPortion);
    const principalPortion = Math.max(actualPayment - interestPortion, 0);
    const remainingBalance = Math.max(currentBalance - principalPortion, 0);

    schedule.push({
      installment,
      balance: Math.round(currentBalance * 100) / 100,
      payment: Math.round(actualPayment * 100) / 100,
      interestPortion: Math.round(interestPortion * 100) / 100,
      principalPortion: Math.round(principalPortion * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      interestRate: rate,
    });

    currentBalance = remainingBalance;
  }

  return schedule;
}

/**
 * เปรียบเทียบการจ่ายหลายระดับ
 */
export function comparePaymentLevels(
  balance: number,
  currentPayment: number,
  annualRate: number
): PaymentLevelComparison[] {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyInterest = balance * monthlyRate;
  const minimumPayment = Math.ceil(monthlyInterest) + 1; // +1 เพื่อให้ลดต้นได้บ้าง

  const levels = [
    { amount: minimumPayment, label: 'จ่ายขั้นต่ำ' },
    { amount: currentPayment, label: 'จ่ายปัจจุบัน' },
    { amount: Math.round(currentPayment * 1.5), label: 'จ่าย ×1.5' },
    { amount: Math.round(currentPayment * 2), label: 'จ่าย ×2' },
  ];

  // Remove duplicates and sort
  const uniqueLevels = levels
    .filter((l, i, arr) => arr.findIndex((x) => x.amount === l.amount) === i)
    .filter((l) => l.amount > monthlyInterest) // ต้องมากกว่าดอก
    .sort((a, b) => a.amount - b.amount);

  return uniqueLevels.map((level) => {
    let bal = balance;
    let totalInterest = 0;
    let months = 0;
    const maxMonths = 600; // 50 years max

    while (bal > 0.01 && months < maxMonths) {
      const interest = bal * monthlyRate;
      totalInterest += interest;
      const principal = Math.max(level.amount - interest, 0);
      bal = Math.max(bal - principal, 0);
      months++;
    }

    return {
      paymentAmount: level.amount,
      label: level.label,
      principalPortion: Math.round((level.amount - balance * monthlyRate) * 100) / 100,
      interestPortion: Math.round(balance * monthlyRate * 100) / 100,
      monthsToPayoff: months >= maxMonths ? -1 : months,
      totalInterestPaid: Math.round(totalInterest),
      totalPaid: Math.round(totalInterest + balance),
    };
  });
}
