from abc import ABC, abstractmethod

class AIProvider(ABC):
    @abstractmethod
    def get_name(self) -> str:
        """Return the provider name (e.g., 'openai')."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Return True if API key is set."""
        pass

    @abstractmethod
    def chat(self, message: str) -> str | None:
        """
        Send message to AI. Return string reply or None if failed/empty.
        Should handle its own exceptions mostly, or let them bubble up
        if they are critical.
        """
        pass
