export function DashboardAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="atmosphere-base absolute inset-0" />
      <div className="atmosphere-mesh absolute inset-0" />
      <div className="atmosphere-dots absolute inset-0" />
      <div className="atmosphere-orb atmosphere-orb-green" />
      <div className="atmosphere-orb atmosphere-orb-teal" />
      <div className="atmosphere-orb atmosphere-orb-mist" />
    </div>
  )
}
