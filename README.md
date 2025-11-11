# AI Creative Writing Partner

An AI-powered creative suite designed to assist writers and creators. This application combines a versatile chatbot, an intelligent image analyzer, and a powerful story starter to spark your imagination and overcome creative blocks.

## Features

### 📖 Story Starter
- **Image-to-Story:** Upload an image and instantly get a compelling opening paragraph for a story.
- **Genre & Style Selection:** Tailor the AI's writing by choosing from a variety of genres (e.g., Fantasy, Sci-Fi) and styles (e.g., Poetic, Gritty).
- **Continue Writing:** Seamlessly continue the narrative with AI-generated paragraphs that maintain context, tone, and style.
- **Inspiration Prompts:** Overcome writer's block with a set of AI-generated questions and prompts relevant to your story.
- **Read Aloud:** Listen to your generated story with an expressive AI voice using Text-to-Speech (TTS).

### 🖼️ Image Analyzer
- **Detailed Analysis:** Upload any image and provide a prompt to receive a detailed analysis or description from the AI.
- **Versatile:** Use it to understand complex images, describe scenes, or brainstorm ideas based on visual input.

### 💬 Chatbot
- **Conversational AI:** Engage in a natural conversation with a helpful AI assistant for brainstorming, asking questions, or general chat.
- **Context-Aware:** The chatbot remembers the conversation history to provide relevant responses.

## How to Use

1.  **Select a Tool:** Use the tabs at the top to switch between "Story Starter," "Image Analyzer," and "Chatbot."

2.  **Story Starter:**
    - Click the upload area to select an image from your device.
    - Choose your desired genre and writing style from the dropdown menus.
    - Click the **"Generate Story"** button.
    - Once the story appears, use **"Continue Writing"** to add more paragraphs or **"Read Aloud"** to listen to the narration.

3.  **Image Analyzer:**
    - Switch to the "Image Analyzer" tab.
    - Upload an image.
    - Edit the prompt in the text area to guide the AI's analysis.
    - Click **"Analyze Image"** to see the result.

4.  **Chatbot:**
    - Go to the "Chatbot" tab.
    - Type your message in the input field at the bottom.
    - Press Enter or click the send button to get a response.

## Technology Stack

- **Frontend:** React, Tailwind CSS
- **AI Engine:** Google Gemini API
  - `gemini-2.5-flash` for chat, image analysis, and story generation.
  - `gemini-2.5-flash-preview-tts` for Text-to-Speech functionality.
