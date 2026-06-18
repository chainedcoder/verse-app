import { AIProvider } from './interfaces';
import { GeminiProvider } from './providers/GeminiProvider';
import { OpenRouterProvider } from './providers/OpenRouterProvider';

export class AIFactory {
  static getProvider(): AIProvider {
    const providerConfig = process.env.ACTIVE_AI_PROVIDER || 'gemini';
    
    switch (providerConfig) {
      case 'openrouter':
        return new OpenRouterProvider();
      case 'gemini':
      default:
        return new GeminiProvider();
    }
  }
}
