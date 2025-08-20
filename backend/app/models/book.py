"""Book-related Pydantic models."""

from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any
from uuid import UUID

from pydantic import BaseModel, Field


class BookStatus(str, Enum):
    """Book generation status enum."""
    PENDING = "pending"
    RESEARCHING = "researching"
    GENERATING_OUTLINE = "generating_outline"
    WRITING_CONTENT = "writing_content"
    REVIEWING = "reviewing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class BookLength(str, Enum):
    """Book length options."""
    SHORT = "short"      # 20-50 pages
    MEDIUM = "medium"    # 50-150 pages
    LONG = "long"        # 150-300 pages


class WritingStyle(str, Enum):
    """Writing style options."""
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    ACADEMIC = "academic"
    CONVERSATIONAL = "conversational"
    TECHNICAL = "technical"


class TargetAudience(str, Enum):
    """Target audience options."""
    GENERAL = "general"
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class ChapterOutline(BaseModel):
    """Chapter outline model."""
    chapter_number: int
    title: str
    description: str
    key_points: List[str] = []
    estimated_word_count: int = 0


class BookOutline(BaseModel):
    """Book outline model."""
    title: str
    subtitle: Optional[str] = None
    description: str
    target_audience: TargetAudience
    estimated_page_count: int
    chapters: List[ChapterOutline]
    
    
class ResearchData(BaseModel):
    """Research data model."""
    topic: str
    sources: List[Dict[str, Any]] = []
    key_findings: List[str] = []
    statistics: List[Dict[str, Any]] = []
    expert_quotes: List[Dict[str, str]] = []
    trends: List[str] = []
    research_completed_at: Optional[datetime] = None


class ChapterContent(BaseModel):
    """Chapter content model."""
    chapter_number: int
    title: str
    content: str
    word_count: int
    sections: List[str] = []
    key_takeaways: List[str] = []
    generated_at: Optional[datetime] = None


class BookContent(BaseModel):
    """Complete book content model."""
    title: str
    subtitle: Optional[str] = None
    table_of_contents: List[Dict[str, Any]] = []
    introduction: Optional[str] = None
    chapters: List[ChapterContent] = []
    conclusion: Optional[str] = None
    word_count: int = 0
    page_count: int = 0


class EditorialReview(BaseModel):
    """Editorial review model."""
    overall_score: float = Field(..., ge=0, le=5)
    grammar_score: float = Field(..., ge=0, le=5)
    readability_score: float = Field(..., ge=0, le=5)
    accuracy_score: float = Field(..., ge=0, le=5)
    consistency_score: float = Field(..., ge=0, le=5)
    suggestions: List[str] = []
    critical_issues: List[str] = []
    reviewed_at: Optional[datetime] = None


class GenerationProgress(BaseModel):
    """Book generation progress model."""
    current_stage: BookStatus
    overall_progress: int = Field(..., ge=0, le=100)
    stage_progress: int = Field(..., ge=0, le=100)
    estimated_completion: Optional[datetime] = None
    current_task: Optional[str] = None
    completed_tasks: List[str] = []
    errors: List[str] = []


class BookGenerationRequest(BaseModel):
    """Book generation request model."""
    id: str
    topic: str = Field(..., min_length=3, max_length=200)
    target_audience: TargetAudience = TargetAudience.GENERAL
    writing_style: WritingStyle = WritingStyle.PROFESSIONAL
    book_length: BookLength = BookLength.MEDIUM
    chapter_count: int = Field(default=8, ge=3, le=20)
    include_examples: bool = True
    include_exercises: bool = False
    status: BookStatus = BookStatus.PENDING
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class BookGenerationResponse(BaseModel):
    """Book generation response model."""
    id: str
    topic: str
    status: BookStatus
    progress: int = Field(..., ge=0, le=100)
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None
    message: Optional[str] = None
    error_message: Optional[str] = None
    
    # Optional detailed data
    outline: Optional[BookOutline] = None
    research_data: Optional[ResearchData] = None
    content: Optional[BookContent] = None
    editorial_review: Optional[EditorialReview] = None