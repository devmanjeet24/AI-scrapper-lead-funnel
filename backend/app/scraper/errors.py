class ScraperError(Exception):
    """Base class for scraper failures."""

    def __init__(self, message: str, *, code: str = "scraper_error") -> None:
        super().__init__(message)
        self.message = message
        self.code = code


class InvalidUrlError(ScraperError):
    def __init__(self, message: str) -> None:
        super().__init__(message, code="invalid_url")


class BrowserLaunchError(ScraperError):
    def __init__(self, message: str) -> None:
        super().__init__(message, code="browser_launch_failed")


class ScraperTimeoutError(ScraperError):
    def __init__(self, message: str) -> None:
        super().__init__(message, code="timeout")


class NetworkError(ScraperError):
    def __init__(self, message: str) -> None:
        super().__init__(message, code="network_error")
