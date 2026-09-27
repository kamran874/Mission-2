# AC Control — WiFi IR blaster firmware

A standalone gadget that sits in front of the AC and reproduces what the
physical remote does over infrared. It does not touch the AC's internals or
its existing (Mevris) WiFi module at all — it's a separate, self-contained,
low-voltage device you build and place nearby.

Use this if the AC's built-in WiFi module works fine on your home network
but the manufacturer's app/cloud service (Mevris / Orient Smart) doesn't —
this sidesteps that service entirely.

## Why this approach

Orient's Ultron/Divine eComfort line uses the **Electra** IR protocol, which
is already implemented in a well-tested open-source library
([IRremoteESP8266](https://github.com/crankyoldgit/IRremoteESP8266)) — no
protocol reverse-engineering needed. `ir_blaster.ino` in this folder wraps
that library in a small local REST API that matches exactly what the
**AC Control** app (in the repo root) expects, so the two just work together
once this is flashed and running.

## Parts list

- An ESP8266 dev board — NodeMCU or Wemos D1 mini (~$3-5)
- An infrared LED (any 940nm IR LED, a few cents)
- A 100Ω resistor
- A micro-USB cable (to power and flash the board)
- Breadboard + jumper wires, or a small perfboard if you want it permanent

No AC teardown, no mains voltage, no soldering on the AC itself.

## Wiring

Simple direct-drive circuit — plenty of range for a blaster sitting a
meter or so from the AC's front receiver:

```
ESP8266 GPIO4 (D2)  ---[100Ω resistor]---  IR LED anode (+, longer leg)
IR LED cathode (-, shorter leg)  ---  ESP8266 GND
```

That's the whole circuit. If you want more range or want to bounce the
signal around a large room, add a small NPN transistor (e.g. 2N2222) as a
driver stage — ask if you get to that point and want the diagram for it.

## Software setup

1. Install the [Arduino IDE](https://www.arduino.cc/en/software) (2.x).
2. Add ESP8266 board support: File → Preferences → **Additional Boards
   Manager URLs** → add
   `https://arduino.esp8266.com/stable/package_esp8266com_index.json`, then
   Tools → Board → Boards Manager → install "esp8266".
3. Install libraries via Sketch → Include Library → Manage Libraries:
   - **IRremoteESP8266** (by David Conran / crankyoldgit)
   - **WiFiManager** (by tzapu)
   - **ArduinoJson** (by Benoit Blanchon) — version 7.x
4. Open `ir_blaster.ino` in the Arduino IDE.
5. Board settings: Tools → Board → "NodeMCU 1.0" (or "LOLIN(WEMOS) D1 R2 &
   mini", matching your board), Upload Speed 115200.
6. Plug the board in via USB, select the right port under Tools → Port, and
   click Upload.

## First boot — connecting it to your WiFi

On first boot (and any time after `/api/reset-wifi`), the board can't reach
your WiFi yet, so it opens its own hotspot: **`AC-Blaster-Setup`**.

1. On your phone, connect to that WiFi network.
2. A setup page should open automatically (if not, visit `192.168.4.1` in a
   browser).
3. Pick your home WiFi network, enter its password, save.
4. The board reboots and joins your home network. Check your router's
   connected-devices list for its new IP address.

## Using it with the app

Open the AC Control app → **Devices** → add a device with that IP address.
That's it — the app already speaks this board's API.

## Troubleshooting

- **AC doesn't respond to commands**: aim the IR LED directly at the AC's
  front receiver (usually a small dark dome near the display), within a
  meter or two, with a clear line of sight.
- **Board won't join WiFi**: only 2.4GHz networks are supported (ESP8266
  hardware limitation) — if your router broadcasts a combined 2.4/5GHz SSID,
  some routers let you split them; connect the blaster to the 2.4GHz one.
- **Need to switch it to a different WiFi network later**: hit
  `http://<its-ip>/api/reset-wifi`, or add a physical reset button wired to
  hold GPIO0 low on boot if you want a no-network way to trigger it.
