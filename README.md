# CineVerse - AI-Powered Web Series Recommendation Platform

![CineVerse](https://img.shields.io/badge/CineVerse-v1.0.0-ff0055?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-00d9ff?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4-orange?style=for-the-badge)

An AI-powered web series recommendation website with a stunning 80s retro sci-fi neon aesthetic inspired by Stranger Things. Built with Next.js 14, TypeScript, TensorFlow.js, and MongoDB.

## ✨ Features

### 🎨 Design
- **80s Retro Sci-Fi Aesthetic**: Dark black-to-red gradient with neon glowing typography
- **Glassmorphism UI**: Beautiful glass cards with backdrop blur effects
- **Animated Particles**: Dynamic background particle system
- **3D Portal**: Interactive Three.js 3D portal on homepage
- **Smooth Animations**: Framer Motion animations throughout
- **Responsive Design**: Fully optimized for mobile and desktop

### 🤖 AI-Powered Recommendations
- **Content-Based Filtering**: Using genre and keyword similarity
- **Cosine Similarity**: Vector-based recommendation algorithm
- **TensorFlow.js Integration**: Client-side machine learning
- **Personalized Recommendations**: Based on user watch history
- **Mood-Based Recommendations**: Get series based on your current mood
- **Similar Series**: Smart recommendations for each series

### 📺 Features
- **Vast Series Library**: Integration with TMDB API
- **Search & Filter**: Search by name, filter by genre
- **Series Details**: Complete information including cast, trailers, and ratings
- **User Watchlist**: Save your favorite series
- **Watch History Tracking**: Automatic tracking for better recommendations
- **YouTube Trailers**: Embedded trailers for each series

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Graphics**: React Three Fiber, Three.js
- **Machine Learning**: TensorFlow.js
- **Database**: MongoDB
- **API**: TMDB (The Movie Database)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- TMDB API Key (free from https://www.themoviedb.org/settings/api)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cineverse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# TMDB API Configuration
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/cineverse

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get Your TMDB API Key:**
1. Go to https://www.themoviedb.org/
2. Create a free account
3. Go to Settings → API
4. Request an API key (it's free!)
5. Copy your API key to the `.env.local` file

### 4. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# macOS
brew install mongodb-community

# Ubuntu
sudo apt install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
cineverse/
├── app/
│   ├── api/                    # API routes
│   │   ├── genres/            # Fetch genres
│   │   ├── recommendations/   # AI recommendations
│   │   ├── series/            # Fetch series data
│   │   └── user/              # User data management
│   ├── dashboard/             # Dashboard page
│   ├── explore/               # Explore page
│   ├── series/[id]/           # Series detail page
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Homepage
├── components/
│   ├── AudioToggle.tsx        # Background music toggle
│   ├── LoadingSkeleton.tsx    # Loading animations
│   ├── Navigation.tsx         # Main navigation
│   ├── ParticlesBackground.tsx # Particle animation
│   ├── Portal3D.tsx           # 3D portal (Three.js)
│   └── SeriesCard.tsx         # Series card component
├── lib/
│   ├── mongodb.ts             # MongoDB connection
│   └── tmdb.ts                # TMDB API utilities
├── models/
│   └── recommendation.ts      # AI recommendation engine
├── utils/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🎯 Pages

### 1. **Landing Page** (`/`)
- Hero section with animated heading
- 3D floating portal using Three.js
- Animated background with particles
- Call-to-action buttons
- Features showcase

### 2. **Explore Page** (`/explore`)
- Search bar for finding series
- Genre filter dropdown
- Sort by popular/top rated
- AI Recommendation button
- Grid of series cards
- Smooth hover animations

### 3. **Series Detail Page** (`/series/[id]`)
- Backdrop hero image
- Full series information
- Cast members with photos
- YouTube trailer embed
- Save to watchlist button
- Similar series recommendations

### 4. **Dashboard Page** (`/dashboard`)
- User's saved series
- Personalized AI recommendations
- Mood-based recommendation selector
- Watch statistics
- Quick access to favorites

## 🤖 AI Recommendation System

The recommendation engine uses advanced machine learning algorithms:

### Content-Based Filtering
- **Genre Vectorization**: Converts genres to one-hot encoded vectors
- **Cosine Similarity**: Calculates similarity between series
- **Keyword Analysis**: Extracts and compares keywords from descriptions
- **Rating Consideration**: Factors in user rating preferences

### Recommendation Types

1. **Similar Series**
   - Based on genre and keyword similarity
   - Returns top 10 most similar series

2. **Personalized Recommendations**
   - Analyzes user's watch history
   - Creates user profile from watched series
   - Finds series matching user preferences

3. **Mood-Based Recommendations**
   - Exciting: Action, Sci-Fi, Crime
   - Relaxing: Documentary, Reality, Family
   - Mysterious: Mystery, Crime, Sci-Fi
   - Funny: Comedy, Animation, Family
   - Dramatic: Drama, War & Politics

## 🎨 Design System

### Colors
- **Neon Red**: `#ff0055` - Primary accent
- **Neon Blue**: `#00d9ff` - Secondary accent
- **Neon Pink**: `#ff006e` - Tertiary accent
- **Neon Purple**: `#8b00ff` - Quaternary accent

### Typography
- **Display Font**: Orbitron (headings, buttons)
- **Body Font**: Rajdhani (paragraphs, descriptions)

### Effects
- Glassmorphism cards with backdrop blur
- Neon glow text shadows
- Smooth hover animations
- Animated fog background
- Particle system
- Loading skeletons

## 🔧 API Endpoints

### Series
- `GET /api/series?type=popular&page=1`
- `GET /api/series?type=top_rated&page=1`
- `GET /api/series?genre=16&page=1`
- `GET /api/series?query=breaking+bad`

### Recommendations
- `GET /api/recommendations?type=similar&seriesId=123`
- `GET /api/recommendations?type=personalized&history=1,2,3`
- `GET /api/recommendations?type=mood&mood=exciting`

### User
- `GET /api/user?type=saved`
- `GET /api/user?type=watchHistory`
- `POST /api/user` (body: `{action, seriesId, type}`)

### Genres
- `GET /api/genres`

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
npm run build
```

### Other Platforms

Build the production bundle:
```bash
npm run build
npm start
```

## 🎮 Usage

1. **Explore Series**: Browse through thousands of web series
2. **Search**: Use the search bar to find specific series
3. **Filter**: Filter by genre or sort by popularity
4. **Get AI Recommendations**: Click the AI button for personalized suggestions
5. **View Details**: Click any series card to see full details
6. **Save Favorites**: Save series to your watchlist
7. **Check Dashboard**: View your saved series and get personalized recommendations
8. **Mood Selector**: Choose your mood to get matching series

## 🔥 Performance

- **Lazy Loading**: Images and components load on demand
- **Caching**: Series data cached in MongoDB
- **Optimized Images**: Next.js Image component with optimization
- **Code Splitting**: Automatic code splitting by Next.js
- **Static Generation**: Pages pre-rendered when possible

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env.local`
- Verify network access if using MongoDB Atlas

### TMDB API Errors
- Verify API key is correct
- Check API quota limits
- Ensure proper environment variable setup

### 3D Portal Not Loading
- Clear browser cache
- Check browser WebGL support
- Disable ad blockers

## 📝 Future Enhancements

- [ ] User authentication system
- [ ] Social features (share, like, comment)
- [ ] Advanced filtering options
- [ ] Multiple user profiles
- [ ] Progress tracking
- [ ] Episode tracking
- [ ] Reviews and ratings system
- [ ] Multi-language support
- [ ] PWA support
- [ ] Real-time notifications

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **TMDB API**: For providing comprehensive series data
- **Anthropic Claude**: For AI assistance in development
- **Three.js**: For amazing 3D graphics capabilities
- **Framer Motion**: For smooth animations
- **Next.js Team**: For the incredible framework

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ and powered by AI**

*Enter the Algorithmic Upside Down* 🌌
