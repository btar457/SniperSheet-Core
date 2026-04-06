import { Router } from "express";

const router = Router();

router.get("/help", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>SniperSheet Official Guide</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --navy:#0f172a;--navyL:#1e293b;--blue:#3b82f6;--blueD:#1d4ed8;
    --green:#10b981;--amber:#f59e0b;--red:#ef4444;--purple:#8b5cf6;
    --slate:#64748b;--light:#f8fafc;--white:#fff;
    --border:#e2e8f0;--text:#1e293b;--sub:#475569;
  }
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
       background:var(--light);color:var(--text);line-height:1.6;font-size:15px}

  /* ── TOP NAV ── */
  nav{background:var(--navy);color:var(--white);padding:0 24px;
      display:flex;align-items:center;justify-content:space-between;
      height:56px;position:sticky;top:0;z-index:50;
      box-shadow:0 2px 12px rgba(0,0,0,.35)}
  .nav-brand{display:flex;align-items:center;gap:10px}
  .nav-logo{width:32px;height:32px;background:var(--blue);border-radius:8px;
             display:flex;align-items:center;justify-content:center;font-size:18px}
  .nav-title{font-size:17px;font-weight:700;letter-spacing:.3px}
  .nav-sub{font-size:11px;color:#94a3b8;margin-top:1px}
  .nav-badge{background:var(--blue);color:var(--white);padding:3px 10px;
              border-radius:99px;font-size:12px;font-weight:600}

  /* ── TOC SIDEBAR + CONTENT ── */
  .layout{display:flex;max-width:1100px;margin:0 auto;gap:0}
  aside{width:220px;flex-shrink:0;padding:28px 0 28px 24px;
        position:sticky;top:56px;height:calc(100vh - 56px);overflow-y:auto}
  aside h3{font-size:11px;font-weight:700;text-transform:uppercase;
            color:var(--slate);letter-spacing:.8px;margin-bottom:12px}
  aside a{display:block;padding:5px 10px;border-radius:6px;font-size:13px;
           color:var(--sub);text-decoration:none;transition:all .15s}
  aside a:hover{background:var(--border);color:var(--text)}
  aside a.active{background:#dbeafe;color:var(--blueD);font-weight:600}
  .toc-num{font-size:11px;color:var(--slate);margin-right:6px}

  main{flex:1;padding:36px 28px 80px;min-width:0}

  /* ── HERO ── */
  .hero{background:linear-gradient(135deg,var(--navy) 0%,var(--navyL) 60%,#1e3a6e 100%);
        border-radius:16px;padding:48px 40px;color:var(--white);margin-bottom:40px;
        position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;right:-60px;top:-60px;width:300px;height:300px;
                background:radial-gradient(circle,rgba(59,130,246,.25) 0%,transparent 70%)}
  .hero-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(59,130,246,.2);
             border:1px solid rgba(59,130,246,.4);color:#93c5fd;
             padding:4px 14px;border-radius:99px;font-size:12px;font-weight:600;margin-bottom:16px}
  .hero h1{font-size:34px;font-weight:800;margin-bottom:8px;letter-spacing:-.5px}
  .hero p{color:#94a3b8;font-size:15px;max-width:520px}
  .hero-dev{margin-top:24px;display:flex;align-items:center;gap:10px}
  .hero-avatar{width:40px;height:40px;border-radius:50%;background:var(--blue);
                display:flex;align-items:center;justify-content:center;
                font-size:18px;font-weight:700;color:var(--white)}
  .hero-name{font-weight:600;font-size:14px}
  .hero-role{font-size:12px;color:#94a3b8}

  /* ── SECTION ── */
  section{margin-bottom:56px;scroll-margin-top:76px}
  h2{font-size:22px;font-weight:700;color:var(--navy);margin-bottom:6px;
     display:flex;align-items:center;gap-10px}
  .sec-icon{font-size:22px;margin-right:10px}
  .sec-rule{height:2px;background:linear-gradient(90deg,var(--blue),transparent);
             margin:10px 0 24px;border:none}
  h3{font-size:16px;font-weight:600;color:var(--navyL);margin:24px 0 10px}

  /* ── CARDS ── */
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .card{background:var(--white);border:1px solid var(--border);border-radius:12px;
        padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
  .card-icon{font-size:24px;margin-bottom:10px}
  .card h4{font-size:14px;font-weight:700;color:var(--navy);margin-bottom:6px}
  .card p{font-size:13px;color:var(--sub);line-height:1.55}
  .card.blue{border-left:3px solid var(--blue)}
  .card.green{border-left:3px solid var(--green)}
  .card.amber{border-left:3px solid var(--amber)}
  .card.purple{border-left:3px solid var(--purple)}
  .card.red{border-left:3px solid var(--red)}

  /* ── FEATURE PILL ── */
  .pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;
         border-radius:99px;font-size:12px;font-weight:600;margin:3px}
  .pill-blue{background:#dbeafe;color:var(--blueD)}
  .pill-green{background:#d1fae5;color:#065f46}
  .pill-amber{background:#fef3c7;color:#92400e}
  .pill-red{background:#fee2e2;color:#991b1b}
  .pill-purple{background:#ede9fe;color:#5b21b6}

  /* ── CODE / FORMULA ── */
  .formula-block{background:#0f172a;border-radius:10px;padding:16px 20px;
                  margin:12px 0;font-family:'Courier New',monospace;
                  font-size:13px;color:#e2e8f0;overflow-x:auto;
                  border-left:3px solid var(--blue)}
  .formula-block .kw{color:#93c5fd}
  .formula-block .str{color:#86efac}
  .formula-block .num{color:#fcd34d}
  .formula-block .fn{color:#f9a8d4}

  /* ── TABLE ── */
  table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13.5px}
  th{background:var(--navy);color:var(--white);padding:9px 14px;text-align:left;font-size:13px}
  td{padding:8px 14px;border-bottom:1px solid var(--border)}
  tr:nth-child(even)td{background:#f8fafc}
  tr:hover td{background:#eff6ff}

  /* ── STEPS ── */
  .steps{counter-reset:step}
  .step{display:flex;gap:16px;margin-bottom:20px;align-items:flex-start}
  .step-num{width:32px;height:32px;border-radius:50%;background:var(--blue);
             color:var(--white);display:flex;align-items:center;justify-content:center;
             font-weight:700;font-size:14px;flex-shrink:0;margin-top:2px}
  .step-body h4{font-size:14px;font-weight:600;margin-bottom:4px}
  .step-body p{font-size:13px;color:var(--sub)}

  /* ── CALLOUT ── */
  .callout{border-radius:10px;padding:14px 18px;margin:14px 0;font-size:13.5px;
            display:flex;gap:12px;align-items:flex-start}
  .callout.info{background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af}
  .callout.warn{background:#fffbeb;border:1px solid #fcd34d;color:#92400e}
  .callout.tip {background:#f0fdf4;border:1px solid #86efac;color:#14532d}
  .callout-icon{font-size:18px;margin-top:1px}

  /* ── ARCH DIAGRAM ── */
  .arch{display:flex;align-items:center;justify-content:center;gap:0;
        flex-wrap:wrap;margin:20px 0}
  .arch-box{background:var(--white);border:2px solid var(--border);border-radius:12px;
             padding:14px 20px;text-align:center;min-width:120px}
  .arch-box.active{border-color:var(--blue);background:#eff6ff}
  .arch-box span{display:block;font-size:22px;margin-bottom:6px}
  .arch-box p{font-size:12px;font-weight:600;color:var(--navy)}
  .arch-box sub{font-size:11px;color:var(--slate)}
  .arch-arrow{font-size:24px;color:var(--blue);padding:0 6px}

  /* ── FOOTER ── */
  footer{background:var(--navy);color:#94a3b8;text-align:center;
         padding:28px 24px;font-size:13px;margin-top:60px}
  footer strong{color:var(--white)}

  /* ── RESPONSIVE ── */
  @media(max-width:768px){
    aside{display:none}
    .grid-2,.grid-3{grid-template-columns:1fr}
    .hero{padding:28px 20px}.hero h1{font-size:24px}
    main{padding:20px 16px 60px}
  }

  /* scrollbar */
  aside::-webkit-scrollbar{width:4px}
  aside::-webkit-scrollbar-track{background:transparent}
  aside::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:99px}
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-brand">
    <div class="nav-logo">⚡</div>
    <div>
      <div class="nav-title">SniperSheet</div>
      <div class="nav-sub">Official Guide</div>
    </div>
  </div>
  <span class="nav-badge">v1.0</span>
</nav>

<div class="layout">

<!-- SIDEBAR TOC -->
<aside>
  <h3>Contents</h3>
  <a href="#overview" class="active"><span class="toc-num">01</span>Overview</a>
  <a href="#smart-engine"><span class="toc-num">02</span>Smart Formula Engine</a>
  <a href="#indicators"><span class="toc-num">03</span>Technical Indicators</a>
  <a href="#commands"><span class="toc-num">04</span>Commands Tab</a>
  <a href="#dimensions"><span class="toc-num">05</span>Cell Dimensions</a>
  <a href="#tools"><span class="toc-num">06</span>Advanced Tools</a>
  <a href="#ai-arch"><span class="toc-num">07</span>AI Architecture</a>
  <a href="#groq"><span class="toc-num">08</span>Groq Integration</a>
  <a href="#prompts"><span class="toc-num">09</span>Prompt Tips</a>
  <a href="#install"><span class="toc-num">10</span>Installation</a>
  <a href="#faq"><span class="toc-num">11</span>FAQ</a>
</aside>

<!-- MAIN CONTENT -->
<main>

  <!-- HERO -->
  <div class="hero">
    <div class="hero-tag">✦ Official Documentation</div>
    <h1>SniperSheet Official Guide</h1>
    <p>An AI-powered Excel Add-in for engineering, financial, and technical analysis workflows — built for precision and speed.</p>
    <div class="hero-dev">
      <div class="hero-avatar">M</div>
      <div>
        <div class="hero-name">Developed by: Mustafa Alsahlany</div>
        <div class="hero-role">Software Engineer · Excel Add-in & AI Integration Specialist</div>
      </div>
    </div>
  </div>

  <!-- 01 OVERVIEW -->
  <section id="overview">
    <h2><span class="sec-icon">🎯</span>Overview</h2>
    <hr class="sec-rule"/>
    <p style="color:var(--sub);margin-bottom:20px">SniperSheet is a professional Excel Add-in that embeds a 400 px task pane directly inside Microsoft Excel. It gives engineers and financial analysts instant access to AI-generated formulas, real-time technical indicators, cell tools, and an intelligent command library — without ever leaving the spreadsheet.</p>

    <div class="grid-3">
      <div class="card blue">
        <div class="card-icon">🤖</div>
        <h4>AI Formula Engine</h4>
        <p>Ask in plain English or Arabic — get an Excel formula instantly via Groq's ultra-fast LLM API.</p>
      </div>
      <div class="card green">
        <div class="card-icon">📊</div>
        <h4>Technical Indicators</h4>
        <p>RSI, MACD, Bollinger Bands, EMA, SMA, ATR, VWAP — all rendered as Excel formulas.</p>
      </div>
      <div class="card amber">
        <div class="card-icon">⚙️</div>
        <h4>Cell Tools</h4>
        <p>Resize rows, columns, merge cells, freeze panes, and format ranges in one click.</p>
      </div>
      <div class="card purple">
        <div class="card-icon">🌐</div>
        <h4>Bilingual UI</h4>
        <p>Full Arabic + English interface. Works in Iraq and the Middle East — no VPN required.</p>
      </div>
      <div class="card red">
        <div class="card-icon">⚡</div>
        <h4>Ultra-Low Latency</h4>
        <p>Responses in under 2 seconds. Powered by Groq's LPU inference hardware.</p>
      </div>
      <div class="card blue">
        <div class="card-icon">🔒</div>
        <h4>No Key Needed</h4>
        <p>AI requests are proxied through Replit — users never need their own API key.</p>
      </div>
    </div>
  </section>

  <!-- 02 SMART FORMULA ENGINE -->
  <section id="smart-engine">
    <h2><span class="sec-icon">✨</span>Smart Formula Engine</h2>
    <hr class="sec-rule"/>
    <p style="color:var(--sub);margin-bottom:20px">The centerpiece of SniperSheet. Type a question in any language — the engine parses intent, selects the best model, and returns a complete, ready-to-paste Excel formula with a full explanation.</p>

    <div class="callout info">
      <span class="callout-icon">💡</span>
      <div><strong>How it works:</strong> Your question is sent to the SniperSheet server (hosted on Replit), which forwards it to Groq AI and streams the formula back to your task pane.</div>
    </div>

    <h3>Supported Request Types</h3>
    <div class="grid-2">
      <div class="card blue">
        <h4>🧮 Engineering & Math</h4>
        <p>Structural loads, stress calculations, unit conversions, matrix operations, statistical analysis.</p>
      </div>
      <div class="card green">
        <h4>💰 Finance & Accounting</h4>
        <p>IRR, NPV, loan schedules, depreciation, cash flow, bond pricing, portfolio returns.</p>
      </div>
      <div class="card amber">
        <h4>📈 Data & Statistics</h4>
        <p>Regression, ANOVA, correlation, moving averages, percentiles, standard deviation.</p>
      </div>
      <div class="card purple">
        <h4>🔤 Text & Lookup</h4>
        <p>VLOOKUP, XLOOKUP, INDEX/MATCH, dynamic arrays, conditional formatting, data validation.</p>
      </div>
    </div>

    <h3>Example Formulas Generated</h3>
    <div class="formula-block"><span class="kw">=IF</span>(<span class="fn">VLOOKUP</span>(A2,Sheet2!A:B,2,<span class="num">0</span>)&gt;<span class="num">1000</span>,<span class="str">"High"</span>,<span class="str">"Low"</span>)</div>
    <div class="formula-block"><span class="kw">=NPV</span>(<span class="num">0.08</span>/12, C2:C61) - B2</div>
    <div class="formula-block"><span class="kw">=SUMPRODUCT</span>((A2:A100=<span class="str">"Q1"</span>)*(B2:B100&gt;<span class="num">500</span>)*C2:C100)</div>
    <div class="formula-block"><span class="kw">=AVERAGE</span>(<span class="fn">OFFSET</span>(B2,<span class="fn">ROW</span>()-<span class="fn">ROW</span>(B2),0,-<span class="num">14</span>)) &nbsp;<span style="color:#64748b">-- 14-day moving average</span></div>

    <h3>Confidence Score System</h3>
    <p style="color:var(--sub);margin-bottom:12px">Every response includes a confidence indicator:</p>
    <table>
      <tr><th>Score</th><th>Label</th><th>Meaning</th></tr>
      <tr><td><span class="pill pill-green">90–100%</span></td><td>Excellent</td><td>Formula is reliable and well-tested for this pattern</td></tr>
      <tr><td><span class="pill pill-blue">75–89%</span></td><td>Good</td><td>Formula is correct — verify on your specific data range</td></tr>
      <tr><td><span class="pill pill-amber">60–74%</span></td><td>Fair</td><td>Likely correct — manual review recommended</td></tr>
      <tr><td><span class="pill pill-red">Below 60%</span></td><td>Low</td><td>Complex request — treat as a starting point</td></tr>
    </table>
  </section>

  <!-- 03 TECHNICAL INDICATORS -->
  <section id="indicators">
    <h2><span class="sec-icon">📊</span>Technical Indicators</h2>
    <hr class="sec-rule"/>
    <p style="color:var(--sub);margin-bottom:20px">Generate professional-grade trading and financial indicators as native Excel formulas. Select your price column, set the period, and click — the formula is inserted directly into your active cell.</p>

    <table>
      <tr><th>Indicator</th><th>Full Name</th><th>Typical Period</th><th>Use Case</th></tr>
      <tr><td><strong>RSI</strong></td><td>Relative Strength Index</td><td>14 days</td><td>Overbought / oversold conditions</td></tr>
      <tr><td><strong>MACD</strong></td><td>Moving Avg Convergence Divergence</td><td>12/26/9</td><td>Trend momentum &amp; reversals</td></tr>
      <tr><td><strong>SMA</strong></td><td>Simple Moving Average</td><td>20 / 50 / 200</td><td>Trend direction &amp; support levels</td></tr>
      <tr><td><strong>EMA</strong></td><td>Exponential Moving Average</td><td>12 / 26</td><td>Recent price weighting</td></tr>
      <tr><td><strong>BB</strong></td><td>Bollinger Bands</td><td>20 days, 2σ</td><td>Volatility &amp; price channel</td></tr>
      <tr><td><strong>ATR</strong></td><td>Average True Range</td><td>14 days</td><td>Volatility measurement</td></tr>
      <tr><td><strong>VWAP</strong></td><td>Volume-Weighted Average Price</td><td>Intraday</td><td>Fair value benchmark</td></tr>
      <tr><td><strong>Stoch</strong></td><td>Stochastic Oscillator</td><td>14 days</td><td>Momentum &amp; reversal signals</td></tr>
    </table>

    <div class="callout tip">
      <span class="callout-icon">✅</span>
      <div><strong>Pro Tip:</strong> All indicators are expressed as pure Excel formulas — no macros, no VBA, no external data feeds. They recalculate automatically when your data changes.</div>
    </div>

    <h3>RSI Formula (14-period) — Example Output</h3>
    <div class="formula-block">
<span style="color:#94a3b8">-- Average Gain (column D, rows 2–100)</span>
<span class="kw">=AVERAGEIF</span>(D2:D100,<span class="str">"&gt;0"</span>)<br/>
<span style="color:#94a3b8">-- RSI calculation</span>
<span class="kw">=100</span> - (100 / (1 + (<span class="fn">AVERAGEIF</span>(D2:D15,<span class="str">"&gt;0"</span>) / <span class="fn">ABS</span>(<span class="fn">AVERAGEIF</span>(D2:D15,<span class="str">"&lt;0"</span>)))))</div>

    <h3>MACD Formula — Example Output</h3>
    <div class="formula-block">
<span style="color:#94a3b8">-- EMA 12</span>
<span class="kw">=C2</span>*(2/13)+<span class="fn">C1</span>*(1-2/13)<br/>
<span style="color:#94a3b8">-- EMA 26</span>
<span class="kw">=C2</span>*(2/27)+<span class="fn">C1</span>*(1-2/27)<br/>
<span style="color:#94a3b8">-- MACD Line</span>
<span class="kw">=EMA12</span> - EMA26</div>
  </section>

  <!-- 04 COMMANDS -->
  <section id="commands">
    <h2><span class="sec-icon">⌨️</span>Commands Tab</h2>
    <hr class="sec-rule"/>
    <p style="color:var(--sub);margin-bottom:20px">A searchable library of Excel commands, keyboard shortcuts, and function references — organized by category for fast lookup.</p>

    <div class="grid-2">
      <div class="card blue">
        <h4>📋 Function Reference</h4>
        <p>Complete reference for LOOKUP, TEXT, MATH, STATISTICAL, DATE, and FINANCIAL function families with syntax and examples.</p>
      </div>
      <div class="card green">
        <h4>⌨️ Keyboard Shortcuts</h4>
        <p>All essential Excel shortcuts — navigation, formatting, formula entry, and selection — in one searchable panel.</p>
      </div>
      <div class="card amber">
        <h4>🏷️ Named Ranges</h4>
        <p>Quick guide to defining, managing, and referencing named ranges and structured table references.</p>
      </div>
      <div class="card purple">
        <h4>📐 Array Formulas</h4>
        <p>Dynamic array functions: FILTER, SORT, UNIQUE, SEQUENCE, XLOOKUP, and spill range operators.</p>
      </div>
    </div>
  </section>

  <!-- 05 DIMENSIONS -->
  <section id="dimensions">
    <h2><span class="sec-icon">📐</span>Cell Dimensions Tab</h2>
    <hr class="sec-rule"/>
    <p style="color:var(--sub);margin-bottom:20px">Precisely control row heights, column widths, and cell ranges — either individually or across the entire sheet — with pixel-level accuracy.</p>

    <table>
      <tr><th>Tool</th><th>Function</th><th>Input</th></tr>
      <tr><td>Row Height</td><td>Set exact height for selected rows</td><td>Pixels (e.g. 24)</td></tr>
      <tr><td>Column Width</td><td>Set exact width for selected columns</td><td>Pixels (e.g. 100)</td></tr>
      <tr><td>Auto-Fit</td><td>Fit rows/columns to content</td><td>One click</td></tr>
      <tr><td>Uniform Grid</td><td>Apply same dimensions to all rows &amp; columns</td><td>Single value</td></tr>
      <tr><td>Range Select</td><td>Apply dimensions to a specified A1:Z100 range</td><td>Range notation</td></tr>
    </table>

    <div class="callout warn">
      <span class="callout-icon">⚠️</span>
      <div><strong>Note:</strong> Excel Online may limit some dimension operations due to browser sandbox restrictions. For full functionality, use Excel Desktop (Windows/Mac).</div>
    </div>
  </section>

  <!-- 06 ADVANCED TOOLS -->
  <section id="tools">
    <h2><span class="sec-icon">🔧</span>Advanced Tools Tab</h2>
    <hr class="sec-rule"/>
    <p style="color:var(--sub);margin-bottom:20px">Power-user utilities for data manipulation, formatting, and sheet management.</p>

    <div class="grid-2">
      <div class="card blue">
        <h4>🔀 Sort &amp; Filter Wizard</h4>
        <p>Multi-level sort on up to 5 columns simultaneously. Apply complex filter criteria without touching the Ribbon.</p>
      </div>
      <div class="card green">
        <h4>🎨 Conditional Format Builder</h4>
        <p>Visual rule builder for color scales, data bars, icon sets, and custom formula-based conditions.</p>
      </div>
      <div class="card amber">
        <h4>📊 Chart Inserter</h4>
        <p>Insert pre-configured chart templates (line, bar, candlestick, scatter) tied to your selected data range.</p>
      </div>
      <div class="card purple">
        <h4>🔗 Data Validation</h4>
        <p>Build dropdown lists, input constraints, and custom error messages without navigating the Data Ribbon.</p>
      </div>
      <div class="card red">
        <h4>🧹 Range Cleaner</h4>
        <p>Selectively clear formatting, values, comments, or hyperlinks from any range — independently.</p>
      </div>
      <div class="card blue">
        <h4>📌 Freeze &amp; Split</h4>
        <p>Freeze panes, split views, and lock headers in one click from the task pane.</p>
      </div>
    </div>
  </section>

  <!-- 07 AI ARCHITECTURE -->
  <section id="ai-arch">
    <h2><span class="sec-icon">🏗️</span>AI Architecture</h2>
    <hr class="sec-rule"/>
    <p style="color:var(--sub);margin-bottom:24px">SniperSheet uses a three-tier architecture. User requests never touch Groq directly — they are routed through the SniperSheet server, which handles authentication, rate-limiting, and model selection.</p>

    <div class="arch">
      <div class="arch-box active">
        <span>🖥️</span>
        <p>Excel Task Pane</p>
        <sub>React + Vite</sub>
      </div>
      <div class="arch-arrow">→</div>
      <div class="arch-box active">
        <span>⚙️</span>
        <p>SniperSheet Server</p>
        <sub>Node.js / Express / Replit</sub>
      </div>
      <div class="arch-arrow">→</div>
      <div class="arch-box active">
        <span>🤖</span>
        <p>Groq LPU API</p>
        <sub>llama-3.3-70b-versatile</sub>
      </div>
    </div>

    <div class="callout info">
      <span class="callout-icon">🌍</span>
      <div><strong>Iraq / Middle East:</strong> Because all AI requests are routed through Replit's US servers, users in Iraq and neighboring countries can access the AI engine without a VPN or special configuration.</div>
    </div>

    <h3>Request Lifecycle</h3>
    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-body">
          <h4>User types a question</h4>
          <p>The question is entered in the Smart Hub tab of the task pane.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-body">
          <h4>Request sent to SniperSheet Server</h4>
          <p>An HTTPS POST request is made to <code>/api/smart/ask</code> with the user's prompt.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-body">
          <h4>System prompt is composed</h4>
          <p>The server wraps the user question in a structured system prompt that instructs the model to output only valid Excel formulas.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-body">
          <h4>Groq LPU inference</h4>
          <p>The prompt is sent to Groq's <code>llama-3.3-70b-versatile</code> model. The response typically arrives within 1–2 seconds.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">5</div>
        <div class="step-body">
          <h4>Formula returned to task pane</h4>
          <p>The formula, explanation, and confidence score are displayed in the task pane for the user to copy or insert.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 08 GROQ INTEGRATION -->
  <section id="groq">
    <h2><span class="sec-icon">⚡</span>Groq Integration</h2>
    <hr class="sec-rule"/>
    <p style="color:var(--sub);margin-bottom:20px">Groq's Language Processing Unit (LPU) is purpose-built for inference — delivering token throughput that is 10–50× faster than traditional GPU-based inference.</p>

    <table>
      <tr><th>Model</th><th>Parameters</th><th>Speed</th><th>Best For</th></tr>
      <tr><td><code>llama-3.3-70b-versatile</code></td><td>70B</td><td>~500 tok/s</td><td>Complex formulas, engineering, finance</td></tr>
      <tr><td><code>llama-3.1-8b-instant</code></td><td>8B</td><td>~1200 tok/s</td><td>Simple lookups, quick answers</td></tr>
      <tr><td><code>mixtral-8x7b-32768</code></td><td>56B (MoE)</td><td>~600 tok/s</td><td>Long context, multi-step reasoning</td></tr>
    </table>

    <div class="callout tip">
      <span class="callout-icon">🎯</span>
      <div><strong>Free Tier:</strong> All three models are available on Groq's free plan at <strong>30 requests/minute</strong> — more than enough for typical Excel workflows.</div>
    </div>

    <h3>Why Groq over OpenAI / Gemini?</h3>
    <div class="grid-2">
      <div class="card green">
        <h4>✅ Faster</h4>
        <p>Sub-2-second total response time — including network round-trip to Replit. GPT-4o averages 5–12 seconds.</p>
      </div>
      <div class="card green">
        <h4>✅ Free at Scale</h4>
        <p>30 req/min free tier covers all normal use. No credit card required. No usage anxiety.</p>
      </div>
      <div class="card green">
        <h4>✅ Open Models</h4>
        <p>Llama-3.3 70B rivals GPT-4 on code and math tasks — independently verified benchmarks.</p>
      </div>
      <div class="card green">
        <h4>✅ Simple Integration</h4>
        <p>OpenAI-compatible API — <code>groq.chat.completions.create()</code> uses the same interface as the OpenAI SDK.</p>
      </div>
    </div>
  </section>

  <!-- 09 PROMPT TIPS -->
  <section id="prompts">
    <h2><span class="sec-icon">✍️</span>Prompt Engineering Tips</h2>
    <hr class="sec-rule"/>
    <p style="color:var(--sub);margin-bottom:20px">Get better results from the AI engine by writing precise, context-rich prompts.</p>

    <table>
      <tr><th>❌ Vague Prompt</th><th>✅ Better Prompt</th></tr>
      <tr><td>sum the numbers</td><td>Sum column C from C2 to C200 where column A equals "Active"</td></tr>
      <tr><td>calculate interest</td><td>Monthly payment for a $250,000 loan at 7% annual rate over 30 years</td></tr>
      <tr><td>RSI formula</td><td>14-period RSI for closing prices in column B starting at B2, gain/loss in column D</td></tr>
      <tr><td>count something</td><td>Count unique customer names in column A where column D is not empty</td></tr>
      <tr><td>lookup value</td><td>Look up employee name in Sheet2 column A, return salary from column C, exact match</td></tr>
    </table>

    <div class="callout info">
      <span class="callout-icon">🌐</span>
      <div><strong>Arabic supported:</strong> You can write prompts in Arabic, English, or mixed. The AI will respond in the same language as your question and always return the formula in standard Excel syntax.</div>
    </div>
  </section>

  <!-- 10 INSTALLATION -->
  <section id="install">
    <h2><span class="sec-icon">📥</span>Installation</h2>
    <hr class="sec-rule"/>

    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-body">
          <h4>Download the manifest file</h4>
          <p>Get <code>manifest.xml</code> from your SniperSheet administrator or download it from the server at <code>/api/addin/manifest.xml</code>.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-body">
          <h4>Open Excel → Insert → Add-ins</h4>
          <p>Go to <strong>Insert</strong> tab → <strong>My Add-ins</strong> → <strong>Manage My Add-ins</strong> → <strong>Upload My Add-in</strong>.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-body">
          <h4>Upload manifest.xml</h4>
          <p>Browse to the downloaded <code>manifest.xml</code> and click <strong>Upload</strong>. Excel validates the manifest automatically.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-body">
          <h4>Open SniperSheet</h4>
          <p>Find <strong>SniperSheet: AI Formula Engine</strong> in the <strong>Home</strong> ribbon tab. Click to open the task pane.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">5</div>
        <div class="step-body">
          <h4>Start using AI formulas</h4>
          <p>Type your question in the Smart tab and press <strong>Ask</strong>. Your first formula is ready in under 2 seconds.</p>
        </div>
      </div>
    </div>

    <div class="callout tip">
      <span class="callout-icon">💻</span>
      <div><strong>Excel Desktop (Windows/Mac)</strong> is recommended for full functionality. Excel Online supports most features but may have limited access to the Office.js API for cell operations.</div>
    </div>
  </section>

  <!-- 11 FAQ -->
  <section id="faq">
    <h2><span class="sec-icon">❓</span>Frequently Asked Questions</h2>
    <hr class="sec-rule"/>

    <table>
      <tr><th>Question</th><th>Answer</th></tr>
      <tr><td><strong>Do I need my own API key?</strong></td><td>No. SniperSheet proxies all AI requests through its own server. You never need to register with Groq or provide any credentials.</td></tr>
      <tr><td><strong>Does it work in Iraq / Middle East?</strong></td><td>Yes. All AI requests go through Replit's US-based servers — no VPN or proxy is required on the user's side.</td></tr>
      <tr><td><strong>Can I use it in Excel Online?</strong></td><td>Yes, with some limitations. Excel Desktop is recommended for full Office.js API access, especially for cell-dimension tools.</td></tr>
      <tr><td><strong>Is my data sent to the AI?</strong></td><td>Only the text you type in the prompt box is sent. Cell contents are never transmitted unless you explicitly paste them into the prompt.</td></tr>
      <tr><td><strong>What if the formula is wrong?</strong></td><td>Check the confidence score. If below 75%, refine your prompt with more detail about your data layout and try again.</td></tr>
      <tr><td><strong>How many requests can I make?</strong></td><td>The free tier supports 30 requests/minute. For most Excel workflows this limit is never reached.</td></tr>
      <tr><td><strong>Does it support Arabic Excel functions?</strong></td><td>SniperSheet always outputs formulas in standard English Excel syntax (=VLOOKUP, =SUM, etc.) which works in all Excel localizations.</td></tr>
    </table>
  </section>

</main>
</div>

<footer>
  <strong>SniperSheet Official Guide</strong> — AI-Powered Excel Add-in<br/>
  Developed by: <strong>Mustafa Alsahlany</strong> · Software Engineer<br/>
  <span style="color:#475569;font-size:12px;margin-top:6px;display:block">
    All formulas generated are for reference purposes. Verify critical calculations before use in production environments.
  </span>
</footer>

<script>
  const links = document.querySelectorAll('aside a');
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        const a=document.querySelector('aside a[href="#'+e.target.id+'"]');
        if(a) a.classList.add('active');
      }
    });
  },{rootMargin:'-60px 0px -60% 0px'});
  sections.forEach(s=>observer.observe(s));
</script>
</body>
</html>`);
});

export default router;
