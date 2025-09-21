# Football Training Session Planner

Professional web application for football coaches to create, manage, and export training session plans.

## Features

🏈 **Comprehensive Training Planning**
- Session metadata (date, time, duration, players count, load level)
- Multiple exercise types (warm-up, main, cool-down)
- Detailed exercise descriptions with coaching points
- Equipment tracking and area specifications

📷 **Visual Exercise Documentation**
- Upload diagrams and schemas for each exercise
- S3/MinIO integration for image storage
- Base64 fallback for offline usage

📄 **Professional PDF Export**
- Clean, professional training plan layout
- Includes all exercise details and images
- Cyrillic font support (Russian text)
- Ready for printing and sharing

🎨 **Modern User Interface**
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- Drag & drop exercise reordering
- Responsive design

🐳 **Containerized Development**
- Full Docker setup for easy deployment
- Hot module replacement for development
- Environment variable configuration

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd training-session-planner
```

2. **Set up environment variables**
```bash
# Copy example environment file
cp frontend/.env.example frontend/.env

# Edit the .env file with your S3 credentials (optional)
# If not configured, images will be stored as base64
```

3. **Start the application**
```bash
docker compose up
```

4. **Open in browser**
Navigate to `http://localhost:5173`

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# S3/MinIO Configuration (optional)
VITE_S3_URL=your_s3_endpoint
VITE_S3_ACCESS_KEY=your_access_key
VITE_S3_SECRET_KEY=your_secret_key
VITE_S3_API=s3v4
VITE_S3_PATH=auto
```

## Project Structure

```
training-session-planner/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── types/           # TypeScript type definitions
│   │   ├── store/           # Zustand state management
│   │   ├── services/        # External services (S3, etc.)
│   │   └── App.tsx
│   ├── public/
│   ├── Dockerfile.dev       # Development Docker image
│   └── package.json
├── docker-compose.yml       # Docker orchestration
├── CLAUDE.md               # Security guidelines for AI assistants
└── README.md
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **PDF Generation**: @react-pdf/renderer
- **Drag & Drop**: @dnd-kit/core
- **File Upload**: S3/MinIO integration
- **Containerization**: Docker, Docker Compose

## Key Components

- `GeneralDataForm` - Session metadata input
- `ExerciseCard` - Individual exercise editor with image upload
- `ExercisesList` - Drag & drop exercise management
- `TrainingPreview` - Live preview of the training plan
- `PDFDocument` - PDF generation and export

## Development

### Adding New Exercise Fields

1. Update the `Exercise` interface in `src/types/training.ts`
2. Add form fields in `ExerciseCard.tsx`
3. Include in PDF template in `PDFDocument.tsx`
4. Update store in `trainingStore.ts` if needed

### Customizing PDF Layout

Edit `src/components/PDFDocument.tsx` to modify:
- Styling and fonts
- Layout and positioning
- Content structure

### Security Notes

- Never commit credentials or API keys to the repository
- Use environment variables for all sensitive configuration
- Follow the guidelines in `CLAUDE.md` for secure development

## Production Deployment

1. **Build production image**
```bash
docker build -f frontend/Dockerfile.prod -t training-planner:prod ./frontend
```

2. **Set production environment variables**
```bash
# Set your production S3 credentials
export VITE_S3_ACCESS_KEY=prod_access_key
export VITE_S3_SECRET_KEY=prod_secret_key
```

3. **Deploy with proper security**
- Use secrets management (Kubernetes secrets, Docker secrets)
- Configure HTTPS/SSL
- Set up proper CORS policies

## Contributing

1. Follow the security guidelines in `CLAUDE.md`
2. Use TypeScript for type safety
3. Test all changes in Docker environment
4. Update documentation for new features

## License

Private repository - All rights reserved

## Support

For issues and questions, please create a GitHub issue in this repository.