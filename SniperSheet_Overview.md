# SniperSheet — Excel Add-in Overview
**Developed by Mustafa Alsahlany · © 2025–2026 All Rights Reserved**

---

## What Is SniperSheet?

SniperSheet is a professional Excel Add-in that brings the power of Artificial Intelligence directly into Microsoft Excel. It is designed to make Excel accessible, fast, and professional for everyone — from complete beginners to advanced users — without requiring any technical knowledge or formula expertise.

With SniperSheet, you simply **select your cells**, **type what you want in plain language** (Arabic or English), and the AI does the rest — instantly building formulas, applying smart formatting, highlighting conditions, and more.

---

## Purpose & Vision

Excel is one of the most powerful tools in the world, but it has always had a steep learning curve. Complex formulas, conditional formatting rules, and data analysis techniques have traditionally required years of practice or professional training.

**SniperSheet removes that barrier entirely.**

> "You don't need to know Excel anymore — you just need to know what you want."

Whether you are a student, a business owner, an accountant, or an office employee, SniperSheet turns Excel into a smart assistant that understands you.

---

## Core Features

### 1. Smart Hub (AI Command Center)
The central panel of SniperSheet. You select a range of cells in Excel, describe your goal in one sentence, and the AI engine:
- Analyzes your data automatically
- Detects the type of content (numbers, dates, names, scores, etc.)
- Chooses the right formula or formatting action
- Executes it immediately — no copy-paste, no manual steps

**Example commands:**
- *"Calculate the total sales for each region"*
- *"Highlight all values below 50 in red"*
- *"Add a VLOOKUP to find employee names from the ID list"*
- *"Color the top 10% of scores in green"*

---

### 2. Formula Engine (AI-Powered)
SniperSheet's Formula Engine understands natural language and converts it into precise Excel formulas. It supports:

| Category | Examples |
|---|---|
| Math & Aggregation | SUM, AVERAGE, MAX, MIN, COUNT |
| Logical | IF, IFS, AND, OR, IFERROR |
| Lookup | VLOOKUP, HLOOKUP, INDEX/MATCH, XLOOKUP |
| Text | CONCATENATE, LEFT, RIGHT, TRIM, PROPER |
| Date & Time | TODAY, DATEDIF, NETWORKDAYS, YEAR |
| Statistical | COUNTIF, SUMIF, AVERAGEIF, RANK |
| Financial | PMT, NPV, IRR, FV |
| Array | Dynamic array formulas, spill ranges |

The engine builds the formula for the **exact selection** you made — automatically filling the correct range, adjusting references, and handling edge cases.

---

### 3. Smart Formatting (Instant Professional Styling)
Beyond formulas, SniperSheet understands formatting intent:
- **Conditional formatting** — color-code cells based on values, thresholds, or rules
- **Font styling** — bold headers, color-coded categories
- **Fill colors** — automatic background colors based on data patterns
- **Number formats** — currency, percentage, date, decimal precision
- **Table styling** — professional table borders and alternating row colors

Everything is applied to your actual selection — no dialog boxes, no menu hunting.

---

### 4. Bilingual Interface (Arabic + English)
SniperSheet is fully bilingual — the **first Excel Add-in** designed with native Arabic support alongside English:
- The entire UI switches between Arabic and English with one click
- RTL (Right-to-Left) layout for Arabic users
- You can give commands in Arabic: *"احسب المجموع"*, *"لون الخلايا الأقل من 50 باللون الأحمر"*
- AI understands both languages simultaneously — no need to switch

---

### 5. Mouse-First Workflow
SniperSheet is built around the most natural way to work in Excel — **mouse selection**:
1. Select any range of cells in Excel
2. The Add-in automatically reads your selection
3. Type your command
4. Click Analyze — done

No need to type cell references, no need to understand formula syntax. Your mouse selection IS the input.

---

### 6. Real-Time AI Analysis
Every request goes through the **Groq AI engine** (powered by advanced language models) which:
- Processes your command in under 2 seconds
- Returns the appropriate formula or formatting action
- Explains what it did in plain language
- Handles ambiguous requests intelligently

**Speed:** Typical response time is **1–3 seconds** from click to result.

---

### 7. Word Radar (Intelligent Intent Detection)
Before even calling the AI, SniperSheet's local Word Radar engine scans your command for keywords and pre-classifies your intent:
- Formatting-only requests are handled without unnecessary API calls
- Reduces response time for common tasks
- Works completely offline for basic operations
- Supports Arabic keyword detection including definite articles (*"الإجمالي"*, *"المجموع"*, *"الأعلى"*)

---

### 8. Conditional Color Coding
One of the most requested Excel features — made effortless:
- *"Highlight values less than 100 in orange"*
- *"Color cells above average in green"*
- *"Mark negative numbers in red"*

SniperSheet applies proper Excel conditional formatting rules — not just static colors — meaning the colors **update automatically** as your data changes.

---

## The User Interface

SniperSheet opens as a **400px task pane** on the right side of Excel. The interface has two main areas:

### Top Bar
- Language toggle: **AR | EN**
- Add-in title and branding

### Smart Hub Tab
- **Selection Display** — shows which cells are currently selected
- **Command Input** — a text box where you describe what you want
- **Analyze Button** — triggers the AI engine
- **Result Panel** — shows the generated formula and explanation
- **Apply Button** — inserts the formula or formatting into Excel
- **Status Messages** — real-time feedback (success, errors, warnings)

### Visual Design
- Clean, dark-themed professional UI
- Color palette: deep navy, gold accents, white text
- Fully responsive within the task pane
- Loading animations during AI processing
- Clear error messages in both Arabic and English

---

## Who Is SniperSheet For?

| User Type | How SniperSheet Helps |
|---|---|
| Students | Complete assignments and data analysis without formula knowledge |
| Business Owners | Build financial reports and dashboards without hiring consultants |
| Accountants | Automate repetitive calculations instantly |
| HR Professionals | Analyze employee data, attendance, and payroll with simple commands |
| Teachers | Create graded sheets and scoring systems effortlessly |
| Office Employees | Handle any Excel task without asking for help |
| Arabic Speakers | First-class experience in their native language |

---

## Why SniperSheet Is Different

| Traditional Excel | Excel + SniperSheet |
|---|---|
| Must know formula syntax | Type in plain language |
| Hours to build complex sheets | Minutes or seconds |
| English-only tools | Full Arabic + English support |
| Error-prone manual work | AI validates and applies correctly |
| Requires training | Works on first use |
| Formatting takes many clicks | One sentence, instant result |
| Static formulas | Smart, range-aware formula generation |

---

## Technical Highlights

- **Platform:** Microsoft Excel (Desktop + Online via Excel Add-in)
- **Task Pane:** 400px side panel, always accessible
- **AI Model:** Groq API — llama-3.3-70b (ultra-fast inference)
- **Backend:** Node.js / Express — hosted on secure cloud infrastructure
- **Frontend:** React + TypeScript — fast, modern, reliable
- **Response Time:** Average 1–3 seconds per AI request
- **Security:** CORS-locked API, rate limiting, proprietary app token, encrypted communication
- **Languages:** Arabic (RTL) + English (LTR) — full UI and AI command support
- **Offline Capability:** Basic formatting detection works without internet

---

## Security & Privacy

- All API requests are secured with HTTPS encryption
- The API is locked to the official SniperSheet domain only
- Rate limiting prevents abuse and ensures fair usage
- Your Excel data is sent only when you click Analyze — nothing is monitored passively
- No data is stored on the server after your request is processed

---

## Getting Started in 3 Steps

1. **Install** the SniperSheet Add-in from the manifest file in Microsoft Excel
2. **Select** any cells in your spreadsheet
3. **Type** what you want in plain language and click **Analyze**

That's it. No training. No tutorials. No formulas to memorize.

---

## Summary

SniperSheet transforms Microsoft Excel from a tool that requires expertise into a tool that anyone can use professionally. By combining a clean, bilingual interface with a powerful AI engine and a mouse-first workflow, it delivers the results that used to take hours — in seconds.

**Excel was already powerful. SniperSheet makes it human.**

---

*© 2025–2026 Mustafa Alsahlany · SniperSheet · All Rights Reserved*
*Unauthorized copying, distribution, or use of this software is strictly prohibited.*
