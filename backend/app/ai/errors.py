class LLMError(Exception):
    """Base class for LLM failures."""

    def __init__(self, message: str, *, code: str = "llm_error") -> None:
        super().__init__(message)
        self.message = message
        self.code = code


class LLMAuthError(LLMError):
    def __init__(self, message: str = "Invalid or missing Groq API key") -> None:
        super().__init__(message, code="llm_auth_error")


class LLMRateLimitError(LLMError):
    def __init__(self, message: str = "Groq rate limit exceeded") -> None:
        super().__init__(message, code="llm_rate_limit")


class LLMValidationError(LLMError):
    def __init__(self, message: str) -> None:
        super().__init__(message, code="llm_validation_error")


class LLMServiceError(LLMError):
    def __init__(self, message: str) -> None:
        super().__init__(message, code="llm_service_error")
