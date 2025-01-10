# Blue - AI Chat Assistant 🤖

A modern, production-ready AI chat assistant featuring advanced language models, image generation, and custom personas.

![Blue AI Assistant](https://images.unsplash.com/photo-1676299081847-5bb90e138489?q=80&w=2070&auto=format&fit=crop)

## ✨ Features

- 🧠 **Advanced AI Chat**
  - Multiple language model support (Mixtral, LLaMA3, Gemma2)
  - Natural conversation flow
  - Context-aware responses
  - Code highlighting and markdown support

- 🎨 **Image Generation**
  - Stable Diffusion XL integration
  - High-quality image outputs
  - Custom prompt optimization
  - Multiple style options

- 👥 **Custom Personas**
  - Create and customize AI personalities
  - Share personas with the community
  - Public persona marketplace
  - Persona rating system

- 🔒 **Enterprise-Grade Security**
  - Supabase authentication
  - Row Level Security (RLS)
  - Content Security Policy (CSP)
  - XSS & CSRF protection

- 💅 **Beautiful UI/UX**
  - Modern, responsive design
  - Dark mode optimized
  - Real-time chat updates
  - Smooth animations

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/blue-chat.git
   cd blue-chat
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

\`\`\`env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Replicate API Configuration
VITE_REPLICATE_API_TOKEN=your_replicate_api_token
\`\`\`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t blue-chat .

# Run container
docker run -p 80:80 blue-chat
```

## 📦 Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI Models**: 
  - Mixtral 8x7B (32k context)
  - LLaMA3 70B
  - Gemma2 9B
- **Image Generation**: Stable Diffusion XL
- **Authentication**: Supabase Auth
- **Deployment**: Docker, Nginx

## 🔐 Security

- Environment variables properly secured
- Database access controlled through RLS policies
- API keys never exposed to client
- Regular security audits
- Protected against common vulnerabilities:
  - XSS
  - CSRF
  - SQL Injection
  - Authentication bypass

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Project Structure

```
blue-chat/
├── src/
│   ├── components/    # React components
│   ├── lib/          # Utilities and configurations
│   ├── pages/        # Page components
│   └── hooks/        # Custom React hooks
├── public/           # Static assets
├── supabase/        # Database migrations
└── docker/          # Docker configuration
```

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📫 Support

- Create an issue for bug reports
- Join our Discord community
- Follow us on Twitter

---

Built with ❤️ by the Blue team