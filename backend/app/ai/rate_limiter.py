from __future__ import annotations

import asyncio
import time
from collections import deque


class RateLimiter:
    """Simple sliding-window rate limiter for Groq API calls."""

    def __init__(self, max_requests: int, window_seconds: float = 60.0) -> None:
        self._max_requests = max_requests
        self._window_seconds = window_seconds
        self._timestamps: deque[float] = deque()
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        async with self._lock:
            now = time.monotonic()
            self._evict_expired(now)

            if len(self._timestamps) >= self._max_requests:
                oldest = self._timestamps[0]
                wait_seconds = self._window_seconds - (now - oldest)
                if wait_seconds > 0:
                    await asyncio.sleep(wait_seconds)
                now = time.monotonic()
                self._evict_expired(now)

            self._timestamps.append(now)

    def _evict_expired(self, now: float) -> None:
        cutoff = now - self._window_seconds
        while self._timestamps and self._timestamps[0] <= cutoff:
            self._timestamps.popleft()
