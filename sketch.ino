#include <WiFi.h>
#include <WebServer.h>

// Wokwi ให้ใช้ WiFi จำลองนี้ได้ฟรี ไม่ต้องใส่รหัสผ่าน
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// ขา GPIO ที่ใช้
const int trigPin = 5;   // ขา TRIG ของ HC-SR04
const int echoPin = 18;  // ขา ECHO ของ HC-SR04
const int ledPin  = 14;  // ขาไฟ LED

// ระยะที่ถือว่า "มีของ/คนเดินผ่าน" (หน่วย: เซนติเมตร)
const float DETECT_DISTANCE_CM = 15.0;

WebServer server(80);

bool ledState  = false;  // สถานะไฟปัจจุบัน (true = ติด)
bool autoMode  = true;   // true = ให้เซนเซอร์ควบคุมอัตโนมัติ, false = ควบคุมจากเว็บ
float lastDistance = 999;

// ---------- อ่านระยะจากเซนเซอร์ ----------
float readDistanceCM() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000); // timeout 30ms
  if (duration == 0) return 999.0; // ไม่พบวัตถุในระยะ
  return duration * 0.0343 / 2.0;  // แปลงเวลาเป็นระยะทาง (ซม.)
}

void setLED(bool state) {
  ledState = state;
  digitalWrite(ledPin, ledState ? HIGH : LOW);
}

// ---------- หน้าเว็บแสดงผล ----------
String htmlPage() {
  String html = R"HTML(
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ระบบเซนเซอร์ควบคุมไฟ</title>
<style>
  body { font-family:'Segoe UI',sans-serif; background:#0f172a; color:#e2e8f0; text-align:center; padding:40px; }
  h1 { font-size:20px; margin-bottom:30px; }
  .box { width:220px; height:220px; border-radius:20px; margin:0 auto 30px; display:flex; align-items:center;
         justify-content:center; flex-direction:column; border:2px solid #334155; transition:.3s; }
  .on  { background:#065f46; border-color:#10b981; box-shadow:0 0 40px #10b98188; }
  .off { background:#1e293b; }
  .status-text { font-size:18px; font-weight:bold; margin-top:10px; }
  button { padding:12px 22px; margin:8px; border:none; border-radius:10px; font-size:15px; cursor:pointer; }
  .btn-on  { background:#10b981; color:#fff; }
  .btn-off { background:#475569; color:#fff; }
  .btn-auto{ background:#3b82f6; color:#fff; }
  .mode { margin-top:18px; font-size:13px; color:#94a3b8; }
</style>
</head>
<body>
  <h1>ระบบจำลองเซนเซอร์ตรวจจับ + ควบคุมไฟผ่านเว็บ</h1>
  <div id="box" class="box off">
    <div style="font-size:50px;">&#128161;</div>
    <div id="statusText" class="status-text">กำลังโหลด...</div>
  </div>

  <div>
    <button class="btn-on"  onclick="setLed(true)">เปิดไฟ (ON)</button>
    <button class="btn-off" onclick="setLed(false)">ปิดไฟ (OFF)</button>
  </div>
  <div>
    <button class="btn-auto" onclick="setAuto()">กลับสู่โหมดอัตโนมัติ (เซนเซอร์)</button>
  </div>
  <div class="mode" id="modeText"></div>

<script>
async function refresh() {
  try {
    const res = await fetch('/state');
    const data = await res.json();
    const box = document.getElementById('box');
    const statusText = document.getElementById('statusText');
    const modeText = document.getElementById('modeText');
    if (data.led) {
      box.className = 'box on';
      statusText.innerText = 'ไฟติด (ON)';
    } else {
      box.className = 'box off';
      statusText.innerText = 'ไฟดับ (OFF)';
    }
    modeText.innerText = 'โหมด: ' + (data.auto ? 'อัตโนมัติ (ตรวจจับเซนเซอร์)' : 'ควบคุมมือ (เว็บ)')
                        + ' | ระยะที่วัดได้: ' + data.distance.toFixed(1) + ' ซม.';
  } catch (e) { console.log(e); }
}
async function setLed(state) {
  await fetch('/led?state=' + (state ? '1' : '0'));
  refresh();
}
async function setAuto() {
  await fetch('/auto');
  refresh();
}
setInterval(refresh, 1000);
refresh();
</script>
</body>
</html>
)HTML";
  return html;
}

// ---------- Route handlers ----------
void handleRoot() {
  server.send(200, "text/html", htmlPage());
}

void handleState() {
  String json = "{";
  json += "\"led\":" + String(ledState ? "true" : "false") + ",";
  json += "\"auto\":" + String(autoMode ? "true" : "false") + ",";
  json += "\"distance\":" + String(lastDistance);
  json += "}";
  server.send(200, "application/json", json);
}

void handleLed() {
  if (server.hasArg("state")) {
    autoMode = false; // ผู้ใช้กดควบคุมเองผ่านเว็บ -> ปิดโหมดอัตโนมัติชั่วคราว
    setLED(server.arg("state") == "1");
  }
  server.send(200, "text/plain", "OK");
}

void handleAuto() {
  autoMode = true; // กลับไปให้เซนเซอร์ควบคุมไฟอัตโนมัติ
  server.send(200, "text/plain", "OK");
}

void setup() {
  Serial.begin(115200);
  delay(1000); // ให้เวลาพอร์ต Serial พร้อมก่อนพิมพ์

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  Serial.println("===== เริ่มทดสอบระบบ =====");

  WiFi.begin(ssid, password);
  Serial.print("กำลังเชื่อมต่อ WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("เชื่อมต่อสำเร็จ! เปิดเว็บที่ IP: ");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/state", handleState);
  server.on("/led", handleLed);
  server.on("/auto", handleAuto);
  server.begin();
}

void loop() {
  server.handleClient();

  lastDistance = readDistanceCM();

  if (autoMode) {
    bool detected = (lastDistance <= DETECT_DISTANCE_CM);
    setLED(detected); // มีของ/คนผ่าน -> ไฟติด, ไม่มี -> ไฟดับ
  }

  Serial.print("ระยะที่วัดได้: ");
  Serial.print(lastDistance);
  Serial.print(" ซม.  |  สถานะไฟ: ");
  Serial.println(ledState ? "ติด (ON)" : "ดับ (OFF)");

  delay(150); // หน่วงเวลาอ่านค่าเซนเซอร์
}
