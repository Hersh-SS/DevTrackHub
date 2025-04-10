# DevTrackHub

DevTrackHub is a full-stack ticket tracking and deployment dashboard designed to simulate an agile software development workflow. It supports end-to-end ticket lifecycle management, integrates CI/CD-inspired features, and incorporates a built-in AI assistant powered by Hugging Face’s Mistral-7B model to support developer queries.

Built with React + TypeScript on the frontend and Flask + PostgreSQL on the backend, DevTrackHub is production-deployed via Vercel and Render.

## Project Overview

DevTrackHub offers a streamlined simulation of how development teams manage tickets, track progress, and collaborate with automation and AI support. It was created to showcase backend engineering, API design, and deployment best practices for internship and junior developer roles.

## Key Features

### Ticket Management
- Create, edit, delete, and advance tickets through four defined stages:
  - To Do → In Progress → Testing → Deployed
- Inline actions and responsive layout.
- Fixed-width columns with independent scroll behavior.
- Status-based visual indicators.

### Dark Mode
- Toggle between light and dark themes.
- Includes smooth transitions and consistent theming.

### AI Chat Integration
- Ask contextual questions about tickets, project summaries, or next steps.
- Messages are routed through the Flask API and processed via Hugging Face’s Mistral-7B-Instruct model.

### Live Deployment
- Frontend hosted publicly on Vercel.
- Backend deployed to Render with PostgreSQL database.
- Clean modular Flask architecture with CORS, blueprints, and environment variable support.

To view the application, visit the link provided in the GitHub repository.

## Tech Stack

### Frontend
- React (Vite + TypeScript)
- React Toastify (notifications)
- Deployed to Vercel

### Backend
- Flask (Python)
- PostgreSQL (via SQLAlchemy)
- Hugging Face Transformers API (Mistral-7B)
- Deployed to Render

## API Reference

| Method | Endpoint                     | Description                          |
|--------|------------------------------|--------------------------------------|
| GET    | `/api/tickets/`              | Retrieve all tickets                 |
| POST   | `/api/tickets/`              | Create a new ticket                  |
| PATCH  | `/api/tickets/<id>`          | Update ticket title and status       |
| DELETE | `/api/tickets/<id>`          | Delete a ticket                      |
| POST   | `/api/tickets/<id>/advance`  | Move ticket to next status stage     |
| POST   | `/api/chat`                  | Proxy chat input to Mistral-7B model |

## Usage Instructions

1. Open the deployed app using the Vercel-hosted link.
2. Use the input form to create new tickets.
3. Manage tickets by:
   - Editing inline.
   - Deleting them directly.
   - Advancing them across stages.
4. Use the integrated chatbox to ask about project status or suggested next actions. The AI assistant will respond contextually based on your queries.

## Acknowledgements

- Hugging Face for providing the Mistral-7B-Instruct model.
- Vercel and Render for reliable deployment platforms.
- PostgreSQL for database services.
- react-toastify for feedback UI components.