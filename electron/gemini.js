import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function* streamMessageToGemini(userMessage, onChunk) {
  try {
    console.log('📤 Streaming message to Gemini:', userMessage);

    // Use Gemini 2.5 Flash with thinking mode enabled
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        thinkingConfig: {
          thinkingBudget: -1, // -1 = dynamic thinking (recommended)
        },
      },
    });

    // Generate content with streaming
    const result = await model.generateContentStream(userMessage);
    
    console.log('📥 Starting to receive streamed response from Gemini with thinking enabled');
    
    let thinkingComplete = false;
    let answerStarted = false;

    for await (const chunk of result.stream) {
      console.log('📦 Received chunk:', JSON.stringify(chunk, null, 2).substring(0, 200));
      
      const candidates = chunk.candidates;
      
      if (candidates && candidates.length > 0) {
        const parts = candidates[0].content.parts;
        
        for (const part of parts) {
          // Check if this part is thinking using the boolean flag
          if (part.thought === true) {
            // This is thinking/reasoning - text is in part.text
            const thinkingText = part.text || '';
            
            console.log('🧠 Thinking chunk:', thinkingText.substring(0, 100));
            
            yield {
              type: 'thinking',
              content: thinkingText,
              thinkingComplete: false,
            };
            
            if (onChunk) onChunk({ type: 'thinking', content: thinkingText });
          } else if (part.text) {
            // Mark thinking as complete when answer starts
            if (!answerStarted) {
              answerStarted = true;
              thinkingComplete = true;
              console.log('✅ Thinking complete, starting answer');
              
              yield {
                type: 'thinking_complete',
                thinkingComplete: true,
              };
              
              if (onChunk) onChunk({ type: 'thinking_complete' });
            }
            
            // This is the answer
            console.log('💬 Answer chunk:', part.text.substring(0, 100));
            
            yield {
              type: 'answer',
              content: part.text,
            };
            
            if (onChunk) onChunk({ type: 'answer', content: part.text });
          }
        }
      }
    }
    
    console.log('✅ Streaming complete');
    
    yield {
      type: 'done',
    };
    
    if (onChunk) onChunk({ type: 'done' });
    
  } catch (error) {
    console.error('❌ Error streaming from Gemini API:', error);
    
    yield {
      type: 'error',
      error: error.message,
    };
    
    if (onChunk) onChunk({ type: 'error', error: error.message });
  }
}

