// AC Control — standalone WiFi IR blaster
//
// Stands in front of the AC (no access to the AC's internals, no soldering
// on the unit itself) and reproduces what the physical remote does over IR,
// using the Electra protocol that Orient's Ultron/Divine eComfort line uses.
// Exposes the same local REST API the AC Control web app already expects
// (see src/lib/acApi.ts in the parent repo), so once this is flashed and on
// your WiFi, no changes are needed on the app side — just enter this board's
// IP address in the app's Devices tab.
//
// Board: any ESP8266 (NodeMCU / Wemos D1 mini) or ESP32.
// Libraries (install via Arduino IDE Library Manager):
//   - IRremoteESP8266   by David Conran (crankyoldgit)
//   - WiFiManager       by tzapu
//   - ArduinoJson       by Benoit Blanchon
//
// Wiring: see firmware/README.md for the parts list and IR LED circuit.

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>
#include <IRremoteESP8266.h>
#include <ir_Electra.h>
#include <ArduinoJson.h>

// GPIO4 == "D2" on a NodeMCU/Wemos D1 mini.
const uint16_t kIrLedPin = 4;

IRElectraAc ac(kIrLedPin);
ESP8266WebServer server(80);

struct AcState {
  bool power = false;
  uint8_t temp = 24;
  uint8_t mode = kElectraAcCool;
  uint8_t fan = kElectraAcFanAuto;
  bool turbo = false;
  bool quiet = false;   // shown to the app as "sleep" — Electra has no distinct sleep bit
  bool swingV = false;
  bool swingH = false;
};

AcState state;

bool timerActive = false;
String timerAction = "off";
unsigned long timerFireAtMs = 0;

const uint8_t kMinTemp = 16;
const uint8_t kMaxTemp = 30;

void applyAndSend() {
  ac.begin();
  ac.setPower(state.power);
  ac.setMode(state.mode);
  ac.setTemp(state.temp);
  ac.setFan(state.fan);
  ac.setTurbo(state.turbo);
  ac.setQuiet(state.quiet);
  ac.setSwingV(state.swingV);
  ac.setSwingH(state.swingH);
  ac.send();
}

String modeToString(uint8_t mode) {
  switch (mode) {
    case kElectraAcCool: return "cool";
    case kElectraAcDry: return "dry";
    case kElectraAcHeat: return "heat";
    case kElectraAcFan: return "fan";
    default: return "auto";
  }
}

uint8_t modeFromString(const String &s) {
  if (s == "cool") return kElectraAcCool;
  if (s == "dry") return kElectraAcDry;
  if (s == "heat") return kElectraAcHeat;
  if (s == "fan") return kElectraAcFan;
  return kElectraAcAuto;
}

String fanToString(uint8_t fan) {
  switch (fan) {
    case kElectraAcFanLow: return "low";
    case kElectraAcFanMed: return "medium";
    case kElectraAcFanHigh: return "high";
    default: return "auto";
  }
}

uint8_t fanFromString(const String &s) {
  if (s == "low") return kElectraAcFanLow;
  if (s == "medium") return kElectraAcFanMed;
  if (s == "high") return kElectraAcFanHigh;
  return kElectraAcFanAuto;
}

void sendCors() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
}

void sendStatus() {
  JsonDocument doc;
  doc["power"] = state.power;
  doc["targetTemp"] = state.temp;
  doc["mode"] = modeToString(state.mode);
  doc["fan"] = fanToString(state.fan);
  doc["turbo"] = state.turbo;
  doc["sleep"] = state.quiet;
  doc["hSwing"] = state.swingH;
  doc["vSwing"] = state.swingV;
  doc["timerActive"] = timerActive;
  doc["timerAction"] = timerAction;
  doc["timerRemainingSeconds"] = timerActive ? (timerFireAtMs - millis()) / 1000 : 0;

  String body;
  serializeJson(doc, body);
  sendCors();
  server.send(200, "application/json", body);
}

void handleStatus() { sendStatus(); }

void handlePower() {
  String set = server.arg("set");
  if (set == "on") state.power = true;
  else if (set == "off") state.power = false;
  else state.power = !state.power;
  applyAndSend();
  sendStatus();
}

void handleTemp() {
  String set = server.arg("set");
  if (set == "up") state.temp = min<uint8_t>(kMaxTemp, state.temp + 1);
  else if (set == "down") state.temp = max<uint8_t>(kMinTemp, state.temp - 1);
  else if (set.length() > 0) {
    int v = set.toInt();
    state.temp = constrain(v, kMinTemp, kMaxTemp);
  }
  applyAndSend();
  sendStatus();
}

void handleMode() {
  state.mode = modeFromString(server.arg("set"));
  applyAndSend();
  sendStatus();
}

void handleFan() {
  state.fan = fanFromString(server.arg("set"));
  applyAndSend();
  sendStatus();
}

void handleTurbo() {
  String set = server.arg("set");
  if (set == "on") state.turbo = true;
  else if (set == "off") state.turbo = false;
  else state.turbo = !state.turbo;
  applyAndSend();
  sendStatus();
}

void handleSleep() {
  String set = server.arg("set");
  if (set == "on") state.quiet = true;
  else if (set == "off") state.quiet = false;
  else state.quiet = !state.quiet;
  applyAndSend();
  sendStatus();
}

void handleSwing() {
  String type = server.arg("type");
  if (type == "h") state.swingH = !state.swingH;
  else state.swingV = !state.swingV;
  applyAndSend();
  sendStatus();
}

void handleLight() {
  ac.begin();
  ac.setLightToggle(true);
  ac.send();
  sendStatus();
}

void handleTimer() {
  if (server.hasArg("cancel")) {
    timerActive = false;
    sendStatus();
    return;
  }
  if (server.hasArg("start")) {
    if (timerFireAtMs > millis()) {
      timerActive = true;
    }
    sendStatus();
    return;
  }
  if (server.hasArg("action") && server.hasArg("minutes")) {
    timerAction = server.arg("action");
    unsigned long minutes = server.arg("minutes").toInt();
    timerFireAtMs = millis() + minutes * 60000UL;
  }
  sendStatus();
}

void handleResetWifi() {
  sendCors();
  server.send(200, "text/plain", "Resetting WiFi settings, rebooting...");
  WiFiManager wm;
  wm.resetSettings();
  delay(500);
  ESP.restart();
}

void handleNotFound() {
  sendCors();
  server.send(404, "text/plain", "Not found");
}

void setupRoutes() {
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/power", HTTP_GET, handlePower);
  server.on("/api/temp", HTTP_GET, handleTemp);
  server.on("/api/mode", HTTP_GET, handleMode);
  server.on("/api/fan", HTTP_GET, handleFan);
  server.on("/api/turbo", HTTP_GET, handleTurbo);
  server.on("/api/sleep", HTTP_GET, handleSleep);
  server.on("/api/swing", HTTP_GET, handleSwing);
  server.on("/api/light", HTTP_GET, handleLight);
  server.on("/api/timer", HTTP_GET, handleTimer);
  server.on("/api/reset-wifi", HTTP_GET, handleResetWifi);
  server.onNotFound(handleNotFound);
}

void setup() {
  Serial.begin(115200);

  WiFiManager wm;
  // First boot (or after /api/reset-wifi) opens this hotspot; connect a
  // phone/laptop to it and a setup page pops up to pick your home WiFi.
  wm.setConfigPortalTimeout(180);
  bool connected = wm.autoConnect("AC-Blaster-Setup");
  if (!connected) {
    Serial.println("WiFi setup timed out, rebooting");
    ESP.restart();
  }

  Serial.print("Connected, IP: ");
  Serial.println(WiFi.localIP());

  ac.begin();
  setupRoutes();
  server.begin();
}

void loop() {
  server.handleClient();

  if (timerActive && millis() >= timerFireAtMs) {
    timerActive = false;
    state.power = (timerAction == "on");
    applyAndSend();
  }
}
