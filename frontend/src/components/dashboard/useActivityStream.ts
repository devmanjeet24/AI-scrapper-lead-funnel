import { formatDistanceToNow } from 'date-fns'
import { useEffect, useRef, useState } from 'react'

import { ACTIVITY_POOL, type ActivityEvent } from './dashboard-data'

let eventCounter = 0

function createEvent(source: (typeof ACTIVITY_POOL)[number]): ActivityEvent {
  eventCounter += 1
  return {
    ...source,
    id: `event-${eventCounter}`,
    time: formatDistanceToNow(new Date(), { addSuffix: true }),
  }
}

export function useActivityStream(limit = 8) {
  const [events, setEvents] = useState<ActivityEvent[]>(() => [
    createEvent(ACTIVITY_POOL[0]),
    createEvent(ACTIVITY_POOL[1]),
    createEvent(ACTIVITY_POOL[2]),
  ])
  const poolIndex = useRef(3)

  useEffect(() => {
    const interval = window.setInterval(() => {
      const source = ACTIVITY_POOL[poolIndex.current % ACTIVITY_POOL.length]
      poolIndex.current += 1
      const next = createEvent(source)
      setEvents((prev) => [next, ...prev].slice(0, limit))
    }, 3200)

    return () => window.clearInterval(interval)
  }, [limit])

  return events
}
