# Nyota Translation Center (NTC) - Frontend

![Nyota Translation Center](https://github.com/user-attachments/assets/f9a0f658-723c-4a74-a609-563ac4aa7bc8)

## Overview

Nyota Translation Center is an AI-powered web application that transforms French school bulletins (report cards) into professionally formatted English reports. This repository contains the React TypeScript frontend that provides an intuitive interface for users to upload, process, and manage their translated school documents.

## What This Repository Is For

This repository serves as the **frontend component** of the Nyota Translation AI system, specifically designed to:

- **Transform French school bulletins into English report cards** using advanced AI technology
- **Provide a user-friendly web interface** for document upload and management
- **Store and organize** translated bulletins in Firebase Firestore
- **Generate professional PDF reports** ready for academic or professional use
- **Manage user authentication** and personalized document libraries

## Key Features

### 🔐 User Authentication
- Firebase-based secure login and registration
- Personalized dashboard for each user
- Protected access to user documents

### 📤 Document Upload & Processing
- Support for image and PDF uploads of French bulletins
- Real-time progress tracking during AI processing
- Automatic text extraction and translation
- Error handling and validation

### 🤖 AI-Powered Translation
- Integration with backend AI services
- Accurate extraction of academic data from French documents
- Professional English translation of all bulletin content
- Preservation of original formatting and structure

### 📊 Dashboard & Management
- View all processed bulletins in an organized interface
- Real-time editing capabilities with auto-save to Firestore
- Detailed view of each translated report
- Search and filter functionality

### 📄 Professional Report Generation
- Form 6 bulletin template system
- A4-formatted reports optimized for printing
- PDF export functionality
- Clean, professional layout matching academic standards

### 🎨 Modern UI/UX
- Responsive design built with Tailwind CSS
- Intuitive navigation and user experience
- Progress indicators and real-time feedback
- Mobile-friendly interface

## Target Users

- **Families** with children in French-speaking schools needing English translations
- **Students** applying to English-speaking institutions requiring translated academic records
- **Educational consultants** helping with international school transfers
- **Academic administrators** processing international student applications

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Authentication & Database**: Firebase (Auth, Firestore, Analytics)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Code Quality**: ESLint with TypeScript support
- **PDF Generation**: HTML to PDF conversion capabilities

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Firebase project configuration

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gaelxxl34/Nyota-Translation-AI-Frontend.git
cd Nyota-Translation-AI-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Configure your Firebase settings in .env
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview the production build locally

## Project Structure

```
src/
├── components/          # React components
│   ├── LandingPage.tsx     # Landing page with hero section
│   ├── LoginPage.tsx       # User authentication
│   ├── RegisterPage.tsx    # User registration
│   ├── FirestoreOnlyDashboardPage.tsx  # Main dashboard
│   ├── BulletinTemplatePage.tsx        # Template preview
│   ├── Form6Template.tsx   # Bulletin template component
│   └── ...
├── firebase.ts          # Firebase configuration
├── AuthProvider.tsx     # Authentication context
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Firebase Configuration

This application uses Firebase for:
- **Authentication**: User login and registration
- **Firestore**: Document storage and real-time syncing
- **Analytics**: Usage tracking and insights

Ensure you have a Firebase project set up with these services enabled.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary. All rights reserved.

## Support

For questions, issues, or support, please contact the development team or create an issue in this repository.

---

**Nyota Translation Center** - Bridging language barriers in education through AI technology.