# AC Control

An installable, iPhone-friendly web app for controlling a WiFi-enabled air
conditioner (power, temperature, mode, fan speed, turbo/sleep/swing, and
on/off timers) directly over your home network — no manufacturer cloud
account required.

This was built for an Orient Ultron/Divine eComfort AC whose stock
**Mevris** app and cloud service never worked — login and signup fail, a
widely-reported, ongoing problem with Orient's servers rather than anything
specific to one AC or account. Rather than depending on that cloud service,
this app talks to a small local device on your own WiFi.

## Why local control instead of the manufacturer app

Orient's Ultron/Divine eComfort ACs ship with an ESP8266-based WiFi module
that talks to Orient's **Mevris** cloud. When that cloud service is down —
which, going by app-store reviews and community reports, has been the case
for a long time — the stock app stops working entirely, even though the AC
and its WiFi module are both fine.

`firmware/` in this repo has the fix that needs no access to the AC at all:
a standalone **WiFi IR blaster** — a ~$5 ESP8266 board and an IR LED, built
separately and placed in front of the AC. It reproduces what the physical
remote does over infrared (Orient's Ultron/Divine line uses the Electra IR
protocol, already supported by a well-tested open-source library — no
reverse-engineering needed) and exposes a local REST API that this app
talks to directly (`/api/status`, `/api/power`, `/api/temp`, `/api/mode`,
`/api/fan`, `/api/turbo`, `/api/sleep`, `/api/swing`, `/api/light`,
`/api/timer`). No cloud, no account, no opening the AC. See
`firmware/README.md` for the parts list, wiring, and flashing steps.

If you'd rather modify the AC's existing WiFi module instead of adding a
separate device, the community project
[OpenAC-ESP8266-Smart-AC](https://github.com/harryhassan/OpenAC-ESP8266-Smart-AC)
replaces that module's firmware with the same kind of local REST API — more
invasive (opening the unit, reflashing the existing board near mains
voltage) but avoids adding new hardware. This app works with either.

## Using the app

1. Find the AC WiFi module's IP address (check your router's connected
   devices list, or the module's own setup page).
2. Open the app, go to **Devices**, and add the AC with that IP address
   (e.g. `192.168.1.42`).
3. Switch to **Control** to toggle power, adjust temperature, change mode
   and fan speed, or set timers.

The app polls the device every few seconds and shows a connection status
pill (connecting / connected / offline) so it's obvious when the AC drops
off the network.

### Important: HTTP, not HTTPS

The AC's local API is plain HTTP. If you open this app from an `https://`
page (like a GitHub Pages deployment), Safari/Chrome will block requests to
the AC as mixed content. Instead, run and install the app from your own
network over plain HTTP:

```bash
npm install
npm run dev -- --host
```

Then, on your iPhone (same WiFi), open `http://<your-computer's-LAN-IP>:5173`
in Safari and use **Share → Add to Home Screen** to install it like a native
app. For a more permanent setup, `npm run build` and serve the `dist/`
folder from something always-on on your LAN (a Raspberry Pi, a home server,
or even the ESP8266 module's own flash storage).

### If requests fail with a CORS error

Because this app and the AC's API run on different origins (different
hosts/ports), the browser enforces CORS: the device's firmware must respond
with an `Access-Control-Allow-Origin` header for the browser to accept the
response. The IR blaster firmware in `firmware/` already sends this header
on every response. If you're using different firmware and see a CORS error
in the browser console, either add that header to it, or sidestep the issue
entirely by serving this app's built `dist/` files from the same device/host
as the AC API (making every request same-origin).

## Development

```bash
npm install
npm run dev      # local dev server
npm run build     # type-check + production build
npm run lint      # oxlint
```

Built with React, TypeScript, Vite, Tailwind CSS, and vite-plugin-pwa.
