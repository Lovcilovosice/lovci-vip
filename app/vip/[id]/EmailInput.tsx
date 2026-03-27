'use client'

import { useState } from 'react'

type EmailInputProps = {
  className: string
}

export function EmailInput({ className }: EmailInputProps) {
  const [value, setValue] = useState('')

  return (
    <input
      name="email"
      type="email"
      required
      value={value}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      inputMode="email"
      onChange={(event) => setValue(event.target.value.toLowerCase())}
      className={className}
    />
  )
}
