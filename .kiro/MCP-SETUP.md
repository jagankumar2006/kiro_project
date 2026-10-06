# Model Context Protocol (MCP) Setup Guide

This guide explains how to configure MCP servers for your Student Todo project.

## About MCP

Model Context Protocol allows Kiro to extend its capabilities by connecting to external MCP servers for:
- Database query execution (SQLite)
- Filesystem operations
- GitHub integration
- Web search
- Content fetching

## MCP Configuration Locations

MCP can be configured at multiple levels with the following precedence:
1. **Workspace-level** (highest priority): `.kiro/settings/mcp.json` in current workspace
2. **User-level**: `~/.kiro/settings/mcp.json` (global/cross-workspace)

## Recommended MCP Servers for This Project

### 1. SQLite MCP Server (Recommended ✅)
Allows direct database queries and management.

```json
{
  "command": "uvx",
  "args": ["mcp-server-sqlite", "--db-path", "student-todo/data/tasks.db"],
  "disabled": false
}
```

**Features**:
- Query tasks database
- Inspect schema
- Debug data issues
- Run migrations

### 2. Filesystem MCP Server (Recommended ✅)
Enables safe filesystem browsing and operations.

```json
{
  "command": "uvx",
  "args": ["mcp-server-filesystem", "--base-dir", "."],
  "disabled": false
}
```

**Features**:
- Browse project files
- Search content
- Analyze structure
- Safe file operations

### 3. Fetch MCP Server (Recommended ✅)
Allows fetching and analyzing web content.

```json
{
  "command": "uvx",
  "args": ["mcp-server-fetch"],
  "disabled": false
}
```

**Features**:
- Fetch documentation
- Analyze web content
- Get API responses
- Inspect external resources

### 4. GitHub MCP Server (Optional)
Requires GitHub authentication.

```json
{
  "command": "uvx",
  "args": ["mcp-server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
  },
  "disabled": true
}
```

**To enable**:
1. Generate a GitHub Personal Access Token
2. Set environment variable: `GITHUB_PERSONAL_ACCESS_TOKEN`
3. Change `"disabled": true` to `"disabled": false`

**Features**:
- Manage issues and PRs
- Access repository data
- Automate GitHub workflows

### 5. Web Search MCP Server (Optional)
Requires Brave Search API key.

```json
{
  "command": "uvx",
  "args": ["mcp-server-brave-search"],
  "env": {
    "BRAVE_API_KEY": "your-api-key-here"
  },
  "disabled": true
}
```

**To enable**:
1. Get Brave Search API key from https://api.search.brave.com
2. Set environment variable: `BRAVE_API_KEY`
3. Change `"disabled": true` to `"disabled": false`

**Features**:
- Web search capabilities
- Research current information
- Find solutions online

## Installation

### Prerequisites

You need `uv` and `uvx` installed:

```bash
# Using pip
pip install uv

# Using homebrew (macOS)
brew install uv

# Or follow: https://docs.astral.sh/uv/getting-started/installation/
```

### Verify Installation

```bash
uvx --version
```

## Configuration Steps

### Option 1: User-Level Configuration (Recommended for This Project)

Edit `~/.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "student-todo/data/tasks.db"],
      "disabled": false
    },
    "filesystem": {
      "command": "uvx",
      "args": ["mcp-server-filesystem", "--base-dir", "."],
      "disabled": false
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "disabled": false
    }
  }
}
```

### Option 2: Workspace-Level Configuration

Create `.kiro/settings/mcp.json` (if allowed by Kiro scope):

Same configuration as above, but scoped to this workspace only.

## Using MCP Servers in Kiro

Once configured, MCP servers provide additional capabilities:

1. **SQLite Queries**: Directly query your tasks database
   - "Show me the tasks schema"
   - "Get all tasks for user 1"
   - "Analyze slow queries"

2. **Filesystem Operations**: Browse and analyze project structure
   - "List all test files"
   - "Search for TODO comments"
   - "Find unused imports"

3. **Fetch Content**: Get web resources
   - "Fetch Express.js documentation"
   - "Get JWT best practices guide"
   - "Retrieve latest security advisories"

4. **GitHub Integration** (when enabled):
   - "Create an issue for this bug"
   - "List open PRs"
   - "Add comment to issue #123"

## Troubleshooting

### MCP servers not connecting

```bash
# Check if uvx is installed
uvx --version

# Test a specific server
uvx mcp-server-sqlite --help

# Check Kiro logs for error messages
```

### Database access denied

Ensure the database path is correct:
- File exists: `student-todo/data/tasks.db`
- Path is relative to workspace root
- File permissions allow reading

### API key issues

For GitHub and Web Search servers:
1. Double-check your API key
2. Ensure environment variables are set correctly
3. Test the API key independently
4. Check Kiro logs for auth errors

## Security Considerations

✅ **Best Practices**:
- Keep API keys in environment variables, not in files
- Disable servers you don't use
- Use workspace-level config to limit scope
- Review MCP server permissions
- Keep `uv` and MCP servers updated

❌ **Don't Do**:
- Commit API keys to git
- Use overly permissive filesystem paths
- Enable unnecessary MCP servers
- Share configuration with sensitive credentials

## Next Steps

1. Install `uv`: `pip install uv` or `brew install uv`
2. Configure MCP servers in `~/.kiro/settings/mcp.json`
3. Restart Kiro to load MCP servers
4. Test by asking Kiro about your database or project files
5. Enable additional servers as needed

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [uv Installation](https://docs.astral.sh/uv/getting-started/installation/)
- [MCP Server Gallery](https://github.com/modelcontextprotocol/servers)
- [Kiro MCP Documentation](https://kiro.dev)