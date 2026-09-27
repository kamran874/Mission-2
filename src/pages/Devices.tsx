import { useState } from 'react'
import { useAc } from '../store'

export function Devices() {
  const ac = useAc()
  const [name, setName] = useState('')
  const [host, setHost] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const startEdit = (id: string) => {
    const device = ac.devices.find((d) => d.id === id)
    if (!device) return
    setEditingId(id)
    setName(device.name)
    setHost(device.host)
  }

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setHost('')
  }

  const submit = () => {
    if (!host.trim()) return
    if (editingId) {
      ac.updateDevice(editingId, { name: name.trim() || 'AC', host: host.trim() })
    } else {
      ac.addDevice(name, host)
    }
    resetForm()
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pb-6 pt-4">
      <h1 className="text-lg font-semibold">Devices</h1>

      <div className="flex flex-col gap-3 rounded-2xl bg-[color:var(--color-surface)] p-4">
        <h2 className="text-sm font-medium text-white/70">{editingId ? 'Edit device' : 'Add your AC'}</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Bedroom AC)"
          className="rounded-xl bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/30"
        />
        <input
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="Device address, e.g. 192.168.1.42"
          className="rounded-xl bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/30"
          autoCapitalize="none"
          autoCorrect="off"
        />
        <div className="flex gap-2">
          <button
            onClick={submit}
            disabled={!host.trim()}
            className="flex-1 rounded-xl bg-[color:var(--color-brand)] py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {editingId ? 'Save' : 'Add device'}
          </button>
          {editingId && (
            <button onClick={resetForm} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm">
              Cancel
            </button>
          )}
        </div>
      </div>

      {ac.devices.length > 0 && (
        <div className="flex flex-col gap-2">
          {ac.devices.map((d) => (
            <div
              key={d.id}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                d.id === ac.activeDevice?.id ? 'border-[color:var(--color-brand)] bg-[color:var(--color-brand)]/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <button className="flex-1 text-left" onClick={() => ac.selectDevice(d.id)}>
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-white/50">{d.host}</div>
              </button>
              <div className="flex gap-1">
                <button onClick={() => startEdit(d.id)} className="rounded-lg px-2 py-1 text-xs text-white/60">
                  Edit
                </button>
                <button
                  onClick={() => ac.removeDevice(d.id)}
                  className="rounded-lg px-2 py-1 text-xs text-rose-300"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <details className="rounded-2xl bg-white/5 p-4 text-sm text-white/70">
        <summary className="cursor-pointer font-medium text-white">Before this works: how to find your AC's address</summary>
        <div className="mt-3 flex flex-col gap-2">
          <p>
            This app talks directly to your AC's WiFi module over your home network — it doesn't go through the
            manufacturer's cloud app, so a broken Mevris/e-Comfort login won't affect it.
          </p>
          <p>It needs a device on your WiFi that exposes a local status/control API. If you don't have one yet:</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>
              Build the WiFi IR blaster in <code>firmware/</code> — a small standalone gadget you place in front of
              the AC, no access to the AC itself needed. See <code>firmware/README.md</code> for the parts list and
              setup.
            </li>
            <li>Check your router's connected-devices list for the blaster and note its IP address.</li>
            <li>Enter that IP address above (e.g. <code>192.168.1.42</code>) — no need for http:// or a port.</li>
          </ol>
          <p className="text-white/50">
            Your phone and the AC must be on the same WiFi network. Since the AC serves plain HTTP, install this app
            from a page loaded over HTTP on that same network (not an https:// link) so Safari doesn't block the
            requests as mixed content.
          </p>
        </div>
      </details>
    </div>
  )
}
