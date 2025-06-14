# C3Chat - Advanced AI Chat Interface

C3Chat is a comprehensive AI chat application that provides a unified interface for multiple AI models including GPT-4, Claude, Gemini, and more. Built with Next.js, TypeScript, and modern web technologies.

## Features

- 🤖 **Multiple AI Models** - Chat with GPT-4, Claude, Gemini, and more
- 🔍 **Web Search Integration** - Get real-time information with built-in web search
- 🔐 **Secure Authentication** - Google OAuth integration with NextAuth.js
- 💾 **Chat Management** - Save, organize, and manage your conversations
- 🔑 **API Key Management** - Use your own API keys for unlimited usage
- 📤 **Share Conversations** - Share interesting chats via secure links
- 📁 **File Upload** - Upload documents for enhanced conversations (coming soon)
- 🎨 **Modern UI** - Beautiful, responsive interface with dark theme
- 🔒 **Privacy Focused** - Your data stays secure with enterprise-grade authentication

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Database (PostgreSQL recommended)
- Google OAuth credentials
- AI API keys (optional, 10 free chats included)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/c3-chat.git
   cd c3-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Configure the following variables in `.env`:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/c3chat"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # AI API Keys (optional - for fallback)
   OPENAI_API_KEY="your-openai-key"
   ANTHROPIC_API_KEY="your-anthropic-key"
   GOOGLE_AI_API_KEY="your-google-ai-key"

   # Web Search (optional)
   SERP_API_KEY="your-serp-api-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Documentation

### Authentication Endpoints

#### `GET/POST /api/auth/[...nextauth]`
NextAuth.js authentication endpoints for Google OAuth.

**Usage:**
- Automatic handling by NextAuth.js
- Redirects to `/chat` after successful authentication

### Chat API Endpoints

#### `POST /api/chat`
Send a message and receive an AI response.

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello, how are you?"}
  ],
  "provider": "gemini-2-flash",
  "chatId": "optional-existing-chat-id",
  "title": "Optional chat title",
  "search": false
}
```

**Response:**
```json
{
  "reply": "AI response text",
  "chatId": "chat-id",
  "searchResults": null
}
```

**Example:**
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'What is AI?' }],
    provider: 'gpt-4-turbo',
    title: 'AI Discussion'
  })
});
```

#### `GET /api/chat`
Fetch chat messages or all user chats.

**Query Parameters:**
- `chatId` (optional): Specific chat ID to fetch messages for

**Response:**
- With `chatId`: `{"messages": [...]}`
- Without `chatId`: `{"chats": [...]}`

**Examples:**
```javascript
// Get all chats
const chats = await fetch('/api/chat').then(r => r.json());

// Get messages for specific chat
const messages = await fetch('/api/chat?chatId=123').then(r => r.json());
```

#### `DELETE /api/chat`
Delete all chats for the authenticated user.

**Response:**
```json
{"success": true}
```

#### `DELETE /api/chat/[chatId]`
Delete a specific chat by ID.

**Parameters:**
- `chatId`: ID of the chat to delete

**Response:**
```json
{"success": true}
```

### Chat Sharing API

#### `POST /api/share-chat/[chatId]`
Create a shareable link for a chat.

**Parameters:**
- `chatId`: ID of the chat to share

**Response:**
```json
{"shareToken": "unique-token"}
```

**Example:**
```javascript
const response = await fetch(`/api/share-chat/${chatId}`, {
  method: 'POST'
});
const { shareToken } = await response.json();
const shareUrl = `${window.location.origin}/shared/${shareToken}`;
```

#### `GET /api/shared-chat/[token]`
Retrieve a shared chat using its token.

**Parameters:**
- `token`: Share token for the chat

**Response:**
```json
{
  "chat": {
    "id": "chat-id",
    "title": "Chat title",
    "userId": "user-id",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### User API Key Management

#### `POST /api/user-api-key`
Save or update a user's API key for a specific provider.

**Request Body:**
```json
{
  "apiKey": "your-api-key",
  "provider": "openai"
}
```

**Response:**
```json
{"success": true}
```

**Supported Providers:**
- `openai` - OpenAI (GPT models)
- `anthropic` - Anthropic (Claude models)
- `google` - Google (Gemini models)

### File Upload API (Coming Soon)

#### `POST /api/upload`
Upload and process documents for enhanced conversations.

**Request:**
- FormData with `file` field containing the document

**Supported Formats:**
- PDF (.pdf)
- Text files (.txt, .md)
- Microsoft Word (.doc, .docx)
- CSV (.csv)
- JSON (.json)

**Response:**
```json
{"success": true}
```

## Frontend Usage

### Chat Context

The app uses React Context for state management. Wrap your app with `ChatProvider`:

```jsx
import { ChatProvider } from '@/contexts/ChatContext';

function App() {
  return (
    <ChatProvider>
      {/* Your app components */}
    </ChatProvider>
  );
}
```

### Using the Chat Context

```jsx
import { useChatContext } from '@/contexts/ChatContext';

function ChatComponent() {
  const {
    state,
    sendMessage,
    createNewChat,
    deleteChat,
    shareChat,
    switchToChat,
    saveApiKey
  } = useChatContext();

  // Send a message
  const handleSend = async () => {
    await sendMessage('Hello AI!', 'New Chat');
  };

  // Create new chat
  const handleNewChat = () => {
    createNewChat();
  };

  // Switch to existing chat
  const handleSwitchChat = async (chatId) => {
    await switchToChat(chatId);
  };

  return (
    <div>
      {/* Chat UI */}
    </div>
  );
}
```

### Available Components

#### `<ChatInterface />`
Main chat interface with full functionality.

#### `<ChatSidebar />`
Sidebar for chat history and settings management.

```jsx
<ChatSidebar 
  isOpen={sidebarOpen}
  onToggle={() => setSidebarOpen(!sidebarOpen)}
/>
```

#### `<ApiKeyManager />`
Modal for managing user API keys.

```jsx
<ApiKeyManager
  isOpen={showManager}
  onClose={() => setShowManager(false)}
/>
```

#### `<FileUpload />`
File upload modal for document processing.

```jsx
<FileUpload
  isOpen={showUpload}
  onClose={() => setShowUpload(false)}
  onFileUploaded={(file) => console.log('Uploaded:', file)}
/>
```

#### `<MessageBubble />`
Individual message display with actions.

```jsx
<MessageBubble
  message={message}
  onCopy={(content) => console.log('Copied:', content)}
  onReaction={(id, reaction) => console.log('Reaction:', reaction)}
  onShare={(id) => console.log('Share message:', id)}
/>
```

## Models and Providers

### Supported Models

| Model | Provider | Context Window | Features |
|-------|----------|----------------|----------|
| GPT-4 Turbo | OpenAI | 128k tokens | Advanced reasoning, vision |
| GPT-4 | OpenAI | 8k tokens | Advanced reasoning |
| GPT-3.5 Turbo | OpenAI | 16k tokens | Fast, cost-effective |
| Claude 3 Opus | Anthropic | 200k tokens | Most capable, multimodal |
| Claude 3 Sonnet | Anthropic | 200k tokens | Balanced performance |
| Claude 3 Haiku | Anthropic | 200k tokens | Fast responses |
| Gemini 2.0 Flash | Google | 1M tokens | Multimodal, fast |
| Gemini Pro | Google | 32k tokens | Code generation |

### Model Selection

Models can be selected in the UI or specified in API calls:

```javascript
// In API call
{
  "provider": "gpt-4-turbo",
  "messages": [...]
}

// In React component
const { dispatch } = useChatContext();
dispatch({ type: 'SET_SELECTED_MODEL', payload: 'claude-3-opus' });
```

## Rate Limits and Usage

### Free Usage
- 10 free chats per user
- After limit reached, users must provide API keys

### With API Keys
- Unlimited usage based on your API provider limits
- Your own rate limits apply

### Rate Limits by Model
- GPT-3.5 Turbo: 3,500 RPM
- GPT-4 Turbo: 500 RPM
- GPT-4: 200 RPM
- Claude models: 50 RPM
- Gemini 2.0 Flash: 300 RPM
- Gemini Pro: 60 RPM

## Security and Privacy

### Authentication
- Google OAuth 2.0 integration
- JWT session management
- Secure redirects and callbacks

### Data Protection
- API keys encrypted at rest
- Chat data isolated per user
- No conversation data shared between users

### API Key Security
- Keys stored encrypted in database
- Never exposed in client-side code
- Used only for authorized user requests

## Development

### Project Structure

```
c3-chat/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── chat/           # Chat page
│   │   ├── shared/         # Shared chat viewer
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── chat/          # Chat-specific components
│   │   └── ui/            # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── constants/         # App constants
├── prisma/                # Database schema
└── public/               # Static assets
```

### Database Schema

The app uses Prisma with PostgreSQL:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  chats     Chat[]
  apiKeys   UserApiKey[]
  freeChatCount Int @default(0)
}

model Chat {
  id         String    @id @default(cuid())
  title      String
  userId     String
  user       User      @relation(fields: [userId], references: [id])
  messages   Message[]
  shareToken String?   @unique
  isDeleted  Boolean   @default(false)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model Message {
  id        String   @id @default(cuid())
  chatId    String
  chat      Chat     @relation(fields: [chatId], references: [id])
  role      String
  content   String
  provider  String
  createdAt DateTime @default(now())
}

model UserApiKey {
  id       String @id @default(cuid())
  userId   String
  user     User   @relation(fields: [userId], references: [id])
  provider String
  apiKey   String
  @@unique([userId, provider])
}
```

### Adding New Models

1. **Update constants:**
   ```typescript
   // src/constants/models.ts
   export const CHAT_MODELS: ChatModel[] = [
     // ... existing models
     {
       id: "new-model",
       name: "New Model",
       provider: "Provider",
       description: "Model description"
     }
   ];
   ```

2. **Update AI handler:**
   ```typescript
   // src/app/lib/ai/ai-handler.ts
   // Add new model support
   ```

3. **Test the integration:**
   ```bash
   npm run dev
   ```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Testing

```bash
# Run tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Deployment

### Environment Setup

Ensure all environment variables are configured:

```env
# Production URLs
NEXTAUTH_URL="https://your-domain.com"
DATABASE_URL="your-production-db-url"

# API Keys
GOOGLE_CLIENT_ID="prod-client-id"
GOOGLE_CLIENT_SECRET="prod-client-secret"
NEXTAUTH_SECRET="strong-production-secret"
```

### Deploy to Vercel

1. **Connect repository to Vercel**
2. **Configure environment variables**
3. **Deploy:**
   ```bash
   npm run build
   vercel --prod
   ```

### Database Migration

```bash
# Generate and apply migrations
npx prisma migrate deploy
```

## Troubleshooting

### Common Issues

**Authentication not working:**
- Check Google OAuth credentials
- Verify NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is set

**API calls failing:**
- Verify API keys are correctly configured
- Check rate limits
- Review network connectivity

**Database errors:**
- Ensure DATABASE_URL is correct
- Run database migrations
- Check database permissions

**Model not responding:**
- Verify API key for the provider
- Check model availability
- Review error logs

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
DEBUG=true
```

### Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with Next.js and React
- UI components from shadcn/ui
- Icons from Lucide React
- Authentication via NextAuth.js
- Database with Prisma ORM