import { LLMClient } from '../../services/llm-client.js';
import logger from '../../utils/logger.js';

/**
 * Editorial Agent
 * Reviews, fact-checks, and ensures quality of generated content
 */

export class EditorialAgent {
  constructor() {
    this.llmClient = new LLMClient('editorial');
    this.reviewResults = {};
    this.qualityMetrics = {};
  }

  /**
   * Comprehensive editorial review of book content
   */
  async reviewBook(bookContent, options = {}) {
    const {
      checkFactualAccuracy = true,
      checkGrammarStyle = true,
      checkConsistency = true,
      checkReadability = true,
      checkPlagiarism = true,
      targetAudience = 'general',
      qualityThreshold = 4.0
    } = options;

    logger.info(`Starting editorial review for: ${bookContent.title}`);

    try {
      const reviews = {};

      // Review introduction
      if (bookContent.introduction) {
        reviews.introduction = await this.reviewSection(
          'Introduction',
          bookContent.introduction.content,
          { ...options, sectionType: 'introduction' }
        );
      }

      // Review each chapter
      reviews.chapters = [];
      for (const chapter of bookContent.chapters || []) {
        const chapterReview = await this.reviewSection(
          `Chapter ${chapter.chapterNumber}: ${chapter.title}`,
          chapter.content,
          { ...options, sectionType: 'chapter' }
        );
        reviews.chapters.push(chapterReview);
      }

      // Review conclusion
      if (bookContent.conclusion) {
        reviews.conclusion = await this.reviewSection(
          'Conclusion',
          bookContent.conclusion.content,
          { ...options, sectionType: 'conclusion' }
        );
      }

      // Overall book consistency check
      const consistencyReview = await this.reviewBookConsistency(bookContent, reviews);

      // Calculate overall quality score
      const overallQuality = this.calculateOverallQuality(reviews, consistencyReview);

      // Generate improvement recommendations
      const recommendations = await this.generateRecommendations(reviews, consistencyReview, overallQuality);

      return {
        bookTitle: bookContent.title,
        overallQuality,
        passesQualityThreshold: overallQuality.score >= qualityThreshold,
        reviews,
        consistencyReview,
        recommendations,
        reviewedAt: new Date().toISOString(),
        agent: 'EditorialAgent'
      };

    } catch (error) {
      logger.error(`Editorial review failed for ${bookContent.title}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Review individual content section
   */
  async reviewSection(sectionTitle, content, options) {
    logger.info(`Reviewing section: ${sectionTitle}`);

    const reviews = {};

    // Grammar and style review
    if (options.checkGrammarStyle) {
      reviews.grammarStyle = await this.reviewGrammarAndStyle(content, options);
    }

    // Factual accuracy review
    if (options.checkFactualAccuracy) {
      reviews.factualAccuracy = await this.reviewFactualAccuracy(content, options);
    }

    // Readability review
    if (options.checkReadability) {
      reviews.readability = await this.reviewReadability(content, options);
    }

    // Content quality review
    reviews.contentQuality = await this.reviewContentQuality(content, options);

    // Calculate section score
    const sectionScore = this.calculateSectionScore(reviews);

    return {
      sectionTitle,
      sectionScore,
      reviews,
      wordCount: content.split(' ').length,
      issuesFound: this.countIssues(reviews),
      recommendations: this.generateSectionRecommendations(reviews)
    };
  }

  /**
   * Review grammar and writing style
   */
  async reviewGrammarAndStyle(content, options) {
    const systemMessage = `You are an expert editor reviewing content for grammar, style, and readability.

Evaluate:
1. Grammar and punctuation errors
2. Writing style consistency
3. Sentence structure and flow
4. Word choice and clarity
5. Tone appropriateness for ${options.targetAudience} audience

Provide a score from 1-10 and specific feedback.`;

    const prompt = `Review this content for grammar, style, and readability:

Target Audience: ${options.targetAudience}
Section Type: ${options.sectionType}

Content:
${content.slice(0, 3000)}

Provide detailed feedback on grammar, style, and suggestions for improvement.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.3,
      maxTokens: 2000
    });

    return {
      score: this.extractScore(response.content),
      feedback: response.content,
      issues: this.extractIssues(response.content, 'grammar'),
      suggestions: this.extractSuggestions(response.content)
    };
  }

  /**
   * Review factual accuracy
   */
  async reviewFactualAccuracy(content, options) {
    const systemMessage = `You are a fact-checker reviewing content for accuracy and credibility.

Check for:
1. Factual claims and statistics
2. Logical consistency
3. Potential misinformation
4. Need for citations
5. Credibility of statements

Provide a score from 1-10 and flag any questionable claims.`;

    const prompt = `Fact-check this content for accuracy and credibility:

Content:
${content.slice(0, 3000)}

Identify any factual claims that need verification or correction.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.2,
      maxTokens: 2000
    });

    return {
      score: this.extractScore(response.content),
      feedback: response.content,
      flaggedClaims: this.extractFlaggedClaims(response.content),
      needsCitation: this.extractCitationNeeds(response.content),
      credibilityIssues: this.extractIssues(response.content, 'credibility')
    };
  }

  /**
   * Review readability and engagement
   */
  async reviewReadability(content, options) {
    const systemMessage = `You are a readability expert evaluating content for engagement and comprehension.

Assess:
1. Reading level appropriateness
2. Sentence variety and flow
3. Engagement and interest level
4. Clarity of explanations
5. Use of examples and analogies

Rate from 1-10 for ${options.targetAudience} audience.`;

    const prompt = `Evaluate the readability and engagement of this content:

Target Audience: ${options.targetAudience}

Content:
${content.slice(0, 3000)}

Assess how well this content engages and communicates with the intended audience.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.4,
      maxTokens: 2000
    });

    return {
      score: this.extractScore(response.content),
      feedback: response.content,
      readingLevel: this.calculateReadingLevel(content),
      engagementScore: this.assessEngagement(content),
      clarityIssues: this.extractIssues(response.content, 'clarity')
    };
  }

  /**
   * Review overall content quality
   */
  async reviewContentQuality(content, options) {
    const systemMessage = `You are a content quality expert evaluating overall content excellence.

Evaluate:
1. Depth and comprehensiveness
2. Organization and structure
3. Value and insights provided
4. Relevance to topic
5. Professional quality

Score from 1-10 and provide constructive feedback.`;

    const prompt = `Assess the overall quality of this content:

Section Type: ${options.sectionType}

Content:
${content.slice(0, 3000)}

Evaluate the depth, organization, and value this content provides.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.4,
      maxTokens: 2000
    });

    return {
      score: this.extractScore(response.content),
      feedback: response.content,
      strengthsWeaknesses: this.extractStrengthsWeaknesses(response.content),
      improvementAreas: this.extractImprovementAreas(response.content)
    };
  }

  /**
   * Review book-wide consistency
   */
  async reviewBookConsistency(bookContent, sectionReviews) {
    const systemMessage = `You are reviewing a complete book for consistency and cohesion.

Check for:
1. Consistent tone and style across chapters
2. Logical flow between sections
3. Consistent terminology and concepts
4. No contradictory statements
5. Appropriate transitions

Provide overall consistency assessment.`;

    // Extract key themes and terminology from each section
    const bookSummary = this.createBookSummary(bookContent);
    
    const prompt = `Review this book for overall consistency and flow:

Book Title: ${bookContent.title}
Total Chapters: ${bookContent.chapters?.length || 0}

Book Summary:
${bookSummary}

Section Quality Scores:
${this.summarizeReviewScores(sectionReviews)}

Assess the book's overall consistency, flow, and cohesion.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.3,
      maxTokens: 2000
    });

    return {
      consistencyScore: this.extractScore(response.content),
      feedback: response.content,
      inconsistencies: this.extractInconsistencies(response.content),
      flowIssues: this.extractFlowIssues(response.content),
      terminologyIssues: this.extractTerminologyIssues(response.content)
    };
  }

  /**
   * Generate improvement recommendations
   */
  async generateRecommendations(reviews, consistencyReview, overallQuality) {
    const systemMessage = `You are an editorial consultant providing actionable improvement recommendations.

Based on the review results, provide:
1. Priority improvements (high, medium, low)
2. Specific action items
3. Estimated effort for each improvement
4. Expected quality impact

Be constructive and specific in your recommendations.`;

    const reviewSummary = this.createReviewSummary(reviews, consistencyReview, overallQuality);

    const prompt = `Based on this editorial review, provide improvement recommendations:

Overall Quality Score: ${overallQuality.score}/10
Quality Threshold Met: ${overallQuality.passesThreshold}

Review Summary:
${reviewSummary}

Provide prioritized, actionable recommendations to improve the book quality.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.5,
      maxTokens: 2500
    });

    return {
      content: response.content,
      prioritizedActions: this.extractPrioritizedActions(response.content),
      estimatedEffort: this.extractEffortEstimates(response.content),
      expectedImpact: this.extractExpectedImpact(response.content)
    };
  }

  // Helper methods for analysis and scoring

  extractScore(text) {
    const scoreMatch = text.match(/score:?\s*(\d+(?:\.\d+)?)/i) || 
                     text.match(/(\d+(?:\.\d+)?)\/10/) ||
                     text.match(/rate[d]?\s*(\d+(?:\.\d+)?)/i);
    return scoreMatch ? parseFloat(scoreMatch[1]) : 5.0;
  }

  extractIssues(text, type) {
    const issues = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('issue') || 
          line.toLowerCase().includes('error') || 
          line.toLowerCase().includes('problem') ||
          line.toLowerCase().includes(type)) {
        issues.push(line.trim());
      }
    });
    
    return issues.slice(0, 5);
  }

  extractSuggestions(text) {
    const suggestions = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('suggest') || 
          line.toLowerCase().includes('recommend') || 
          line.toLowerCase().includes('improve')) {
        suggestions.push(line.trim());
      }
    });
    
    return suggestions.slice(0, 5);
  }

  extractFlaggedClaims(text) {
    const flagged = [];
    const sentences = text.split('.').filter(s => s.length > 20);
    
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes('claim') || 
          sentence.toLowerCase().includes('statement') || 
          sentence.toLowerCase().includes('verify')) {
        flagged.push(sentence.trim() + '.');
      }
    });
    
    return flagged.slice(0, 3);
  }

  extractCitationNeeds(text) {
    const needsCitation = [];
    const sentences = text.split('.').filter(s => s.length > 20);
    
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes('citation') || 
          sentence.toLowerCase().includes('source') || 
          sentence.toLowerCase().includes('reference')) {
        needsCitation.push(sentence.trim() + '.');
      }
    });
    
    return needsCitation.slice(0, 3);
  }

  calculateReadingLevel(content) {
    // Simple reading level calculation (Flesch-Kincaid approximation)
    const words = content.split(' ').length;
    const sentences = content.split(/[.!?]/).length;
    const syllables = this.estimateSyllables(content);
    
    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    if (fleschScore >= 90) return 'Very Easy';
    if (fleschScore >= 80) return 'Easy';
    if (fleschScore >= 70) return 'Fairly Easy';
    if (fleschScore >= 60) return 'Standard';
    if (fleschScore >= 50) return 'Fairly Difficult';
    if (fleschScore >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  estimateSyllables(text) {
    // Simple syllable estimation
    const words = text.toLowerCase().split(' ');
    let syllables = 0;
    
    words.forEach(word => {
      const vowelMatches = word.match(/[aeiouy]+/g);
      syllables += vowelMatches ? vowelMatches.length : 1;
    });
    
    return syllables;
  }

  assessEngagement(content) {
    let engagementScore = 5.0;
    
    // Check for engaging elements
    if (content.includes('?')) engagementScore += 0.5; // Questions
    if (content.includes('example') || content.includes('case study')) engagementScore += 0.5;
    if (content.includes('you') || content.includes('your')) engagementScore += 0.5; // Direct address
    if (content.match(/\b(imagine|consider|think about)\b/i)) engagementScore += 0.3;
    
    return Math.min(10, engagementScore);
  }

  calculateSectionScore(reviews) {
    const scores = [];
    
    Object.values(reviews).forEach(review => {
      if (review.score) {
        scores.push(review.score);
      }
    });
    
    if (scores.length === 0) return 5.0;
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return parseFloat(average.toFixed(1));
  }

  countIssues(reviews) {
    let totalIssues = 0;
    
    Object.values(reviews).forEach(review => {
      if (review.issues) totalIssues += review.issues.length;
      if (review.flaggedClaims) totalIssues += review.flaggedClaims.length;
      if (review.credibilityIssues) totalIssues += review.credibilityIssues.length;
      if (review.clarityIssues) totalIssues += review.clarityIssues.length;
    });
    
    return totalIssues;
  }

  generateSectionRecommendations(reviews) {
    const recommendations = [];
    
    Object.entries(reviews).forEach(([type, review]) => {
      if (review.score < 7.0) {
        recommendations.push(`Improve ${type} (current score: ${review.score}/10)`);
      }
      
      if (review.suggestions) {
        recommendations.push(...review.suggestions.slice(0, 2));
      }
    });
    
    return recommendations;
  }

  calculateOverallQuality(reviews, consistencyReview) {
    const allScores = [];
    
    // Collect all section scores
    Object.values(reviews).forEach(sectionReview => {
      if (sectionReview.sectionScore) {
        allScores.push(sectionReview.sectionScore);
      }
    });
    
    // Include consistency score
    if (consistencyReview.consistencyScore) {
      allScores.push(consistencyReview.consistencyScore);
    }
    
    const overallScore = allScores.length > 0 
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
      : 5.0;
    
    return {
      score: parseFloat(overallScore.toFixed(1)),
      passesThreshold: overallScore >= 4.0,
      breakdown: {
        averageSectionScore: parseFloat((allScores.slice(0, -1).reduce((sum, s) => sum + s, 0) / Math.max(1, allScores.length - 1)).toFixed(1)),
        consistencyScore: consistencyReview.consistencyScore || 5.0
      }
    };
  }

  createBookSummary(bookContent) {
    let summary = `Title: ${bookContent.title}\n`;
    
    if (bookContent.chapters) {
      summary += 'Chapters:\n';
      bookContent.chapters.forEach(chapter => {
        summary += `- Chapter ${chapter.chapterNumber}: ${chapter.title}\n`;
      });
    }
    
    return summary;
  }

  summarizeReviewScores(sectionReviews) {
    let summary = '';
    
    Object.entries(sectionReviews).forEach(([section, review]) => {
      if (review.sectionScore) {
        summary += `${section}: ${review.sectionScore}/10\n`;
      }
    });
    
    return summary;
  }

  createReviewSummary(reviews, consistencyReview, overallQuality) {
    let summary = `Overall Quality: ${overallQuality.score}/10\n`;
    summary += `Consistency Score: ${consistencyReview.consistencyScore}/10\n\n`;
    
    let totalIssues = 0;
    Object.values(reviews).forEach(sectionReview => {
      totalIssues += sectionReview.issuesFound || 0;
    });
    
    summary += `Total Issues Found: ${totalIssues}\n`;
    summary += `Major Areas for Improvement:\n`;
    
    // Find lowest scoring areas
    const lowScores = [];
    Object.entries(reviews).forEach(([section, review]) => {
      if (review.sectionScore < 7.0) {
        lowScores.push(`- ${section}: ${review.sectionScore}/10`);
      }
    });
    
    summary += lowScores.slice(0, 3).join('\n');
    
    return summary;
  }

  extractPrioritizedActions(text) {
    const actions = {
      high: [],
      medium: [],
      low: []
    };
    
    const lines = text.split('\n');
    let currentPriority = null;
    
    lines.forEach(line => {
      const priorityMatch = line.match(/(high|medium|low)\s*priority/i);
      if (priorityMatch) {
        currentPriority = priorityMatch[1].toLowerCase();
      } else if (currentPriority && (line.includes('•') || line.includes('-') || line.match(/^\d+\./))) {
        actions[currentPriority].push(line.trim());
      }
    });
    
    return actions;
  }

  extractEffortEstimates(text) {
    const efforts = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('effort') || 
          line.toLowerCase().includes('time') || 
          line.toLowerCase().includes('hour')) {
        efforts.push(line.trim());
      }
    });
    
    return efforts.slice(0, 5);
  }

  extractExpectedImpact(text) {
    const impacts = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('impact') || 
          line.toLowerCase().includes('improve') || 
          line.toLowerCase().includes('benefit')) {
        impacts.push(line.trim());
      }
    });
    
    return impacts.slice(0, 5);
  }

  // Additional helper methods for extracting specific issues

  extractStrengthsWeaknesses(text) {
    const result = { strengths: [], weaknesses: [] };
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('strength') || line.toLowerCase().includes('good')) {
        result.strengths.push(line.trim());
      } else if (line.toLowerCase().includes('weakness') || line.toLowerCase().includes('weak')) {
        result.weaknesses.push(line.trim());
      }
    });
    
    return result;
  }

  extractImprovementAreas(text) {
    const areas = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('improve') || 
          line.toLowerCase().includes('enhance') || 
          line.toLowerCase().includes('better')) {
        areas.push(line.trim());
      }
    });
    
    return areas.slice(0, 5);
  }

  extractInconsistencies(text) {
    const inconsistencies = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('inconsistent') || 
          line.toLowerCase().includes('contradict') || 
          line.toLowerCase().includes('mismatch')) {
        inconsistencies.push(line.trim());
      }
    });
    
    return inconsistencies;
  }

  extractFlowIssues(text) {
    const issues = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('flow') || 
          line.toLowerCase().includes('transition') || 
          line.toLowerCase().includes('connection')) {
        issues.push(line.trim());
      }
    });
    
    return issues;
  }

  extractTerminologyIssues(text) {
    const issues = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('terminology') || 
          line.toLowerCase().includes('term') || 
          line.toLowerCase().includes('definition')) {
        issues.push(line.trim());
      }
    });
    
    return issues;
  }
}