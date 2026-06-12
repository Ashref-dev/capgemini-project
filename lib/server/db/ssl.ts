function readBooleanEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]
    if (!value) continue

    const normalized = value.trim().toLowerCase()
    if (["1", "true", "yes", "on", "require"].includes(normalized)) return true
    if (["0", "false", "no", "off", "disable"].includes(normalized)) return false
  }

  return undefined
}

function isLocalDatabase(connectionString?: string) {
  if (!connectionString) return false

  try {
    const url = new URL(connectionString)
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
  } catch {
    return false
  }
}

export function resolvePgSsl(connectionString: string | undefined, ...envNames: string[]) {
  const explicit = readBooleanEnv(...envNames, "PGSSL", "DATABASE_SSL")
  if (explicit !== undefined) return explicit

  if (process.env.PGSSLMODE) {
    return process.env.PGSSLMODE.toLowerCase() !== "disable"
  }

  if (isLocalDatabase(connectionString)) {
    return false
  }

  return process.env.NODE_ENV === "production"
}