# AC Control

An installable, iPhone-friendly web app for controlling a WiFi-enabled air
conditioner (power, temperature, mode, fan speed, turbo/sleep/swing, and
on/off timers) directly over your home network — no manufacturer cloud
account required.

This was built for an Orient/Ultron AC whose stock **Mevris / e-Comfort**
app and WiFi module had stopped working. Rather than depending on that
cloud service, the app talks straight to a local HTTP API exposed by the
AC's WiFi module on your home WiFi.

## Why local control instead of the manufacturer app

Orient's Ultron/e-Comfort ACs ship with an ESP8266-based WiFi module running
Orient's **Mevris** cloud firmware. When that module's cloud connection
breaks (as reported by several owners), the stock app stops working
entirely, even though the AC itself is fine.

The community project
[OpenAC-ESP8266-Smart-AC](https://github.com/harryhassan/OpenAC-ESP8266-Smart-AC)
replaces that module's firmware with an open, local-only alternative that
exposes a simple REST API on your home network — no cloud, no account,
no dependency on a third-party service staying online. This app is a
control UI built against that same REST API (`/api/status`, `/api/power`,
`/api/temp`, `/api/mode`, `/api/fan`, `/api/turbo`, `/api/sleep`,
`/api/swing`, `/api/light`, `/api/timer`).

**Flashing that firmware is a one-time hardware step** (opening the AC's
WiFi module, wiring a USB-serial adapter, and reflashing it — see that
project's README for wiring and safety notes; it involves mains voltage, so
follow its safety guidelines exactly). Once the module runs open firmware
and reports a local IP address, this app can control it.

If your module already exposes a local status/control API compatible with
those endpoints (this or a similar firmware), you can skip straight to
using the app.

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
hosts/ports), the browser enforces CORS: the AC's firmware must respond
with an `Access-Control-Allow-Origin` header for the browser to accept the
response. If the browser console shows a CORS error, either add that header
to the firmware's HTTP responses, or sidestep the issue entirely by serving
this app's built `dist/` files from the same device/host as the AC API
(making every request same-origin).

## Development

```bash
npm install
npm run dev      # local dev server
npm run build     # type-check + production build
npm run lint      # oxlint
```

Built with React, TypeScript, Vite, Tailwind CSS, and vite-plugin-pwa.
