import { useRef, useState } from 'react'
import { Button, TextField, cn } from '../ui'

/**
 * Small property-side controls extracted from the Property · Receipts page:
 * a name-only create form (client/property folders) and a drag/drop PDF picker.
 */

/** Name-only create form for the property side. */
export function NameOnlyCreate({
  label,
  placeholder,
  pending,
  onCreate,
}: {
  label: string
  placeholder: string
  pending: boolean
  onCreate: (name: string) => void
}) {
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <div className="px-4 py-3">
        <Button sm variant="primary" onClick={() => setOpen(true)}>
          {label}
        </Button>
      </div>
    )
  }
  return (
    <div className="flex items-end gap-2 border-b border-border px-4 py-3">
      <TextField
        label={placeholder}
        wrapClassName="flex-1"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button
        sm
        variant="default"
        onClick={() => {
          setOpen(false)
          setName('')
        }}
      >
        Cancel
      </Button>
      <Button
        sm
        variant="accent"
        disabled={!name.trim() || pending}
        onClick={() => {
          onCreate(name.trim())
          setName('')
          setOpen(false)
        }}
      >
        {pending ? 'Adding…' : 'Add'}
      </Button>
    </div>
  )
}

/** Compact drag/drop + file-picker that captures the chosen PDF (File). */
export function UploadZone({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  function handle(files: FileList | null) {
    if (files && files[0]) onFile(files[0])
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        handle(e.dataTransfer.files)
      }}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-6 text-center transition',
        over ? 'border-primary bg-primary-soft' : 'border-border bg-surface-2',
      )}
    >
      <p className="text-sm font-medium text-text">Drop a receipt PDF here</p>
      <p className="mt-0.5 text-xs text-muted">or</p>
      <Button variant="primary" sm className="mt-2" onClick={() => inputRef.current?.click()}>
        Choose file
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
    </div>
  )
}
