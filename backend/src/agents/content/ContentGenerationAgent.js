import { LLMClient } from '../../services/llm-client.js';
import logger from '../../utils/logger.js';

/**
 * Content Generation Agent
 * Creates structured, engaging non-fiction content based on research
 */

export class ContentGenerationAgent {
  constructor() {
    this.llmClient = new LLMClient('content');
    this.generatedContent = {};
    this.contentStructure = {};
  }

  /**
   * Generate complete book content from research data
   */
  async generateBook(researchData, bookConfig = {}) {
    const {
      title = researchData.topic,
      targetAudience = 'general',
      writingStyle = 'professional',
      bookLength = 'medium', // short: 20-50 pages, medium: 50-150 pages, long: 150-300 pages
      includeExamples = true,
      includeExercises = false,
      chapterCount = 8
    } = bookConfig;

    logger.info(`Starting book generation: ${title}`);

    try {
      // Step 1: Create book outline and chapter structure
      const outline = await this.generateBookOutline(researchData, bookConfig);

      // Step 2: Generate chapter content
      const chapters = await this.generateChapters(outline, researchData, bookConfig);

      // Step 3: Generate introduction and conclusion
      const introduction = await this.generateIntroduction(outline, researchData, bookConfig);
      const conclusion = await this.generateConclusion(outline, researchData, bookConfig);

      // Step 4: Create complete book structure
      const book = this.assembleBook(title, introduction, chapters, conclusion, outline);

      return {
        book,
        metadata: {
          title,
          targetAudience,
          writingStyle,
          wordCount: this.calculateWordCount(book),
          estimatedPages: this.estimatePages(book),
          generatedAt: new Date().toISOString(),
          agent: 'ContentGenerationAgent'
        }
      };

    } catch (error) {
      logger.error(`Book generation failed for ${title}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate comprehensive book outline
   */
  async generateBookOutline(researchData, bookConfig) {
    const systemMessage = `You are a professional book outline creator. Create a comprehensive, logical book outline.

The outline should include:
1. Book title and subtitle
2. Target audience description
3. Chapter titles and descriptions
4. Key points for each chapter
5. Logical flow and progression
6. Estimated chapter lengths

Write for ${bookConfig.targetAudience} audience in a ${bookConfig.writingStyle} style.`;

    const prompt = `Create a detailed book outline based on this research:

Topic: ${researchData.topic}
Research Findings: ${researchData.analysis?.keyFindings?.join(', ') || 'Comprehensive research completed'}
Target Length: ${bookConfig.bookLength}
Chapter Count: ${bookConfig.chapterCount}

Key Research Insights:
${researchData.analysis?.content?.slice(0, 2000) || 'Research data available'}

Generate a professional book outline that would create an engaging, informative non-fiction book.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.6,
      maxTokens: 4000
    });

    const outline = this.parseOutline(response.content);
    logger.info(`Generated book outline with ${outline.chapters?.length || 0} chapters`);
    return outline;
  }

  /**
   * Generate all chapters based on outline
   */
  async generateChapters(outline, researchData, bookConfig) {
    const chapters = [];

    for (let i = 0; i < outline.chapters.length; i++) {
      const chapterOutline = outline.chapters[i];
      logger.info(`Generating Chapter ${i + 1}: ${chapterOutline.title}`);

      const chapter = await this.generateSingleChapter(
        chapterOutline,
        i + 1,
        researchData,
        bookConfig,
        outline
      );

      chapters.push(chapter);
    }

    return chapters;
  }

  /**
   * Generate a single chapter
   */
  async generateSingleChapter(chapterOutline, chapterNumber, researchData, bookConfig, bookOutline) {
    const systemMessage = `You are a professional non-fiction book writer. Write engaging, informative chapter content.

Guidelines:
- Write in ${bookConfig.writingStyle} style for ${bookConfig.targetAudience} audience
- Include relevant examples and case studies
- Use clear, logical structure with subheadings
- Maintain consistent tone throughout
- Include actionable insights where appropriate
- Write approximately ${this.getTargetWordsPerChapter(bookConfig)} words

Chapter Structure:
1. Opening hook/introduction
2. Main content with subheadings
3. Key takeaways/summary
4. Transition to next chapter`;

    const relevantResearch = this.extractRelevantResearch(chapterOutline, researchData);

    const prompt = `Write Chapter ${chapterNumber}: "${chapterOutline.title}"

Chapter Description: ${chapterOutline.description}
Key Points to Cover: ${chapterOutline.keyPoints?.join(', ') || 'Main topic points'}

Relevant Research Data:
${relevantResearch}

Book Context:
${bookOutline.description || ''}

Write a complete, engaging chapter that flows well with the overall book narrative.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.7,
      maxTokens: this.getMaxTokensForChapter(bookConfig)
    });

    return {
      chapterNumber,
      title: chapterOutline.title,
      content: response.content,
      wordCount: response.content.split(' ').length,
      sections: this.extractSections(response.content),
      keyTakeaways: this.extractKeyTakeaways(response.content)
    };
  }

  /**
   * Generate book introduction
   */
  async generateIntroduction(outline, researchData, bookConfig) {
    const systemMessage = `Write a compelling book introduction that hooks readers and sets expectations.

Include:
1. Why this topic matters now
2. What readers will learn
3. How the book is structured
4. Author's approach/perspective
5. Promise of value to reader`;

    const prompt = `Write an introduction for the book: "${outline.title || researchData.topic}"

Book Overview: ${outline.description || ''}
Target Audience: ${bookConfig.targetAudience}
Key Research Insights: ${researchData.analysis?.keyFindings?.slice(0, 3)?.join(', ') || ''}

Create an engaging introduction that motivates readers to continue reading.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.7,
      maxTokens: 2000
    });

    return {
      title: 'Introduction',
      content: response.content,
      wordCount: response.content.split(' ').length
    };
  }

  /**
   * Generate book conclusion
   */
  async generateConclusion(outline, researchData, bookConfig) {
    const systemMessage = `Write a powerful book conclusion that summarizes key points and inspires action.

Include:
1. Summary of main insights
2. Key takeaways for readers
3. Call to action or next steps
4. Final motivational message
5. Future outlook on the topic`;

    const prompt = `Write a conclusion for the book: "${outline.title || researchData.topic}"

Main Chapter Topics: ${outline.chapters?.map(c => c.title).join(', ') || ''}
Key Research Findings: ${researchData.analysis?.keyFindings?.join(', ') || ''}

Create a compelling conclusion that leaves readers feeling informed and motivated.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.7,
      maxTokens: 2000
    });

    return {
      title: 'Conclusion',
      content: response.content,
      wordCount: response.content.split(' ').length
    };
  }

  /**
   * Assemble complete book structure
   */
  assembleBook(title, introduction, chapters, conclusion, outline) {
    return {
      title,
      subtitle: outline.subtitle || '',
      tableOfContents: this.generateTableOfContents(introduction, chapters, conclusion),
      introduction,
      chapters,
      conclusion,
      appendix: outline.includeAppendix ? this.generateAppendix(outline) : null,
      bibliography: this.generateBibliography(outline),
      totalWordCount: this.calculateWordCount({
        introduction,
        chapters,
        conclusion
      })
    };
  }

  // Helper methods

  parseOutline(outlineText) {
    // Simple outline parser - in production, use more sophisticated parsing
    const lines = outlineText.split('\n');
    const chapters = [];
    let currentChapter = null;

    lines.forEach(line => {
      const chapterMatch = line.match(/Chapter\s+\d+:?\s*(.+)/i);
      if (chapterMatch) {
        if (currentChapter) {
          chapters.push(currentChapter);
        }
        currentChapter = {
          title: chapterMatch[1].trim(),
          description: '',
          keyPoints: []
        };
      } else if (currentChapter && line.trim()) {
        if (line.includes('Key points:') || line.includes('Description:')) {
          currentChapter.description = line.replace(/^(Key points:|Description:)/i, '').trim();
        } else if (line.match(/^[-*•]\s/)) {
          currentChapter.keyPoints.push(line.replace(/^[-*•]\s/, '').trim());
        }
      }
    });

    if (currentChapter) {
      chapters.push(currentChapter);
    }

    return {
      title: this.extractTitle(outlineText) || 'Generated Book',
      subtitle: this.extractSubtitle(outlineText) || '',
      description: this.extractDescription(outlineText) || '',
      chapters,
      includeAppendix: outlineText.toLowerCase().includes('appendix')
    };
  }

  extractTitle(text) {
    const titleMatch = text.match(/Title:?\s*(.+)/i);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  extractSubtitle(text) {
    const subtitleMatch = text.match(/Subtitle:?\s*(.+)/i);
    return subtitleMatch ? subtitleMatch[1].trim() : null;
  }

  extractDescription(text) {
    const descMatch = text.match(/Description:?\s*(.+)/i);
    return descMatch ? descMatch[1].trim() : null;
  }

  extractRelevantResearch(chapterOutline, researchData) {
    // Extract most relevant research for this chapter
    const relevantContent = researchData.analysis?.content || '';
    return relevantContent.slice(0, 1500); // Limit to avoid token limits
  }

  extractSections(content) {
    const sections = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.match(/^#+\s/) || line.match(/^\d+\.\s[A-Z]/) || line.match(/^[A-Z][^.]{10,}$/)) {
        sections.push(line.trim());
      }
    });
    
    return sections;
  }

  extractKeyTakeaways(content) {
    const takeaways = [];
    const sentences = content.split('.').filter(s => s.length > 30);
    
    // Look for conclusion-type sentences
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes('key') || 
          sentence.toLowerCase().includes('important') ||
          sentence.toLowerCase().includes('remember') ||
          sentence.toLowerCase().includes('takeaway')) {
        takeaways.push(sentence.trim() + '.');
      }
    });
    
    return takeaways.slice(0, 5);
  }

  generateTableOfContents(introduction, chapters, conclusion) {
    const toc = [
      { title: introduction.title, page: 1 }
    ];
    
    let currentPage = Math.ceil(introduction.wordCount / 250); // ~250 words per page
    
    chapters.forEach((chapter, index) => {
      toc.push({
        title: `Chapter ${chapter.chapterNumber}: ${chapter.title}`,
        page: currentPage + 1
      });
      currentPage += Math.ceil(chapter.wordCount / 250);
    });
    
    toc.push({
      title: conclusion.title,
      page: currentPage + 1
    });
    
    return toc;
  }

  generateAppendix(outline) {
    return {
      title: 'Appendix',
      content: 'Additional resources and references.'
    };
  }

  generateBibliography(outline) {
    return {
      title: 'Bibliography',
      content: 'Research sources and references used in this book.'
    };
  }

  calculateWordCount(bookContent) {
    let totalWords = 0;
    
    if (bookContent.introduction?.content) {
      totalWords += bookContent.introduction.content.split(' ').length;
    }
    
    if (bookContent.chapters) {
      bookContent.chapters.forEach(chapter => {
        totalWords += chapter.content.split(' ').length;
      });
    }
    
    if (bookContent.conclusion?.content) {
      totalWords += bookContent.conclusion.content.split(' ').length;
    }
    
    return totalWords;
  }

  estimatePages(bookContent) {
    const wordCount = this.calculateWordCount(bookContent);
    return Math.ceil(wordCount / 250); // ~250 words per page
  }

  getTargetWordsPerChapter(bookConfig) {
    const targets = {
      short: 1500,   // 20-50 pages total
      medium: 3000,  // 50-150 pages total
      long: 5000     // 150-300 pages total
    };
    return targets[bookConfig.bookLength] || 3000;
  }

  getMaxTokensForChapter(bookConfig) {
    const maxTokens = {
      short: 2000,
      medium: 4000,
      long: 6000
    };
    return maxTokens[bookConfig.bookLength] || 4000;
  }
}