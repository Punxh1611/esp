import React, { useState, useRef, useEffect } from "react";
import "./App.css";

/* ---------------------------------------------------------
   โครงงานคอมพิวเตอร์ ม.4/4
   อัปเดตเนื้อหาให้ตรงกับวงจรจริง: ESP32 + HC-SR04 (เซนเซอร์วัดระยะ) + LED
   Palette: #355872 (ink) · #F7F8F0 (paper) · #9CD5FF (accent) · #7AAACE (muted)
--------------------------------------------------------- */

const DETECT_DISTANCE_CM = 15; // ระยะที่ถือว่า "มีวัตถุ/คนอยู่ใกล้" ตรงกับค่าใน sketch.ino

const NAV_ITEMS = [
  { id: "structure", label: "สรุปเนื้อหา" },
  { id: "sensor", label: "จำลองระบบไฟอัตโนมัติ" },
  { id: "compare", label: "โครงสร้าง vs อัลกอริทึม" },
  { id: "members", label: "สมาชิกผู้จัดทำ" },
];

function useScrollTo() {
  return (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

function NavBar() {
  const scrollTo = useScrollTo();
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button onClick={() => scrollTo("top")} className="brand">
          <span className="brand-icon">🖥️</span>
          <span className="brand-name">โครงงานคอมพิวเตอร์ ม.4/4</span>
        </button>
        <nav className="nav-links">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => scrollTo(item.id)} className="nav-link">
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const scrollTo = useScrollTo();
  return (
    <section id="top" className="hero">
      <span className="badge">รายงานและสื่อการเรียนรู้ออนไลน์</span>
      <h1 className="hero-title">
        การวางแผนและออกแบบ
        <br />
        <span className="hero-title-accent">โครงงานคอมพิวเตอร์</span>
      </h1>
      <p className="hero-desc">
        ระบบควบคุมไฟอัตโนมัติด้วยเซนเซอร์วัดระยะอัลตราโซนิก (HC-SR04) บนบอร์ด ESP32
        พร้อมหน้าเว็บควบคุมและตรวจสอบสถานะแบบเรียลไทม์ จัดทำโดยกลุ่มนักเรียนชั้นมัธยมศึกษาปีที่ 4/4
      </p>
      <div className="hero-actions">
        <button onClick={() => scrollTo("sensor")} className="btn btn-primary">
          ลองจำลองระบบ
        </button>
        <button onClick={() => scrollTo("compare")} className="btn btn-secondary">
          ดูการเปรียบเทียบแนวคิด
        </button>
      </div>
    </section>
  );
}

/* ---------------- ตอนที่ 2: ระบบเซนเซอร์วัดระยะ + ไฟอัตโนมัติ ---------------- */

function SensorDemo() {
  const [distance, setDistance] = useState(57); // ค่าเริ่มต้นตรงกับ diagram.json (ultrasonic1 distance)
  const [autoMode, setAutoMode] = useState(true);
  const [manualLed, setManualLed] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const autoLed = distance <= DETECT_DISTANCE_CM;
  const ledOn = autoMode ? autoLed : manualLed;

  const handleSetLed = (state) => {
    setAutoMode(false);
    setManualLed(state);
  };

  const handleAuto = () => setAutoMode(true);

  const statusText = autoMode
    ? ledOn
      ? "ตรวจพบวัตถุในระยะใกล้ — เปิดไฟอัตโนมัติ"
      : "ไม่พบวัตถุในระยะตรวจจับ"
    : "ควบคุมด้วยมือผ่านหน้าเว็บ";

  return (
    <section id="sensor" className="section">
      <div className="container">
        <h2 className="section-title">ตอนที่ 2: ระบบควบคุมการเปิด–ปิดไฟอัตโนมัติ</h2>
        <p className="section-sub">
          กรณีศึกษาการแก้ปัญหาชีวิตประจำวันด้วยเซนเซอร์วัดระยะอัลตราโซนิก HC-SR04 บนบอร์ด ESP32
        </p>

        <div className="grid-2">
          {/* ปัญหา / วัตถุประสงค์ */}
          <div className="card">
            <div className="card-head warn">
              <span>⚠️</span>
              <h3>ปัญหาหลักที่พบ</h3>
            </div>
            <p className="card-text">
              การเปิดไฟทิ้งไว้เมื่อไม่มีคนอยู่ในห้อง ทำให้เกิดการสิ้นเปลืองพลังงานไฟฟ้าโดยไม่จำเป็น
            </p>
            <div className="divider" />
            <div className="card-head success">
              <span>◎</span>
              <h3>วัตถุประสงค์โครงงาน</h3>
            </div>
            <p className="card-text">
              เพื่อสร้างระบบควบคุมการเปิด–ปิดไฟอัตโนมัติด้วยเซนเซอร์วัดระยะ HC-SR04 (Ultrasonic Sensor)
              โดยตรวจจับวัตถุที่อยู่ในระยะไม่เกิน {DETECT_DISTANCE_CM} ซม. ผ่าน ESP32 พร้อมเปิดหน้าเว็บ
              ควบคุมและสลับโหมดอัตโนมัติ/มือได้แบบเรียลไทม์
            </p>
            <div className="callout">
              <span>💡</span>
              <p>
                <strong>ผลลัพธ์ที่คาดว่าจะได้รับ: </strong>
                ลดค่าใช้จ่ายด้านพลังงานไฟฟ้าได้ทันทีอย่างเป็นรูปธรรม และควบคุมไฟจากระยะไกลผ่านเว็บได้
              </p>
            </div>
          </div>

          {/* Demo */}
          <div className="card center">
            <h3 className="demo-title">ทดลองจำลองการทำงานระบบเซนเซอร์</h3>

            <div className={`led-box ${ledOn ? "on" : "off"}`}>
              <span className="bulb">💡</span>
              <span className="led-status">{ledOn ? "เปิดใช้งาน (ON)" : "ปิดใช้งาน (OFF)"}</span>
            </div>

            <div className="slider-block">
              <label htmlFor="distance-range" className="slider-label">
                จำลองระยะที่เซนเซอร์ HC-SR04 วัดได้: <strong>{distance} ซม.</strong>
              </label>
              <input
                id="distance-range"
                type="range"
                min="0"
                max="100"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                disabled={!autoMode}
                className="slider"
              />
              <div className="slider-hint">
                วัตถุเข้าใกล้ในระยะ ≤ {DETECT_DISTANCE_CM} ซม. → ไฟติดอัตโนมัติ
              </div>
            </div>

            <div className="btn-row">
              <button className="btn btn-on" onClick={() => handleSetLed(true)}>
                เปิดไฟ (ON)
              </button>
              <button className="btn btn-off" onClick={() => handleSetLed(false)}>
                ปิดไฟ (OFF)
              </button>
            </div>
            <div className="btn-row">
              <button className="btn btn-auto" onClick={handleAuto} disabled={autoMode}>
                กลับสู่โหมดอัตโนมัติ (เซนเซอร์)
              </button>
            </div>

            <p className="status-line">
              โหมด: {autoMode ? "อัตโนมัติ (ตรวจจับเซนเซอร์)" : "ควบคุมมือ (เว็บ)"} — {statusText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- โครงสร้าง vs อัลกอริทึม ---------------- */

function CompareSection() {
  return (
    <section id="compare" className="section">
      <div className="container">
        <h2 className="section-title">
          เปรียบเทียบ: การออกแบบโครงสร้าง <span className="muted-text">vs</span> อัลกอริทึม
        </h2>
        <p className="section-sub">
          ความแตกต่างระหว่าง Structural Design และ Algorithm Design ในขั้นตอนพัฒนาโครงงาน
        </p>

        <div className="grid-2">
          <div className="card">
            <span className="icon-box accent">🧩</span>
            <h3 className="card-title">การออกแบบโครงสร้าง</h3>
            <p className="eyebrow">STRUCTURAL DESIGN</p>
            <p className="card-text">
              เป็นการออกแบบ<strong>ภาพรวมของระบบทั้งหมด</strong> โดยแบ่งระบบออกเป็นส่วนย่อย ๆ (Modules)
              และกำหนดการทำงานร่วมกันอย่างเป็นระบบ
            </p>
            <div className="mini-panel">
              <p className="mini-label">ตัวอย่างโครงสร้างระบบ:</p>
              <div className="flow-row">
                <span className="pill">เซนเซอร์ HC-SR04</span>
                <span className="arrow">→</span>
                <span className="pill pill-accent">ESP32 (ประมวลผล + เว็บเซิร์ฟเวอร์)</span>
                <span className="arrow">→</span>
                <span className="pill">LED</span>
              </div>
            </div>
          </div>

          <div className="card">
            <span className="icon-box muted">🔀</span>
            <h3 className="card-title">การออกแบบอัลกอริทึม</h3>
            <p className="eyebrow">ALGORITHM DESIGN</p>
            <p className="card-text">
              เป็นการออกแบบ<strong>ลำดับขั้นตอนการทำงานเชิงตรรกะ</strong>แบบขั้นเป็นขั้นตอน (Step-by-step)
              ภายในแต่ละโมดูลอย่างละเอียด
            </p>
            <div className="mini-panel">
              <p className="mini-label">ตัวอย่างรหัสเทียม (Pseudocode):</p>
              <pre className="code-block">
{`distance = readUltrasonicCM()
IF (distance <= 15) THEN
    TurnOnLED()
ELSE
    TurnOffLED()
ENDIF`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- สมาชิกกลุ่มผู้จัดทำ ---------------- */

const MEMBERS = [
  {
    name: "น.ส. สุกัญญา ดวงชุ่มขึ้น",
  no: "10",
  icon: (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      style={{ width: '20px', height: '20px' }}
    >
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
  )
  },
  {
    name: "นาย วิชญ ใจงูเหลือ",
  no: "17",
  icon: (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      style={{ width: '20px', height: '20px' }}
    >
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
  )
  },
  {
    name: "นาย กิตติภณ ธนาภัทรโสภณ",
  no: "22",
  icon: (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      style={{ width: '20px', height: '20px' }}
    >
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
  )
  },
  {
    name: "น.ส. จุฬาลักษณ์ ชนพิมาย",
  no: "39",
  icon: (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      style={{ width: '20px', height: '20px' }}
    >
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
  )
  }
];

function Members() {
  return (
    <section id="members" className="section">
      <div className="container center-text">
        <h2 className="section-title">สมาชิกกลุ่มผู้จัดทำ</h2>
        <p className="section-sub">นักเรียนชั้นมัธยมศึกษาปีที่ 4/4</p>

        <div className="grid-4">
          {MEMBERS.map((m) => (
            <div key={m.no} className="member-card">
              <span className="member-avatar">{m.icon}</span>
              <p className="member-name">{m.name}</p>
              <p className="member-no">เลขที่ {m.no} · ชั้น ม.4/4</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>© 2026 การวางแผนและออกแบบโครงงานคอมพิวเตอร์ · ชั้นมัธยมศึกษาปีที่ 4/4</p>
    </footer>
  );
}

function App() {
  return (
    <div className="App">
      <NavBar />
      <Hero />
      <div className="hr" />
      <SensorDemo />
      <div className="hr" />
      <CompareSection />
      <div className="hr" />
      <Members />
      <Footer />
    </div>
  );
}

export default App;
