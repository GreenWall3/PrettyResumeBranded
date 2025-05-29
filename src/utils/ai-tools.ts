import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createGroq } from '@ai-sdk/groq';
import { LanguageModelV1 } from 'ai';
// import { createDeepSeek } from '@ai-sdk/deepseek';

export type ApiKey = {
  service: string;
  key: string;
  addedAt: string;
};

export type AIConfig = {
  model: string;
  apiKeys: Array<ApiKey>;
};

/**
 * Initializes an AI client based on the provided configuration
 * Falls back to default OpenAI configuration if no config is provided
 */
export function initializeAIClient(config?: AIConfig, isPro?: boolean, useThinking?: boolean) {
  // Handle Pro subscription with environment variables
  if (isPro && config) {
    const { model } = config;

    // if (useThinking) {
    //   return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })('o1-mini');
    // }
    
    if (model.startsWith('claude')) {
      if (!process.env.ANTHROPIC_API_KEY) throw new Error('Anthropic API key not found');
      return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY,  })(model) as LanguageModelV1;
    }

    if (model.startsWith('gemini')) {
      if (!process.env.GEMINI_API_KEY) throw new Error('Google API key not found');
      return createGoogleGenerativeAI ({ apiKey: process.env.GEMINI_API_KEY })(model) as LanguageModelV1;
    }

    if (model.startsWith('deepseek')) {
      if (!process.env.DEEPSEEK_API_KEY) throw new Error('DeepSeek API key not found');
      return createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY })(model) as LanguageModelV1;
    }

    if (model.startsWith('gemma')) {
      if (!process.env.GROQ_API_KEY) throw new Error('Groq API key not found');
      return createGroq({ apiKey: process.env.GROQ_API_KEY })(model) as LanguageModelV1;
    }

    void useThinking;
    // if (model.startsWith('deepseek')) {
    //   if (!process.env.DEEPSEEK_API_KEY) throw new Error('DeepSeek API key not found');
    //   return createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY })(model);
    // }

    // Default to Gemini for Pro users (same as free users)
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API key not found');
    return createGoogleGenerativeAI({ 
      apiKey: process.env.GEMINI_API_KEY,
    })('gemini-2.0-flash') as LanguageModelV1;
  }

  // When no config is provided or for free users without API keys, use Gemini as default
  if (!config || config.apiKeys.length === 0) {
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API key not found');
    return createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })('gemini-2.0-flash') as LanguageModelV1;
  }

  // If user provided API keys, use them as before
  const { model, apiKeys } = config;
  
  if (model.startsWith('claude')) {
    const anthropicKey = apiKeys.find(k => k.service === 'anthropic')?.key;
    if (!anthropicKey) throw new Error('Anthropic API key not found');
    return createAnthropic({ apiKey: anthropicKey })(model) as LanguageModelV1;
  }

  if (model.startsWith('gemini')) {
    // Prioritize user-provided key, but fall back to environment key if available
    const googleKey = apiKeys.find(k => k.service === 'google')?.key;
    if (!googleKey && !process.env.GEMINI_API_KEY) throw new Error('Google API key not found');
    return createGoogleGenerativeAI({ 
      apiKey: googleKey || process.env.GEMINI_API_KEY 
    })(model) as LanguageModelV1;
  }
  
  if (model.startsWith('deepseek')) {
    const deepseekKey = apiKeys.find(k => k.service === 'deepseek')?.key;
    if (!deepseekKey) throw new Error('DeepSeek API key not found');
    return createDeepSeek({ apiKey: deepseekKey })(model) as LanguageModelV1;
  }
  
  if (model.startsWith('gemma')) {
    const groqKey = apiKeys.find(k => k.service === 'groq')?.key;
    if (!groqKey) throw new Error('Groq API key not found');
    return createGroq({ apiKey: groqKey })(model) as LanguageModelV1;
  }
  
  const openaiKey = apiKeys.find(k => k.service === 'openai')?.key;
  if (!openaiKey) throw new Error('OpenAI API key not found');
  return createOpenAI({ apiKey: openaiKey })(model) as LanguageModelV1;
}
