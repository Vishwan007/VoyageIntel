# MaritimeAI Assistant

## Overview

MaritimeAI is a specialized AI-powered chat assistant designed for the maritime industry. The application provides intelligent document analysis, maritime knowledge management, and real-time assistance for shipping operations. Built as a full-stack web application, it combines modern web technologies with AI capabilities to help maritime professionals with tasks like laytime calculations, charter party analysis, weather routing, and document processing.

The system follows a modular architecture with clear separation between frontend user interface, backend API services, AI processing capabilities, and data storage. It's designed to handle complex maritime workflows including document upload and analysis, conversation management, and integration with maritime-specific knowledge bases.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, providing a responsive and interactive user interface. The frontend uses:

- **Component Architecture**: Modular React components with a clear separation of concerns
- **UI Framework**: Radix UI components with Tailwind CSS for styling, following the "new-york" shadcn/ui theme
- **State Management**: TanStack Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Build System**: Vite for fast development and optimized production builds

The frontend is structured around a chat-based interface with support for document uploads, conversation history, and maritime-specific tools.

### Backend Architecture
The server-side application follows a RESTful API design pattern:

- **Framework**: Express.js with TypeScript for type safety
- **API Design**: RESTful endpoints for conversations, messages, documents, and maritime knowledge
- **File Handling**: Multer middleware for document uploads with support for PDF, Word, and text files
- **Middleware**: Custom logging, error handling, and request processing middleware

### Database and Storage Design
The application uses a PostgreSQL database with Drizzle ORM for type-safe database operations:

- **Schema Design**: Well-structured tables for conversations, messages, documents, and maritime knowledge
- **Data Relationships**: Foreign key relationships between conversations and messages
- **Database Migration**: Drizzle Kit for schema management and migrations
- **Connection**: Neon Database serverless PostgreSQL with connection pooling

### AI and Knowledge Processing
The system integrates OpenAI's GPT-4 for intelligent query analysis and response generation:

- **Query Analysis**: Automatic categorization of maritime queries (laytime, weather, distance, etc.)
- **Document Processing**: AI-powered document summarization and type classification
- **Maritime Knowledge**: Specialized knowledge base for maritime calculations and regulations
- **Response Generation**: Context-aware responses tailored to maritime industry needs

### Authentication and Session Management
Session management is handled through:

- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **Security**: Secure session cookies with proper configuration

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18+ with TypeScript support, React DOM, and React Query for state management
- **Express.js**: Node.js web framework for the backend API
- **Database**: PostgreSQL with Neon Database serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations with PostgreSQL dialect

### UI and Styling
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS for utility-first styling approach
- **Icons**: Lucide React for consistent iconography
- **Form Handling**: React Hook Form with Hookform Resolvers for form validation

### AI and Machine Learning
- **OpenAI API**: GPT-4 integration for natural language processing and generation
- **Document Processing**: Support for PDF, Word, and text document analysis

### Development and Build Tools
- **TypeScript**: Full TypeScript support across frontend and backend
- **Vite**: Modern build tool for fast development and production builds
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility
- **ESBuild**: Fast JavaScript bundler for production builds

### File Upload and Processing
- **Multer**: Middleware for handling multipart/form-data file uploads
- **File Type Support**: PDF, Microsoft Word documents, and plain text files

### Validation and Schema
- **Zod**: Runtime type validation and schema definition
- **Drizzle Zod**: Integration between Drizzle ORM and Zod for consistent schemas

The application is designed to run in both development and production environments with environment-specific configurations for database connections, API keys, and build optimizations.