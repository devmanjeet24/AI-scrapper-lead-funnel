interface SettingsPageHeaderProps {
  appEnv?: string
}

export function SettingsPageHeader({ appEnv }: SettingsPageHeaderProps) {
  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Settings & Integrations
      </h1>
      <p className="mt-1 text-sm text-muted">
        Manage connected services, monitor system health, and review environment configuration
        {appEnv ? ` · ${appEnv}` : ''}.
      </p>
    </header>
  )
}
