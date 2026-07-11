#!/bin/bash
# =============================================================
# Lalin — Setup Script สำหรับใช้งานจริง
# Run: chmod +x setup.sh && ./setup.sh
# =============================================================

set -e

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║        🏦 Lalin — Setup Production           ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ---- Step 1: Collect credentials ----
echo "📋 ขั้นที่ 1: ใส่ค่า credentials"
echo "──────────────────────────────────"

read -p "Supabase Project URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "LINE LIFF ID: " LIFF_ID
read -p "Google Gemini API Key (เว้นว่างถ้ายังไม่มี): " GEMINI_KEY

echo ""
echo "✅ ได้ข้อมูลแล้ว กำลังเขียน .env.local..."

# ---- Step 2: Write .env.local ----
cat > .env.local << EOF
# LINE LIFF
NEXT_PUBLIC_LIFF_ID=${LIFF_ID}

# Supabase
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# Gemini AI (for contract scanning)
GOOGLE_GEMINI_API_KEY=${GEMINI_KEY}
EOF

echo "✅ .env.local สร้างเรียบร้อย"
echo ""

# ---- Step 3: Install deps ----
echo "📦 ขั้นที่ 2: ติดตั้ง dependencies..."
npm install
echo "✅ Dependencies ติดตั้งเรียบร้อย"
echo ""

# ---- Step 4: Run schema on Supabase ----
echo "🗄️  ขั้นที่ 3: สร้างฐานข้อมูล"
echo "──────────────────────────────────"
echo ""
echo "⚠️  กรุณา copy SQL ด้านล่างนี้ ไปวางใน Supabase Dashboard > SQL Editor แล้ว Run:"
echo ""
echo "   📂 ไฟล์: supabase/schema.sql"
echo "   🔗 เปิด: ${SUPABASE_URL}/project/default/sql/new"
echo ""
echo "   หรือใช้คำสั่ง:"
echo "   cat supabase/schema.sql | pbcopy"
echo "   (SQL จะถูก copy ไปที่ clipboard แล้ว)"
echo ""
read -p "กด Enter เมื่อ Run SQL เสร็จแล้ว..."
echo ""

# ---- Step 5: Build ----
echo "🔨 ขั้นที่ 4: Build production..."
npm run build
echo "✅ Build สำเร็จ"
echo ""

# ---- Step 6: Summary ----
echo "╔══════════════════════════════════════════════╗"
echo "║             ✅ Setup เสร็จสิ้น!              ║"
echo "╠══════════════════════════════════════════════╣"
echo "║                                              ║"
echo "║  ทดสอบ local:  npm run dev                   ║"
echo "║  Deploy:       vercel --prod                 ║"
echo "║                                              ║"
echo "║  หลัง deploy แล้ว:                            ║"
echo "║  1. ก็อปลิงก์ Vercel URL                     ║"
echo "║  2. ไปที่ LINE Developers Console             ║"
echo "║  3. ใส่ URL ใน LIFF > Endpoint URL           ║"
echo "║  4. เปิดใช้ผ่าน LINE ได้เลย!                  ║"
echo "║                                              ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
