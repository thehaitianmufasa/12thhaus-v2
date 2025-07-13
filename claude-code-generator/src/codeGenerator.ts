import axios from 'axios';
import dotenv from 'dotenv';
import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Interface definitions
interface ClaudeMessage {
  role: string;
  content: string;
}

interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
}

interface CodeGenerationOptions {
  prompt: string;
  outputFile?: string;
  model?: string;
}

/**
 * Main code generation class that handles Claude API interactions
 */
class CodeGenerator {
  private readonly apiKey: string;
  private readonly apiEndpoint: string;
  private readonly defaultModel: string;

  constructor() {
    // Validate environment variables
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY environment variable is required');
    }

    this.apiKey = process.env.CLAUDE_API_KEY;
    this.apiEndpoint = process.env.CLAUDE_API_ENDPOINT || 'https://api.anthropic.com/v1/messages';
    this.defaultModel = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
  }

  /**
   * Generate code using Claude API
   */
  async generateCode(options: CodeGenerationOptions): Promise<string> {
    try {
      console.log('🤖 Generating code with Claude...');
      
      // Enhance prompt with SOP awareness
      const enhancedPrompt = this.enhancePromptWithSOP(options.prompt);

      const messages: ClaudeMessage[] = [
        {
          role: 'user',
          content: enhancedPrompt
        }
      ];

      const response = await axios.post<ClaudeResponse>(
        this.apiEndpoint,
        {
          model: options.model || this.defaultModel,
          max_tokens: 1000,
          temperature: 0.7,
          messages: messages
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
        }
      );

      const generatedCode = response.data.content[0].text.trim();

      // Save to file if outputFile is specified
      if (options.outputFile) {
        await this.saveToFile(generatedCode, options.outputFile);
      }

      return generatedCode;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data || error.message);
        throw new Error(`API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Enhance the prompt with SOP awareness
   */
  private enhancePromptWithSOP(prompt: string): string {
    return `As a Code Generation Agent following Standard Operating Procedures:
- Generate clean, efficient, and well-documented code
- Include error handling and input validation
- Follow coding best practices and standards
- Ensure code is testable and maintainable
- Add helpful comments

Task: ${prompt}

Please provide the implementation:`;
  }

  /**
   * Save generated code to file
   */
  private async saveToFile(code: string, filePath: string): Promise<void> {
    try {
      const absolutePath = path.resolve(filePath);
      await fs.promises.writeFile(absolutePath, code);
      console.log(`✅ Code saved to: ${absolutePath}`);
    } catch (error) {
      throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// CLI setup
program
  .version('1.0.0')
  .description('Claude API Code Generator')
  .requiredOption('-p, --prompt <prompt>', 'Code generation prompt')
  .option('-o, --output <file>', 'Output file path')
  .option('-m, --model <model>', 'Claude model to use')
  .parse(process.argv);

const options = program.opts();

// Main execution
async function main() {
  try {
    const generator = new CodeGenerator();
    const result = await generator.generateCode({
      prompt: options.prompt,
      outputFile: options.output,
      model: options.model,
    });

    if (!options.output) {
      console.log('\n🎉 Generated Code:');
      console.log('='.repeat(50));
      console.log(result);
      console.log('='.repeat(50));
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { CodeGenerator, CodeGenerationOptions };