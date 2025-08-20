import { OpenAI } from 'openai';
import { ChatOpenAI } from '@langchain/openai';
import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * LLM Provider Configuration
 * Supports multiple LLM providers for different agents
 */

export class LLMProviderManager {
  constructor() {
    this.providers = {
      openai: null,
      claude: null,
      huggingface: null,
      local: null
    };
    this.initializeProviders();
  }

  /**
   * Initialize all configured LLM providers
   */
  initializeProviders() {
    // OpenAI Configuration
    if (process.env.OPENAI_API_KEY) {
      this.providers.openai = {
        client: new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        }),
        langchainClient: new ChatOpenAI({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: 'gpt-4',
          temperature: 0.7
        }),
        models: {
          'gpt-4': { maxTokens: 128000, costPer1k: 0.03 },
          'gpt-3.5-turbo': { maxTokens: 16384, costPer1k: 0.002 },
          'gpt-4-turbo': { maxTokens: 128000, costPer1k: 0.01 }
        }
      };
      logger.info('OpenAI provider initialized');
    }

    // Claude (Anthropic) Configuration
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.claude = {
        client: axios.create({
          baseURL: 'https://api.anthropic.com/v1',
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          }
        }),
        models: {
          'claude-3-sonnet': { maxTokens: 200000, costPer1k: 0.003 },
          'claude-3-opus': { maxTokens: 200000, costPer1k: 0.015 },
          'claude-3-haiku': { maxTokens: 200000, costPer1k: 0.0005 }
        }
      };
      logger.info('Claude provider initialized');
    }

    // Hugging Face Configuration
    if (process.env.HUGGINGFACE_API_KEY) {
      this.providers.huggingface = {
        client: axios.create({
          baseURL: 'https://api-inference.huggingface.co/models',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
          }
        }),
        models: {
          'mistral-7b': { maxTokens: 32768, costPer1k: 0.0002 },
          'llama-2-70b': { maxTokens: 4096, costPer1k: 0.0007 }
        }
      };
      logger.info('Hugging Face provider initialized');
    }

    // Local LLM Configuration (e.g., Ollama)
    if (process.env.LOCAL_LLM_URL) {
      this.providers.local = {
        client: axios.create({
          baseURL: process.env.LOCAL_LLM_URL
        }),
        models: {
          'local-llama': { maxTokens: 8192, costPer1k: 0 }
        }
      };
      logger.info('Local LLM provider initialized');
    }
  }

  /**
   * Get provider client by name
   */
  getProvider(providerName) {
    if (!this.providers[providerName]) {
      throw new Error(`Provider ${providerName} not configured or available`);
    }
    return this.providers[providerName];
  }

  /**
   * List available providers
   */
  getAvailableProviders() {
    return Object.keys(this.providers).filter(key => this.providers[key] !== null);
  }

  /**
   * Get provider for specific agent type with fallback
   */
  getAgentProvider(agentType) {
    const agentProviderMap = {
      'trend-analysis': process.env.TREND_AGENT_LLM || 'openai',
      'research': process.env.RESEARCH_AGENT_LLM || 'claude',
      'content': process.env.CONTENT_AGENT_LLM || 'openai',
      'editorial': process.env.EDITORIAL_AGENT_LLM || 'claude'
    };

    const preferredProvider = agentProviderMap[agentType] || 'openai';
    
    if (this.providers[preferredProvider]) {
      return { provider: preferredProvider, client: this.providers[preferredProvider] };
    }

    // Fallback to first available provider
    const availableProviders = this.getAvailableProviders();
    if (availableProviders.length > 0) {
      const fallbackProvider = availableProviders[0];
      logger.warn(`Preferred provider ${preferredProvider} not available for ${agentType}, using ${fallbackProvider}`);
      return { provider: fallbackProvider, client: this.providers[fallbackProvider] };
    }

    throw new Error(`No LLM providers available for agent type: ${agentType}`);
  }
}

// Singleton instance
export const llmManager = new LLMProviderManager();