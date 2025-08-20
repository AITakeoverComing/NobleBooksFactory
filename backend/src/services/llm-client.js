import { llmManager } from '../config/llm-providers.js';
import logger from '../utils/logger.js';

/**
 * Universal LLM Client
 * Provides a unified interface for different LLM providers
 */

export class LLMClient {
  constructor(agentType) {
    this.agentType = agentType;
    const { provider, client } = llmManager.getAgentProvider(agentType);
    this.provider = provider;
    this.client = client;
    logger.info(`LLM Client initialized for ${agentType} using ${provider}`);
  }

  /**
   * Generate text completion
   */
  async generateCompletion(prompt, options = {}) {
    const {
      model = this.getDefaultModel(),
      maxTokens = 4000,
      temperature = 0.7,
      systemMessage = null
    } = options;

    try {
      switch (this.provider) {
        case 'openai':
          return await this.generateOpenAICompletion(prompt, {
            model,
            maxTokens,
            temperature,
            systemMessage
          });
          
        case 'claude':
          return await this.generateClaudeCompletion(prompt, {
            model,
            maxTokens,
            temperature,
            systemMessage
          });
          
        case 'huggingface':
          return await this.generateHuggingFaceCompletion(prompt, {
            model,
            maxTokens,
            temperature
          });
          
        case 'local':
          return await this.generateLocalCompletion(prompt, {
            model,
            maxTokens,
            temperature
          });
          
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      logger.error(`LLM generation failed for ${this.agentType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * OpenAI completion
   */
  async generateOpenAICompletion(prompt, options) {
    const messages = [];
    
    if (options.systemMessage) {
      messages.push({ role: 'system', content: options.systemMessage });
    }
    
    messages.push({ role: 'user', content: prompt });

    const response = await this.client.client.chat.completions.create({
      model: options.model,
      messages: messages,
      max_tokens: options.maxTokens,
      temperature: options.temperature
    });

    return {
      content: response.choices[0].message.content,
      model: options.model,
      usage: response.usage,
      provider: 'openai'
    };
  }

  /**
   * Claude completion
   */
  async generateClaudeCompletion(prompt, options) {
    const requestBody = {
      model: options.model,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      messages: []
    };

    if (options.systemMessage) {
      requestBody.system = options.systemMessage;
    }

    requestBody.messages.push({
      role: 'user',
      content: prompt
    });

    const response = await this.client.client.post('/messages', requestBody);

    return {
      content: response.data.content[0].text,
      model: options.model,
      usage: response.data.usage,
      provider: 'claude'
    };
  }

  /**
   * Hugging Face completion
   */
  async generateHuggingFaceCompletion(prompt, options) {
    const response = await this.client.client.post(`/${options.model}`, {
      inputs: prompt,
      parameters: {
        max_new_tokens: options.maxTokens,
        temperature: options.temperature,
        return_full_text: false
      }
    });

    return {
      content: response.data[0].generated_text,
      model: options.model,
      usage: { total_tokens: response.data[0].generated_text.length / 4 }, // Rough estimate
      provider: 'huggingface'
    };
  }

  /**
   * Local LLM completion
   */
  async generateLocalCompletion(prompt, options) {
    const response = await this.client.client.post('/api/generate', {
      model: options.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: options.temperature,
        num_predict: options.maxTokens
      }
    });

    return {
      content: response.data.response,
      model: options.model,
      usage: { total_tokens: response.data.eval_count || 0 },
      provider: 'local'
    };
  }

  /**
   * Get default model for current provider
   */
  getDefaultModel() {
    const defaults = {
      openai: 'gpt-4',
      claude: 'claude-3-sonnet',
      huggingface: 'mistral-7b',
      local: 'local-llama'
    };
    
    return defaults[this.provider] || 'gpt-3.5-turbo';
  }

  /**
   * Stream completion (for real-time updates)
   */
  async streamCompletion(prompt, options = {}, onChunk) {
    if (this.provider !== 'openai') {
      throw new Error('Streaming only supported for OpenAI currently');
    }

    const messages = [];
    
    if (options.systemMessage) {
      messages.push({ role: 'system', content: options.systemMessage });
    }
    
    messages.push({ role: 'user', content: prompt });

    const stream = await this.client.client.chat.completions.create({
      model: options.model || this.getDefaultModel(),
      messages: messages,
      max_tokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.7,
      stream: true
    });

    let fullContent = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        onChunk(content, fullContent);
      }
    }

    return {
      content: fullContent,
      model: options.model || this.getDefaultModel(),
      provider: 'openai'
    };
  }

  /**
   * Get provider information
   */
  getProviderInfo() {
    return {
      provider: this.provider,
      agentType: this.agentType,
      availableModels: Object.keys(this.client.models || {}),
      defaultModel: this.getDefaultModel()
    };
  }
}