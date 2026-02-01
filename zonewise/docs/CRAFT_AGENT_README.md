# Craft Agent UI - ZoneWise AI Chat Interface

## Overview

The Craft Agent UI is a sophisticated conversational interface for ZoneWise that enables users to interact with an AI assistant specialized in Brevard County zoning analysis. The system combines a modern chat interface with real-time data queries, tool calling, and visual activity tracking.

## Architecture

### Frontend Components

#### 1. **CraftAgentLayout** (`client/src/components/CraftAgentLayout.tsx`)
The main layout component implementing a 3-panel responsive design:

- **Left Sidebar**: Session list with search, filtering, and management
- **Center Panel**: Chat display with message history and input
- **Right Panel**: Property visualization (map, 3D, sun/shadow analysis)

**Key Features:**
- Session persistence (localStorage + database)
- Mobile-responsive with collapsible panels
- User authentication integration
- Session metadata (property address, jurisdiction, zoning)

#### 2. **ChatDisplay** (`client/src/components/chat/ChatDisplay.tsx`)
Handles message rendering and user input:

- **Turn-based grouping**: Groups user messages with AI responses
- **Markdown rendering**: Full GitHub-flavored markdown with syntax highlighting
- **Activity tracking**: Displays tool calls, API requests, and data operations
- **Streaming support**: Real-time response rendering
- **Code highlighting**: Syntax highlighting for code blocks with copy button

#### 3. **RightPanel** (`client/src/components/chat/RightPanel.tsx`)
Integrates property visualizations:

- **Property View**: Basic property information
- **Map View**: Satellite imagery with MapboxSatellite
- **3D View**: Building envelope visualization with BuildingEnvelope3D
- **Sun/Shadow**: Solar analysis with SunShadowAnalysis

### Backend Services

#### 1. **Chat Router** (`server/routers/chat.ts`)
tRPC procedures for chat operations:

- `getSessions`: List user's chat sessions
- `createSession`: Create new conversation
- `updateSession`: Update session metadata
- `deleteSession`: Remove session and messages
- `getMessages`: Retrieve conversation history
- `sendMessage`: Send message and get AI response with tool calling

#### 2. **Zoning Tools** (`server/tools/zoningTools.ts`)
LLM function calling tools for data retrieval:

**Available Tools:**
1. `search_zoning_districts` - Search by code or name
2. `get_jurisdictions` - List all Brevard County cities
3. `get_zoning_details` - Get full regulations for a district

**Tool Execution Flow:**
1. User sends message
2. LLM decides if tools are needed
3. Backend executes tool calls against Supabase
4. Results sent back to LLM
5. LLM generates final response with data
6. Tool calls saved to database for UI display

#### 3. **Supabase Integration** (`server/supabase.ts`)
Database queries for zoning data:

- `getAllJurisdictions()` - Get all active jurisdictions
- `getZoningDistricts(jurisdictionId)` - Get districts for a jurisdiction
- `searchZoningDistricts(query, jurisdictionId?)` - Search by code/name
- `extractDimensions(description)` - Parse embedded JSON from descriptions

### State Management

#### Frontend State
**useChatSessions Hook** (`client/src/hooks/useChatSessions.ts`):
- Manages sessions and messages
- Integrates tRPC queries and mutations
- Provides localStorage fallback for offline support
- Handles optimistic updates

**Key State:**
- `sessions`: Array of chat sessions
- `activeSessionId`: Currently selected session
- `messages`: Messages for active session
- `isLoading`: Loading state for mutations

#### Backend State
**Database Schema** (`drizzle/schema.ts`):

**chatSessions table:**
- `id`, `userId`, `title`
- `propertyAddress`, `jurisdiction`, `zoningDistrict`
- `messageCount`, `lastMessagePreview`
- `createdAt`, `updatedAt`

**chatMessages table:**
- `id`, `sessionId`, `role`
- `content`
- `attachmentsJson` - File attachments
- `metadataJson` - Tool calls, property IDs
- `createdAt`

## LLM Integration

### System Prompt
The AI is configured as "ZoneWise AI" with expertise in:
- Analyzing property addresses
- Explaining zoning codes and regulations
- Calculating building envelopes and setbacks
- Providing sun/shadow analysis insights
- Answering questions about permitted uses
- Helping with property comparison and development planning

### Tool Calling Workflow

1. **User Message** → Saved to database
2. **LLM Call #1** → With tools, decides if data needed
3. **Tool Execution** → Query Supabase for real data
4. **LLM Call #2** → With tool results, generates response
5. **Assistant Message** → Saved with tool metadata
6. **UI Display** → Shows response + collapsible tool activities

### Example Tool Call

```typescript
// User: "What's RS-1 zoning in Melbourne?"

// LLM decides to call tool:
{
  name: "search_zoning_districts",
  arguments: {
    query: "RS-1",
    jurisdiction_name: "Melbourne"
  }
}

// Tool executes against Supabase:
const districts = await searchZoningDistricts("RS-1", melbourneId)

// Returns:
{
  success: true,
  data: {
    districts: [{
      code: "RS-1",
      name: "Single Family Residential",
      jurisdiction: "Melbourne",
      dimensions: {
        min_lot_sqft: 7500,
        setbacks_ft: { front: 25, side: 7.5, rear: 20 },
        max_height_ft: 35
      }
    }]
  }
}

// LLM generates response with data:
"RS-1 (Single Family Residential) in Melbourne requires:
- Minimum lot size: 7,500 sq ft
- Setbacks: 25' front, 7.5' side, 20' rear
- Maximum height: 35 feet"
```

## Data Flow

### Message Send Flow
```
User Input
  ↓
useChatSessions.sendMessage()
  ↓
tRPC chat.sendMessage
  ↓
Save user message to DB
  ↓
invokeLLM() with tools
  ↓
[If tool calls needed]
  ↓
executeZoningTool() → Supabase
  ↓
invokeLLM() with results
  ↓
Save assistant message with metadata
  ↓
Return to frontend
  ↓
useChatSessions updates state
  ↓
ChatDisplay renders with activities
```

### Session Load Flow
```
Component Mount
  ↓
useChatSessions hook
  ↓
tRPC chat.getSessions
  ↓
Database query
  ↓
Parse JSON fields (metadata, attachments)
  ↓
Map to frontend types
  ↓
Update React state
  ↓
Render sessions list
  ↓
[User selects session]
  ↓
tRPC chat.getMessages
  ↓
Load conversation history
  ↓
Group into turns
  ↓
Extract tool calls from metadata
  ↓
Render messages + activities
```

## Key Features

### 1. Turn-Based Grouping
Messages are grouped into conversational turns (user message + AI response + activities). This provides a cleaner, more natural chat experience.

### 2. Activity Tracking
Tool calls and data operations are displayed as collapsible activities showing:
- Tool name and execution time
- Input parameters (args)
- Output data (results)
- Error messages if failed

### 3. Session Management
- Create unlimited sessions
- Search and filter by content
- Rename sessions
- Delete with cascade (removes all messages)
- Auto-save to localStorage as backup

### 4. Offline Support
The system gracefully degrades when the backend is unavailable:
- Falls back to localStorage for sessions/messages
- Shows simulated responses
- Syncs when connection restored

### 5. Mobile Responsive
- Collapsible sidebars
- Touch-friendly controls
- Optimized for small screens
- Bottom sheet navigation on mobile

## Environment Variables

### Required
```bash
# Database
DATABASE_URL=mysql://...

# Authentication
JWT_SECRET=...
OAUTH_SERVER_URL=...
VITE_APP_ID=...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# LLM
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
```

## Development

### Running Locally
```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start dev server
pnpm dev
```

### Testing Tool Calls
```bash
# Test Supabase connection
node -e "require('./server/supabase').testConnection()"

# Test tool execution
node -e "
const { executeZoningTool } = require('./server/tools/zoningTools');
executeZoningTool('search_zoning_districts', { query: 'RS-1' })
  .then(console.log);
"
```

## Deployment

### Database Migration
```bash
# Generate migration
pnpm db:generate

# Apply migration
pnpm db:push
```

### Environment Setup
1. Configure all environment variables
2. Verify Supabase connection
3. Test LLM integration
4. Run database migrations
5. Deploy to Manus or custom hosting

## Future Enhancements

### Planned Features
- [ ] Streaming responses (real-time token display)
- [ ] Voice input/output
- [ ] Property comparison mode
- [ ] Export conversations to PDF
- [ ] Share session links
- [ ] Collaborative sessions (team tier)
- [ ] Advanced search across all sessions
- [ ] Property bookmarking from chat
- [ ] Automated property analysis triggers

### Potential Tools
- [ ] `calculate_building_envelope` - Compute 3D envelope
- [ ] `compare_properties` - Side-by-side analysis
- [ ] `search_properties_by_criteria` - Find properties matching requirements
- [ ] `get_permit_history` - Historical permit data
- [ ] `analyze_sun_shadow` - Solar analysis for specific times

## Troubleshooting

### Tool Calls Not Showing
- Check `metadataJson` is being saved correctly
- Verify `getChatMessages()` parses JSON fields
- Ensure frontend maps `metadata` field
- Check browser console for errors

### Supabase Connection Fails
- Verify `SUPABASE_URL` and keys are correct
- Check network connectivity
- Test with `testConnection()` function
- Review Supabase dashboard for issues

### LLM Not Calling Tools
- Verify tools are passed to `invokeLLM()`
- Check `tool_choice` is set to `'auto'`
- Review system prompt for clarity
- Test with explicit tool-requiring queries

### Sessions Not Persisting
- Check database connection
- Verify tRPC mutations are working
- Test localStorage fallback
- Review browser console for errors

## Architecture Decisions

### Why tRPC?
- Type-safe end-to-end
- No manual API contracts
- Automatic client generation
- Built-in error handling

### Why Turn-Based Grouping?
- Cleaner visual hierarchy
- Natural conversation flow
- Easier to track context
- Better for activity display

### Why Two-Step LLM Calls?
- Required for tool calling pattern
- First call: decide tools needed
- Second call: generate response with data
- Enables rich, data-driven responses

### Why localStorage Fallback?
- Offline support
- Faster initial load
- Backup if backend down
- Better user experience

## Contributing

When extending the Craft Agent UI:

1. **Add new tools** in `server/tools/zoningTools.ts`
2. **Update system prompt** in `server/routers/chat.ts`
3. **Add UI features** in `client/src/components/chat/`
4. **Test thoroughly** with real data
5. **Update this documentation**
6. **Commit to GitHub** with clear messages

## License

Proprietary - ZoneWise AI Platform
