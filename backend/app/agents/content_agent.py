"""Content Generation Agent - Creates structured book content."""

from typing import Dict, Any, List, Optional
from datetime import datetime

from loguru import logger

from app.agents.base_agent import BaseAgent
from app.models.agent import AgentType
from app.models.book import BookOutline, ChapterOutline, ChapterContent, BookContent


class ContentGenerationAgent(BaseAgent):
    """Agent specialized in creating structured, engaging book content."""
    
    def __init__(self, llm_service, name: str = "content-agent"):
        super().__init__(
            name=name,
            agent_type=AgentType.CONTENT_GENERATION,
            llm_service=llm_service,
        )
        
        # Configure for creative writing
        self.config.temperature = 0.7
        self.config.max_tokens = 6000
        
        logger.info("✍️ Content Generation Agent initialized")
    
    def get_capabilities(self) -> List[str]:
        """Get content generation capabilities."""
        return [
            "book_outline_creation",
            "chapter_writing",
            "introduction_writing", 
            "conclusion_writing",
            "content_structuring",
            "writing_style_adaptation",
        ]
    
    async def process_task(self, task_input: Dict[str, Any]) -> Dict[str, Any]:
        """Process content generation task."""
        
        task_type = task_input.get("task_type", "full_book_generation")
        research_data = task_input.get("research_data", {})
        book_config = task_input.get("book_config", {})
        
        self.update_progress(5, "Starting content generation")
        
        if task_type == "create_outline":
            result = await self._create_book_outline(research_data, book_config)
        elif task_type == "write_chapter":
            result = await self._write_single_chapter(task_input)
        elif task_type == "full_book_generation":
            result = await self._generate_complete_book(research_data, book_config)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
        
        self.update_progress(100, "Content generation completed")
        
        return result
    
    async def _generate_complete_book(self, research_data: Dict[str, Any], book_config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate complete book content."""
        
        # Step 1: Create outline
        self.update_progress(10, "Creating book outline")
        outline = await self._create_book_outline(research_data, book_config)
        
        # Step 2: Write introduction
        self.update_progress(20, "Writing introduction")
        introduction = await self._write_introduction(outline, research_data, book_config)
        
        # Step 3: Write chapters
        chapters = []
        chapter_count = len(outline.get("chapters", []))
        
        for i, chapter_outline in enumerate(outline.get("chapters", [])):
            progress = 25 + (50 * (i + 1) / chapter_count)
            self.update_progress(int(progress), f"Writing Chapter {i+1}: {chapter_outline.get('title', '')}")
            
            chapter = await self._write_chapter_content(chapter_outline, i+1, research_data, book_config, outline)
            chapters.append(chapter)
        
        # Step 4: Write conclusion
        self.update_progress(80, "Writing conclusion")
        conclusion = await self._write_conclusion(outline, research_data, book_config)
        
        # Step 5: Assemble complete book
        self.update_progress(90, "Assembling book")
        book_content = await self._assemble_book(outline, introduction, chapters, conclusion)
        
        return {
            "book_content": book_content,
            "outline": outline,
            "word_count": book_content.get("word_count", 0),
            "chapter_count": len(chapters),
        }
    
    async def _create_book_outline(self, research_data: Dict[str, Any], book_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create comprehensive book outline."""
        
        topic = book_config.get("topic", research_data.get("topic", ""))
        target_audience = book_config.get("target_audience", "general")
        writing_style = book_config.get("writing_style", "professional")
        chapter_count = book_config.get("chapter_count", 8)
        
        system_message = f"""You are a professional book outline creator. Create a comprehensive, logical book outline for a {writing_style} non-fiction book targeting a {target_audience} audience.

The outline should include:
1. Compelling book title and subtitle
2. Clear book description and value proposition
3. {chapter_count} well-structured chapters with logical progression
4. Key points for each chapter
5. Estimated word counts per chapter"""
        
        research_summary = self._summarize_research(research_data)
        
        prompt = f"""Create a detailed book outline for: "{topic}"

Research Context:
{research_summary}

Book Requirements:
- Target Audience: {target_audience}
- Writing Style: {writing_style}
- Number of Chapters: {chapter_count}
- Include Examples: {book_config.get('include_examples', True)}
- Include Exercises: {book_config.get('include_exercises', False)}

Generate a professional book outline that would create an engaging, informative non-fiction book."""
        
        result = await self.generate_llm_completion(
            prompt=prompt,
            system_message=system_message,
            max_tokens=4000,
        )
        
        return self._parse_outline(result["content"], topic)
    
    async def _write_chapter_content(self, chapter_outline: Dict[str, Any], chapter_number: int, research_data: Dict[str, Any], book_config: Dict[str, Any], full_outline: Dict[str, Any]) -> Dict[str, Any]:
        """Write content for a single chapter."""
        
        system_message = f"""You are a professional non-fiction book writer. Write engaging, informative chapter content in a {book_config.get('writing_style', 'professional')} style for a {book_config.get('target_audience', 'general')} audience.

Guidelines:
- Use clear, logical structure with subheadings
- Include relevant examples and case studies where appropriate
- Maintain consistent tone throughout
- Write approximately 2500-3500 words
- Include actionable insights
- Create smooth transitions between sections"""
        
        relevant_research = self._extract_relevant_research(chapter_outline, research_data)
        
        prompt = f"""Write Chapter {chapter_number}: "{chapter_outline.get('title', '')}"

Chapter Description: {chapter_outline.get('description', '')}
Key Points to Cover: {', '.join(chapter_outline.get('key_points', []))}

Relevant Research Data:
{relevant_research}

Book Context: {full_outline.get('description', '')}

Write a complete, engaging chapter that flows well with the overall book narrative."""
        
        result = await self.generate_llm_completion(
            prompt=prompt,
            system_message=system_message,
            max_tokens=5000,
        )
        
        return {
            "chapter_number": chapter_number,
            "title": chapter_outline.get("title", f"Chapter {chapter_number}"),
            "content": result["content"],
            "word_count": len(result["content"].split()),
            "sections": self._extract_sections(result["content"]),
            "key_takeaways": self._extract_takeaways(result["content"]),
            "generated_at": datetime.utcnow(),
        }
    
    async def _write_introduction(self, outline: Dict[str, Any], research_data: Dict[str, Any], book_config: Dict[str, Any]) -> str:
        """Write compelling book introduction."""
        
        system_message = """Write a compelling book introduction that hooks readers and sets clear expectations.

Include:
1. Why this topic matters now
2. What readers will learn and gain
3. How the book is structured
4. Your approach and perspective
5. A clear promise of value"""
        
        prompt = f"""Write an introduction for the book: "{outline.get('title', '')}"

Book Overview: {outline.get('description', '')}
Target Audience: {book_config.get('target_audience', 'general')}
Key Research Insights: {', '.join(research_data.get('key_findings', [])[:3])}

Chapter Overview:
{chr(10).join(f"Chapter {i+1}: {chapter.get('title', '')}" for i, chapter in enumerate(outline.get('chapters', [])))}

Create an engaging introduction that motivates readers to continue reading."""
        
        result = await self.generate_llm_completion(
            prompt=prompt,
            system_message=system_message,
            max_tokens=2000,
        )
        
        return result["content"]
    
    async def _write_conclusion(self, outline: Dict[str, Any], research_data: Dict[str, Any], book_config: Dict[str, Any]) -> str:
        """Write powerful book conclusion."""
        
        system_message = """Write a powerful book conclusion that summarizes key insights and inspires action.

Include:
1. Summary of main insights and learnings
2. Key takeaways for readers
3. Call to action or next steps
4. Final motivational message
5. Future outlook on the topic"""
        
        prompt = f"""Write a conclusion for the book: "{outline.get('title', '')}"

Main Chapter Topics:
{chr(10).join(f"- {chapter.get('title', '')}" for chapter in outline.get('chapters', []))}

Key Research Findings: {', '.join(research_data.get('key_findings', []))}

Create a compelling conclusion that leaves readers feeling informed, motivated, and ready to apply what they've learned."""
        
        result = await self.generate_llm_completion(
            prompt=prompt,
            system_message=system_message,
            max_tokens=2000,
        )
        
        return result["content"]
    
    async def _assemble_book(self, outline: Dict[str, Any], introduction: str, chapters: List[Dict[str, Any]], conclusion: str) -> Dict[str, Any]:
        """Assemble complete book structure."""
        
        total_word_count = (
            len(introduction.split()) +
            sum(chapter.get("word_count", 0) for chapter in chapters) +
            len(conclusion.split())
        )
        
        return {
            "title": outline.get("title", "Generated Book"),
            "subtitle": outline.get("subtitle", ""),
            "description": outline.get("description", ""),
            "table_of_contents": self._generate_toc(introduction, chapters, conclusion),
            "introduction": introduction,
            "chapters": chapters,
            "conclusion": conclusion,
            "word_count": total_word_count,
            "page_count": max(1, total_word_count // 250),  # ~250 words per page
            "generated_at": datetime.utcnow(),
        }
    
    def _summarize_research(self, research_data: Dict[str, Any]) -> str:
        """Summarize research data for content generation."""
        
        key_findings = research_data.get("key_findings", [])[:5]
        trends = research_data.get("trends", [])[:3]
        
        summary = f"Topic: {research_data.get('topic', '')}\n\n"
        
        if key_findings:
            summary += "Key Research Findings:\n"
            summary += "\n".join(f"- {finding}" for finding in key_findings)
            summary += "\n\n"
        
        if trends:
            summary += "Current Trends:\n"
            summary += "\n".join(f"- {trend}" for trend in trends)
        
        return summary[:1500]  # Limit length
    
    def _parse_outline(self, outline_text: str, topic: str) -> Dict[str, Any]:
        """Parse outline text into structured data."""
        
        lines = outline_text.split('\n')
        chapters = []
        current_chapter = None
        
        title = topic
        subtitle = ""
        description = ""
        
        # Extract title and subtitle
        for line in lines[:10]:
            if 'title:' in line.lower():
                title = line.split(':', 1)[1].strip()
            elif 'subtitle:' in line.lower():
                subtitle = line.split(':', 1)[1].strip()
            elif 'description:' in line.lower():
                description = line.split(':', 1)[1].strip()
        
        # Extract chapters
        for line in lines:
            chapter_match = line.strip()
            if (chapter_match.startswith('Chapter') or 
                chapter_match.startswith('chapter') or
                (chapter_match.startswith(tuple('12345678910')) and ':' in chapter_match)):
                
                if current_chapter:
                    chapters.append(current_chapter)
                
                # Extract chapter title
                if ':' in chapter_match:
                    chapter_title = chapter_match.split(':', 1)[1].strip()
                else:
                    chapter_title = chapter_match
                
                current_chapter = {
                    "title": chapter_title,
                    "description": "",
                    "key_points": [],
                    "estimated_word_count": 3000,
                }
            
            elif current_chapter and line.strip().startswith('-'):
                point = line.strip('- ').strip()
                if len(point) > 10:  # Filter meaningful points
                    current_chapter["key_points"].append(point)
        
        if current_chapter:
            chapters.append(current_chapter)
        
        return {
            "title": title,
            "subtitle": subtitle,
            "description": description or f"A comprehensive guide to {topic}",
            "chapters": chapters,
            "estimated_page_count": len(chapters) * 12,  # ~12 pages per chapter
        }
    
    def _extract_relevant_research(self, chapter_outline: Dict[str, Any], research_data: Dict[str, Any]) -> str:
        """Extract research relevant to specific chapter."""
        
        chapter_keywords = chapter_outline.get("title", "").lower().split()
        key_points = " ".join(chapter_outline.get("key_points", [])).lower()
        
        relevant_findings = []
        for finding in research_data.get("key_findings", []):
            if any(keyword in finding.lower() for keyword in chapter_keywords):
                relevant_findings.append(finding)
        
        return "\n".join(relevant_findings[:3])  # Limit to most relevant
    
    def _extract_sections(self, content: str) -> List[str]:
        """Extract section headings from content."""
        sections = []
        lines = content.split('\n')
        
        for line in lines:
            # Look for markdown headings or numbered sections
            if (line.startswith('#') or 
                line.startswith('##') or
                (line.strip() and line.strip()[0].isdigit() and '.' in line[:10])):
                sections.append(line.strip('# ').strip())
        
        return sections
    
    def _extract_takeaways(self, content: str) -> List[str]:
        """Extract key takeaways from content."""
        takeaways = []
        sentences = content.split('.')
        
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in ['key', 'important', 'remember', 'takeaway', 'conclusion']):
                clean_sentence = sentence.strip() + '.'
                if len(clean_sentence) > 20:
                    takeaways.append(clean_sentence)
        
        return takeaways[:5]
    
    def _generate_toc(self, introduction: str, chapters: List[Dict[str, Any]], conclusion: str) -> List[Dict[str, Any]]:
        """Generate table of contents."""
        toc = [{"title": "Introduction", "page": 1}]
        
        current_page = max(1, len(introduction.split()) // 250)
        
        for chapter in chapters:
            current_page += 1
            toc.append({
                "title": f"Chapter {chapter['chapter_number']}: {chapter['title']}",
                "page": current_page
            })
            current_page += max(1, chapter.get("word_count", 3000) // 250)
        
        toc.append({"title": "Conclusion", "page": current_page + 1})
        
        return toc