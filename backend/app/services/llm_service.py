"""LLM provider service with fallback support."""

from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
import asyncio

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain.schema import BaseMessage, HumanMessage, SystemMessage
from langchain.callbacks.base import BaseCallbackHandler
from loguru import logger

from app.core.config import settings


class LLMProvider(str, Enum):
    """Supported LLM providers."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    HUGGINGFACE = "huggingface"
    LOCAL = "local"


class LLMError(Exception):
    """Custom exception for LLM-related errors."""
    pass


class ProgressCallbackHandler(BaseCallbackHandler):
    """Callback handler for LLM progress tracking."""
    
    def __init__(self, task_id: str, websocket_manager=None):
        super().__init__()
        self.task_id = task_id
        self.websocket_manager = websocket_manager
        self.token_count = 0
    
    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        """Called when a new token is generated."""
        self.token_count += 1
        if self.websocket_manager and self.token_count % 10 == 0:
            # Send progress update every 10 tokens
            asyncio.create_task(
                self.websocket_manager.send_json_to_room(
                    {"type": "token_progress", "task_id": self.task_id, "tokens": self.token_count},
                    f"book_{self.task_id}"
                )
            )


class LLMService:
    """LLM service with provider fallback and configuration management."""
    
    def __init__(self):
        self.providers: Dict[LLMProvider, Any] = {}
        self.provider_health: Dict[LLMProvider, bool] = {}
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize available LLM providers."""
        
        # OpenAI
        if settings.OPENAI_API_KEY:
            try:
                self.providers[LLMProvider.OPENAI] = ChatOpenAI(
                    api_key=settings.OPENAI_API_KEY,
                    model=settings.OPENAI_MODEL,
                    base_url=settings.OPENAI_BASE_URL,
                    temperature=0.7,
                    max_tokens=4000,
                    timeout=30,
                )
                self.provider_health[LLMProvider.OPENAI] = True
                logger.info("✅ OpenAI provider initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize OpenAI: {e}")
                self.provider_health[LLMProvider.OPENAI] = False
        
        # Anthropic
        if settings.ANTHROPIC_API_KEY:
            try:
                self.providers[LLMProvider.ANTHROPIC] = ChatAnthropic(
                    api_key=settings.ANTHROPIC_API_KEY,
                    model=settings.ANTHROPIC_MODEL,
                    temperature=0.7,
                    max_tokens=4000,
                    timeout=30,
                )
                self.provider_health[LLMProvider.ANTHROPIC] = True
                logger.info("✅ Anthropic provider initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Anthropic: {e}")
                self.provider_health[LLMProvider.ANTHROPIC] = False
        
        if not self.providers:
            raise LLMError("No LLM providers available. Please configure at least one provider.")
        
        logger.info(f"Initialized {len(self.providers)} LLM providers")
    
    def get_available_providers(self) -> List[LLMProvider]:
        """Get list of available and healthy providers."""
        return [provider for provider, healthy in self.provider_health.items() if healthy]
    
    def get_provider(self, preferred_provider: Optional[LLMProvider] = None) -> Tuple[LLMProvider, Any]:
        """Get a working LLM provider with fallback logic."""
        
        available_providers = self.get_available_providers()
        if not available_providers:
            raise LLMError("No healthy LLM providers available")
        
        # Try preferred provider first
        if preferred_provider and preferred_provider in available_providers:
            return preferred_provider, self.providers[preferred_provider]
        
        # Fallback order: OpenAI -> Anthropic -> others
        fallback_order = [LLMProvider.OPENAI, LLMProvider.ANTHROPIC, LLMProvider.HUGGINGFACE, LLMProvider.LOCAL]
        
        for provider in fallback_order:
            if provider in available_providers:
                return provider, self.providers[provider]
        
        # Last resort: use any available provider
        provider = available_providers[0]
        return provider, self.providers[provider]
    
    async def generate_completion(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        preferred_provider: Optional[LLMProvider] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        callback_handler: Optional[BaseCallbackHandler] = None,
    ) -> Dict[str, Any]:
        """Generate completion with automatic fallback."""
        
        messages = []
        if system_message:
            messages.append(SystemMessage(content=system_message))
        messages.append(HumanMessage(content=prompt))
        
        available_providers = self.get_available_providers()
        last_error = None
        
        # Try preferred provider first, then fallback
        providers_to_try = []
        if preferred_provider and preferred_provider in available_providers:
            providers_to_try.append(preferred_provider)
        
        # Add remaining providers
        for provider in available_providers:
            if provider not in providers_to_try:
                providers_to_try.append(provider)
        
        for provider_name in providers_to_try:
            try:
                provider = self.providers[provider_name]
                
                # Configure provider for this request
                if temperature is not None:
                    provider.temperature = temperature
                if max_tokens is not None:
                    provider.max_tokens = max_tokens
                
                # Add callback if provided
                callbacks = [callback_handler] if callback_handler else []
                
                logger.info(f"Generating completion with {provider_name}")
                result = await provider.ainvoke(messages, callbacks=callbacks)
                
                return {
                    "content": result.content,
                    "provider": provider_name.value,
                    "model": getattr(provider, 'model_name', 'unknown'),
                    "tokens_used": getattr(result, 'usage', {}).get('total_tokens', 0),
                }
            
            except Exception as e:
                last_error = e
                logger.warning(f"Provider {provider_name} failed: {e}")
                self.provider_health[provider_name] = False
                
                # Try to reinitialize the provider
                await self._reinitialize_provider(provider_name)
        
        raise LLMError(f"All providers failed. Last error: {last_error}")
    
    async def _reinitialize_provider(self, provider: LLMProvider):
        """Try to reinitialize a failed provider."""
        try:
            await asyncio.sleep(1)  # Brief delay before retry
            
            if provider == LLMProvider.OPENAI and settings.OPENAI_API_KEY:
                self.providers[provider] = ChatOpenAI(
                    api_key=settings.OPENAI_API_KEY,
                    model=settings.OPENAI_MODEL,
                    temperature=0.7,
                    max_tokens=4000,
                )
                self.provider_health[provider] = True
                logger.info(f"✅ Reinitialized {provider}")
            
            elif provider == LLMProvider.ANTHROPIC and settings.ANTHROPIC_API_KEY:
                self.providers[provider] = ChatAnthropic(
                    api_key=settings.ANTHROPIC_API_KEY,
                    model=settings.ANTHROPIC_MODEL,
                    temperature=0.7,
                    max_tokens=4000,
                )
                self.provider_health[provider] = True
                logger.info(f"✅ Reinitialized {provider}")
        
        except Exception as e:
            logger.error(f"❌ Failed to reinitialize {provider}: {e}")
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on all providers."""
        
        health_results = {}
        
        for provider_name, provider in self.providers.items():
            try:
                # Send a simple test message
                result = await provider.ainvoke([HumanMessage(content="Hello")])
                health_results[provider_name.value] = {
                    "status": "healthy",
                    "model": getattr(provider, 'model_name', 'unknown'),
                    "response_preview": result.content[:50] + "..." if len(result.content) > 50 else result.content,
                }
                self.provider_health[provider_name] = True
            
            except Exception as e:
                health_results[provider_name.value] = {
                    "status": "unhealthy",
                    "error": str(e),
                }
                self.provider_health[provider_name] = False
        
        return {
            "providers": health_results,
            "healthy_count": sum(1 for h in self.provider_health.values() if h),
            "total_count": len(self.providers),
        }
    
    def get_provider_stats(self) -> Dict[str, Any]:
        """Get provider statistics and configuration."""
        
        stats = {
            "available_providers": list(self.providers.keys()),
            "healthy_providers": self.get_available_providers(),
            "provider_configs": {},
        }
        
        for provider_name, provider in self.providers.items():
            stats["provider_configs"][provider_name.value] = {
                "model": getattr(provider, 'model_name', 'unknown'),
                "temperature": getattr(provider, 'temperature', 'unknown'),
                "max_tokens": getattr(provider, 'max_tokens', 'unknown'),
                "healthy": self.provider_health.get(provider_name, False),
            }
        
        return stats


# Global LLM service instance
llm_service = LLMService()