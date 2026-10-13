# ContentFlow — AI Content Repurposing Factory

Turn one idea into multiple platform-ready content drafts with AI-powered automation.

ContentFlow is a web application that helps creators, developers, and businesses repurpose existing content into platform-specific drafts. It combines a modern Next.js interface with an n8n automation workflow and an AI model accessed through OpenRouter.

Instead of manually rewriting the same idea for every social media platform, users can submit their original content, select their target platforms, choose a tone, and generate tailored drafts from one workspace.

## Features

- **AI-powered content generation** — transform original content into platform-specific drafts.
- **Multi-platform support** — generate drafts for LinkedIn and X, with additional platform options in the interface.
- **Customizable output** — configure tone, language, and target audience.
- **Draft regeneration** — regenerate individual platform drafts when you want another version.
- **Copy-ready content** — copy generated drafts for editing or publishing.
- **Content preview** — review generated drafts directly in the workspace.
- **Download support** — access the application's draft download feature.
- **Workflow automation** — process requests through an n8n webhook.
- **Backend health status** — check whether the configured n8n service is responding.
- **Responsive dark interface** — a workspace designed for content creation and review.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Web application and API routes |
| React | User interface |
| TypeScript | Type-safe application development |
| Tailwind CSS | Interface styling |
| n8n | Workflow orchestration and automation |
| OpenRouter | Access to AI language models |
| Vercel | Web application deployment |
| Render | Hosted n8n workflow service |

## How It Works

1. **Submit content** — paste an article, transcript, idea, or existing post.
2. **Select platforms** — choose where you want to adapt the content.
3. **Configure preferences** — set the tone, language, and optional audience.
4. **Run the workflow** — the frontend sends the request to the application's API, which communicates with n8n.
5. **Generate drafts** — n8n sends the content to the configured AI model through OpenRouter.
6. **Review and reuse** — inspect, regenerate, copy, or download the resulting drafts using the available interface features.

## Architecture

The application separates the frontend experience from the AI workflow.

- **Frontend:** Next.js and React provide the content editor, platform selector, and generated-draft preview.
- **API layer:** Next.js API routes handle content-generation requests and backend health checks.
- **Automation layer:** n8n validates incoming input and orchestrates the generation process.
- **AI integration:** OpenRouter provides access to the configured language model.
- **Deployment:** Vercel hosts the web application, while Render hosts the n8n service.

## Getting Started

### Prerequisites

- Node.js and npm
- An n8n instance with the content-repurposing workflow configured
- An OpenRouter API key and a supported model

### Installation

Clone the repository:

```bash
git clone https://github.com/belioautomation/ai-content-repurposing-factory.git
cd ai-content-repurposing-factory/web
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Configure the required environment variables in `.env.local` using your own deployment URLs and credentials. Refer to `.env.example` for the expected variable names.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Security

- Keep API keys and webhook secrets in environment variables.
- Never commit `.env.local` or other files containing credentials.
- Configure the n8n webhook authentication on both the client and server sides as appropriate.
- Set production environment variables separately in Vercel and your n8n hosting environment.
- Avoid exposing private credentials in client-side code or public logs.

## Project Goals

This project explores how full-stack web development and AI workflow automation can work together to create practical tools for content creators and businesses.

It demonstrates the integration of a web frontend, API routes, webhook-based automation, and large language models in one application.

## Future Improvements

- Add more social media platforms and output formats.
- Improve responsive spacing and workspace layout.
- Add richer draft editing and export options.
- Improve generation error handling and workflow monitoring.
- Expand content history and draft management.
- Add automated tests and additional input validation.

## Author

**Belio Sinangote**

- GitHub: [@belioautomation](https://github.com/belioautomation)

---

*Built to explore practical AI integration, full-stack development, and workflow automation.*
