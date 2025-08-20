"""Application configuration using Pydantic settings."""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
    """Application settings."""
    
    # Server Configuration
    HOST: str = Field(default="0.0.0.0", description="Server host")
    PORT: int = Field(default=8000, description="Server port")
    DEBUG: bool = Field(default=False, description="Debug mode")
    ENVIRONMENT: str = Field(default="development", description="Environment")
    
    # CORS
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        description="Allowed CORS origins"
    )
    
    # Security
    SECRET_KEY: str = Field(description="Secret key for JWT")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    ALGORITHM: str = Field(default="HS256")
    
    # Database
    DATABASE_URL: Optional[str] = Field(default=None, description="PostgreSQL URL")
    MONGODB_URL: Optional[str] = Field(default=None, description="MongoDB URL")
    REDIS_URL: Optional[str] = Field(default=None, description="Redis URL")
    
    # LLM Providers
    OPENAI_API_KEY: Optional[str] = Field(default=None)
    OPENAI_MODEL: str = Field(default="gpt-4-turbo-preview")
    OPENAI_BASE_URL: str = Field(default="https://api.openai.com/v1")
    
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None)
    ANTHROPIC_MODEL: str = Field(default="claude-3-sonnet-20240229")
    
    HUGGINGFACE_API_KEY: Optional[str] = Field(default=None)
    COHERE_API_KEY: Optional[str] = Field(default=None)
    GOOGLE_API_KEY: Optional[str] = Field(default=None)
    
    # External APIs
    SERPER_API_KEY: Optional[str] = Field(default=None, description="Google Search API")
    TAVILY_API_KEY: Optional[str] = Field(default=None, description="Web Research API")
    REDDIT_CLIENT_ID: Optional[str] = Field(default=None)
    REDDIT_CLIENT_SECRET: Optional[str] = Field(default=None)
    
    # LangSmith Configuration
    LANGCHAIN_TRACING_V2: bool = Field(default=False)
    LANGCHAIN_API_KEY: Optional[str] = Field(default=None)
    LANGCHAIN_PROJECT: str = Field(default="noblebooksfactory")
    
    # File Storage
    STORAGE_TYPE: str = Field(default="local", description="Storage type: local, s3, gcs")
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None)
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None)
    AWS_BUCKET_NAME: Optional[str] = Field(default=None)
    AWS_REGION: str = Field(default="us-east-1")
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = Field(default=60)
    RATE_LIMIT_BURST: int = Field(default=10)
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", description="Log level")
    LOG_FORMAT: str = Field(default="json", description="Log format")
    
    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_allowed_origins(cls, v):
        """Parse ALLOWED_ORIGINS from string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @validator("SECRET_KEY")
    def validate_secret_key(cls, v):
        """Ensure secret key is provided."""
        if not v or v == "your-super-secret-key-change-this-in-production":
            if cls.__dict__.get("ENVIRONMENT") == "production":
                raise ValueError("SECRET_KEY must be set in production")
        return v
    
    class Config:
        """Pydantic config."""
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()