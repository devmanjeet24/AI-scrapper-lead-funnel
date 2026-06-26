interface RoutePlaceholderProps {
  name: string
}

export function RoutePlaceholder({ name }: RoutePlaceholderProps) {
  return <div data-route-placeholder={name} hidden />
}
