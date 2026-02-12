# 🚀 CineVerse - Quick Start Guide

Welcome to CineVerse! This guide will help you get the application up and running in minutes.

## 📦 What's Included

Your CineVerse package includes:
- ✅ Full Next.js 14 application with App Router
- ✅ AI-powered recommendation engine using TensorFlow.js
- ✅ MongoDB integration for data persistence
- ✅ TMDB API integration for series data
- ✅ Beautiful 80s retro sci-fi aesthetic
- ✅ 3D graphics using Three.js
- ✅ Smooth animations with Framer Motion
- ✅ Fully responsive design
- ✅ Complete documentation

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
cd cineverse
npm install
```

### Step 2: Get TMDB API Key (Free)
1. Go to: https://www.themoviedb.org/
2. Sign up for a free account
3. Navigate to: Settings → API
4. Request an API key (instant approval)
5. Copy your API key

### Step 3: Configure Environment
Create `.env.local` file:
```env
NEXT_PUBLIC_TMDB_API_KEY=paste_your_api_key_here
MONGODB_URI=mongodb://localhost:27017/cineverse
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Start MongoDB
```bash
# macOS/Linux
mongod

# Or use MongoDB Atlas (cloud) - update MONGODB_URI accordingly
```

### Step 5: Run the App
```bash
npm run dev
```

Open http://localhost:3000 🎉

## 🎯 Key Features to Try

### 1. AI Recommendations
- Click "AI Recommendations" button in Explore page
- Get personalized suggestions based on your viewing history

### 2. Mood-Based Discovery
- Go to Dashboard
- Select your current mood
- Get perfectly matched series recommendations

### 3. Search & Filter
- Use the search bar in Explore page
- Filter by genre
- Sort by popularity or rating

### 4. Save to Watchlist
- Click any series to view details
- Click "Save to Watchlist" button
- View your saved series in Dashboard

### 5. Explore 3D Portal
- Homepage features an interactive 3D portal
- Drag to rotate, admire the retro sci-fi aesthetic

## 📱 Pages Overview

### 🏠 Homepage (`/`)
- Stunning hero section with 3D portal
- Animated particles background
- Call-to-action buttons
- Features showcase

### 🔍 Explore (`/explore`)
- Search thousands of series
- Filter by genre
- AI-powered recommendations
- Grid view with smooth animations

### 📺 Series Details (`/series/[id]`)
- Full series information
- Cast and crew
- YouTube trailer
- Similar recommendations
- Save to watchlist

### 📊 Dashboard (`/dashboard`)
- Your saved series
- Personalized recommendations
- Mood-based suggestions
- Viewing statistics

## 🎨 Design Highlights

### Retro Sci-Fi Aesthetic
- 80s inspired neon colors
- Dark gradient backgrounds
- Animated fog effects
- Particle system

### Glassmorphism UI
- Frosted glass cards
- Backdrop blur effects
- Neon borders
- Glow animations

### Typography
- **Orbitron**: Display font for headings
- **Rajdhani**: Body font for content
- Neon glow text effects

## 🤖 How the AI Works

The recommendation engine uses:

1. **Content-Based Filtering**
   - Analyzes genre preferences
   - Extracts keywords from descriptions
   - Considers rating patterns

2. **Cosine Similarity**
   - Converts genres to vectors
   - Calculates similarity scores
   - Ranks recommendations

3. **Personalization**
   - Learns from watch history
   - Creates user preference profile
   - Adapts recommendations over time

## 🛠️ Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  neon: {
    red: '#your-color',
    blue: '#your-color',
    // ...
  },
}
```

### Adjust Particle Count
Edit `components/ParticlesBackground.tsx`:
```javascript
const particleCount = 100; // Change this number
```

### Modify Recommendation Weights
Edit `models/recommendation.ts`:
```javascript
const score = (
  genreSim * 0.5 +      // Adjust these weights
  keywordSim * 0.3 +
  ratingSim * 0.2
);
```

## 📊 MongoDB Collections

The app automatically creates these collections:

### `series` Collection
Caches series data from TMDB for faster recommendations.

### `users` Collection
Stores user preferences, saved series, and watch history.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_TMDB_API_KEY`
   - `MONGODB_URI` (use MongoDB Atlas)
4. Deploy!

### Build for Production
```bash
npm run build
npm start
```

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env.local
- For cloud MongoDB, verify network access

### Issue: "Invalid API key"
**Solution**: 
- Verify TMDB API key in .env.local
- Ensure no extra spaces in the key
- Check if API key is activated

### Issue: "3D Portal not loading"
**Solution**: 
- Check browser WebGL support
- Update browser to latest version
- Disable browser extensions

### Issue: "No series found"
**Solution**: 
- Wait for initial data fetch
- Check internet connection
- Verify TMDB API is accessible

## 📚 File Structure Explained

```
cineverse/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API routes
│   ├── explore/           # Explore page
│   ├── series/[id]/       # Dynamic series detail page
│   ├── dashboard/         # Dashboard page
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
├── lib/                   # Utility functions
├── models/                # AI recommendation engine
└── public/                # Static assets
```

## 🎓 Learning Resources

### Learn More About:
- [Next.js](https://nextjs.org/docs) - React framework
- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning
- [Three.js](https://threejs.org/) - 3D graphics
- [MongoDB](https://docs.mongodb.com/) - Database
- [TMDB API](https://developers.themoviedb.org/3) - Series data

## 💡 Tips & Best Practices

1. **Start Small**: Browse series, save favorites, then check recommendations
2. **Build History**: The more you interact, the better the AI recommendations
3. **Try Moods**: Different moods give very different recommendations
4. **Mobile First**: Test on mobile for the full responsive experience
5. **Performance**: Clear browser cache if animations feel sluggish

## 🎯 Next Steps

Now that you have CineVerse running:

1. ✅ Explore the series catalog
2. ✅ Save your favorite series
3. ✅ Try AI recommendations
4. ✅ Test mood-based discovery
5. ✅ Customize the design
6. ✅ Deploy to production
7. ✅ Share with friends!

## 🤝 Need Help?

- 📖 Check the full `DOCUMENTATION.md`
- 📋 Review the `README.md`
- 🐛 Look at troubleshooting section
- 💬 Open an issue on GitHub

## 🎉 Enjoy CineVerse!

You're all set! Enjoy exploring the algorithmic upside down and discovering your next favorite series.

**Built with ❤️ using AI**

---

*Enter the Algorithmic Upside Down* 🌌
