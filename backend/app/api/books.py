"""Book generation API endpoints."""

from typing import Dict, List, Optional
from uuid import uuid4
from datetime import datetime

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field

from app.models.book import BookGenerationRequest, BookGenerationResponse, BookStatus
from app.services.book_generation_service import BookGenerationService


class BookCreateRequest(BaseModel):
    """Request model for creating a new book."""
    topic: str = Field(..., description="Book topic", min_length=3, max_length=200)
    target_audience: str = Field(default="general", description="Target audience")
    writing_style: str = Field(default="professional", description="Writing style")
    book_length: str = Field(default="medium", description="Book length: short, medium, long")
    chapter_count: int = Field(default=8, ge=3, le=20, description="Number of chapters")
    include_examples: bool = Field(default=True, description="Include examples")
    include_exercises: bool = Field(default=False, description="Include exercises")


class BookListResponse(BaseModel):
    """Response model for listing books."""
    books: List[BookGenerationResponse]
    total: int
    page: int
    page_size: int


router = APIRouter()
book_service = BookGenerationService()


@router.post("/books", response_model=BookGenerationResponse)
async def create_book(
    request: BookCreateRequest,
    background_tasks: BackgroundTasks,
):
    """Create a new book generation request."""
    
    # Generate unique book ID
    book_id = str(uuid4())
    
    # Create book generation request
    generation_request = BookGenerationRequest(
        id=book_id,
        topic=request.topic,
        target_audience=request.target_audience,
        writing_style=request.writing_style,
        book_length=request.book_length,
        chapter_count=request.chapter_count,
        include_examples=request.include_examples,
        include_exercises=request.include_exercises,
        status=BookStatus.PENDING,
        created_at=datetime.utcnow(),
    )
    
    # Start book generation in background
    background_tasks.add_task(
        book_service.generate_book_async,
        generation_request
    )
    
    # Return initial response
    return BookGenerationResponse(
        id=book_id,
        topic=request.topic,
        status=BookStatus.PENDING,
        progress=0,
        created_at=datetime.utcnow(),
        estimated_completion=None,
        message="Book generation started",
    )


@router.get("/books", response_model=BookListResponse)
async def list_books(
    page: int = 1,
    page_size: int = 20,
    status: Optional[BookStatus] = None,
):
    """List all books with optional filtering."""
    
    books = await book_service.list_books(
        page=page,
        page_size=page_size,
        status_filter=status,
    )
    
    return BookListResponse(
        books=books["books"],
        total=books["total"],
        page=page,
        page_size=page_size,
    )


@router.get("/books/{book_id}", response_model=BookGenerationResponse)
async def get_book(book_id: str):
    """Get a specific book by ID."""
    
    book = await book_service.get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return book


@router.delete("/books/{book_id}")
async def delete_book(book_id: str):
    """Delete a book."""
    
    success = await book_service.delete_book(book_id)
    if not success:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return {"message": "Book deleted successfully"}


@router.post("/books/{book_id}/cancel")
async def cancel_book_generation(book_id: str):
    """Cancel an ongoing book generation."""
    
    success = await book_service.cancel_generation(book_id)
    if not success:
        raise HTTPException(
            status_code=400, 
            detail="Cannot cancel book generation (not found or already completed)"
        )
    
    return {"message": "Book generation cancelled"}


@router.get("/books/{book_id}/download")
async def download_book(book_id: str, format: str = "pdf"):
    """Download generated book in specified format."""
    
    book = await book_service.get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book.status != BookStatus.COMPLETED:
        raise HTTPException(
            status_code=400, 
            detail="Book generation not completed yet"
        )
    
    # TODO: Implement actual file download
    return {
        "message": "Download functionality coming soon",
        "book_id": book_id,
        "format": format,
    }


@router.get("/books/{book_id}/content")
async def get_book_content(book_id: str):
    """Get the full content of a generated book."""
    
    book = await book_service.get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book.status != BookStatus.COMPLETED:
        raise HTTPException(
            status_code=400, 
            detail="Book generation not completed yet"
        )
    
    content = await book_service.get_book_content(book_id)
    return content


@router.get("/books/{book_id}/progress")
async def get_book_progress(book_id: str):
    """Get detailed progress information for a book generation."""
    
    progress = await book_service.get_detailed_progress(book_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return progress