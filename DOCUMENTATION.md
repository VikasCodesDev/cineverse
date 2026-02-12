# CineVerse Technical Documentation

## Architecture Overview

CineVerse is built using a modern full-stack architecture with the following layers:

### Frontend Layer
- **Framework**: Next.js 14 with App Router
- **UI Components**: React with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth transitions
- **3D Graphics**: React Three Fiber for WebGL rendering

### Backend Layer
- **API Routes**: Next.js API routes for serverless functions
- **Database**: MongoDB for data persistence
- **External API**: TMDB API for series data
- **AI Engine**: TensorFlow.js for recommendations

## Component Structure

### Core Components

#### 1. Navigation (`components/Navigation.tsx`)
- Fixed top navigation bar with glassmorphism effect
- Responsive mobile menu
- Active route highlighting
- Smooth animations on hover

#### 2. ParticlesBackground (`components/ParticlesBackground.tsx`)
- Canvas-based particle system
- Connects nearby particles with lines
- Optimized performance using requestAnimationFrame
- Responsive to screen size changes

#### 3. Portal3D (`components/Portal3D.tsx`)
- Three.js 3D scene with animated sphere
- Rotating torus rings
- Dynamic lighting effects
- Auto-rotation with OrbitControls

#### 4. SeriesCard (`components/SeriesCard.tsx`)
- Reusable card component for displaying series
- Glassmorphism design
- Hover animations with scale and glow effects
- Rating badge overlay
- Optimized image loading

#### 5. LoadingSkeleton (`components/LoadingSkeleton.tsx`)
- Skeleton screens for better UX
- Animated shimmer effect
- Multiple skeleton variants (card, grid, details)

#### 6. AudioToggle (`components/AudioToggle.tsx`)
- Background music control
- Persistent audio state
- Volume management
- Mute/unmute functionality

## API Routes

### 1. Series API (`app/api/series/route.ts`)

**Endpoints:**
- `GET /api/series?type=popular&page=1`
- `GET /api/series?type=top_rated&page=1`
- `GET /api/series?genre=16&page=1`
- `GET /api/series?query=search+term`

**Functionality:**
- Fetches series from TMDB API
- Caches results in MongoDB
- Supports pagination
- Handles search queries
- Genre filtering

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Series Name",
      "overview": "Description...",
      "poster_path": "/path.jpg",
      "vote_average": 8.5,
      ...
    }
  ],
  "page": 1
}
```

### 2. Recommendations API (`app/api/recommendations/route.ts`)

**Endpoints:**
- `GET /api/recommendations?type=similar&seriesId=123`
- `GET /api/recommendations?type=personalized&history=1,2,3`
- `GET /api/recommendations?type=mood&mood=exciting`

**Functionality:**
- Initializes recommendation engine
- Loads cached series data
- Computes similarity scores
- Returns top N recommendations

**Algorithm Flow:**
1. Load series database from MongoDB
2. Convert genres to vectors
3. Extract keywords from descriptions
4. Calculate cosine similarity
5. Rank by combined score
6. Return top results

### 3. User API (`app/api/user/route.ts`)

**Endpoints:**
- `GET /api/user?type=saved`
- `GET /api/user?type=watchHistory`
- `POST /api/user` (body: `{action, seriesId, type}`)

**Functionality:**
- Manages user's saved series
- Tracks watch history
- Stores preferences
- Supports add/remove operations

### 4. Genres API (`app/api/genres/route.ts`)

**Endpoint:**
- `GET /api/genres`

**Functionality:**
- Fetches all available TV genres from TMDB
- Returns genre ID and name pairs
- Used for filtering in Explore page

## AI Recommendation Engine

### Architecture

The recommendation engine (`models/recommendation.ts`) implements content-based filtering:

```
User Preferences → Genre Vectors → Cosine Similarity → Ranked Results
                 ↘ Keywords     ↗
```

### Core Algorithms

#### 1. Genre Vectorization

```typescript
genresToVector(genres: string[]): number[]
```

Converts genre names to one-hot encoded vectors:
- Input: ["Action", "Sci-Fi"]
- Output: [1, 0, 0, 1, 0, 0, ...]

#### 2. Cosine Similarity

```typescript
cosineSimilarity(vecA: number[], vecB: number[]): number
```

Calculates similarity between two vectors:
```
similarity = (A · B) / (||A|| × ||B||)
```

Returns value between 0 (no similarity) and 1 (identical).

#### 3. Keyword Similarity

```typescript
keywordSimilarity(keywordsA: string[], keywordsB: string[]): number
```

Uses Jaccard similarity:
```
similarity = |A ∩ B| / |A ∪ B|
```

#### 4. Combined Scoring

Final recommendation score:
```
score = (genreSimilarity × 0.5) + 
        (keywordSimilarity × 0.3) + 
        (ratingSimilarity × 0.2)
```

### Recommendation Types

#### Similar Series
Based on single series:
1. Find target series in database
2. Calculate similarity with all other series
3. Exclude target and already watched
4. Sort by score
5. Return top N

#### Personalized Recommendations
Based on watch history:
1. Fetch user's watched series
2. Create average genre profile
3. Collect all keywords
4. Calculate similarity for unwatched series
5. Boost with popularity factor
6. Return top N

#### Mood-Based Recommendations
Based on mood selection:
1. Map mood to preferred genres
2. Create mood genre vector
3. Calculate similarity for all series
4. Boost with popularity
5. Return top N

## Database Schema

### Collections

#### 1. series
Cached series data from TMDB:
```javascript
{
  _id: ObjectId,
  id: Number,              // TMDB ID
  name: String,
  overview: String,
  poster_path: String,
  backdrop_path: String,
  first_air_date: String,
  vote_average: Number,
  vote_count: Number,
  genre_ids: [Number],
  popularity: Number,
  updatedAt: Date
}
```

#### 2. users
User data and preferences:
```javascript
{
  _id: ObjectId,
  userId: String,          // Demo: "demo_user"
  savedSeries: [Number],   // Array of series IDs
  watchHistory: [Number],  // Array of series IDs
  createdAt: Date,
  updatedAt: Date
}
```

## Styling System

### Color Palette

```css
--color-neon-red: #ff0055;    /* Primary accent */
--color-neon-blue: #00d9ff;   /* Secondary accent */
--color-neon-pink: #ff006e;   /* Tertiary accent */
--color-neon-purple: #8b00ff; /* Quaternary accent */
--color-dark-bg: #0a0a0a;     /* Background */
```

### Typography

```css
font-display: 'Orbitron';  /* Headers, buttons */
font-body: 'Rajdhani';     /* Body text */
```

### Key CSS Classes

#### Glassmorphism
```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 0, 85, 0.2);
  border-radius: 16px;
}
```

#### Neon Glow
```css
.text-glow-red {
  color: #ff0055;
  text-shadow: 
    0 0 10px #ff0055,
    0 0 20px #ff0055,
    0 0 40px #ff0055;
}
```

#### Neon Buttons
```css
.neon-button {
  background: transparent;
  border: 2px solid #ff0055;
  color: #ff0055;
  /* Animated shine effect on hover */
}
```

## Performance Optimizations

### 1. Image Optimization
- Next.js Image component with lazy loading
- Responsive image sizes
- WebP format when supported
- Blur placeholder for better perceived performance

### 2. Code Splitting
- Dynamic imports for heavy components (Portal3D)
- Route-based code splitting automatically
- Lazy loading for non-critical components

### 3. Caching Strategy
- Series data cached in MongoDB
- Recommendation engine keeps data in memory
- API responses cached when possible

### 4. Database Indexing
Recommended indexes:
```javascript
db.series.createIndex({ id: 1 })
db.series.createIndex({ popularity: -1 })
db.users.createIndex({ userId: 1 })
```

### 5. Animation Performance
- CSS animations preferred over JavaScript
- GPU-accelerated transforms
- requestAnimationFrame for smooth 60fps
- Optimized particle count

## Security Considerations

### API Security
- TMDB API key in environment variables
- No API keys in client-side code
- Rate limiting on API routes
- Input validation and sanitization

### Database Security
- MongoDB connection string in .env
- No direct database access from client
- Parameterized queries to prevent injection

### XSS Prevention
- React's automatic escaping
- Sanitized user inputs
- No dangerouslySetInnerHTML usage

## Testing Strategy

### Unit Tests
- Test utility functions
- Test recommendation algorithms
- Test API response parsing

### Integration Tests
- Test API routes
- Test database operations
- Test external API calls

### E2E Tests
- Test user flows
- Test search and filtering
- Test recommendation generation

## Deployment Checklist

- [ ] Set environment variables
- [ ] Configure MongoDB connection
- [ ] Add TMDB API key
- [ ] Build production bundle
- [ ] Test all pages
- [ ] Verify API endpoints
- [ ] Check mobile responsiveness
- [ ] Test recommendation engine
- [ ] Verify 3D graphics work
- [ ] Test on multiple browsers

## Troubleshooting Guide

### Issue: 3D Portal Not Rendering
**Solution:**
1. Check browser WebGL support
2. Update graphics drivers
3. Disable hardware acceleration if issues persist

### Issue: Slow Recommendations
**Solution:**
1. Check MongoDB connection
2. Verify series data is cached
3. Reduce recommendation engine dataset size

### Issue: Images Not Loading
**Solution:**
1. Verify TMDB API key
2. Check image URLs
3. Ensure proper Next.js Image configuration

### Issue: MongoDB Connection Failed
**Solution:**
1. Verify MongoDB is running
2. Check connection string
3. Verify network access (Atlas)

## Future Improvements

### Short Term
1. Add user authentication
2. Implement real user profiles
3. Add more filter options
4. Improve mobile UX

### Medium Term
1. Add social features
2. Implement episode tracking
3. Add reviews and ratings
4. Multi-language support

### Long Term
1. Machine learning model training
2. Collaborative filtering
3. Advanced recommendation algorithms
4. Real-time updates

## Contributing Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting
- Write descriptive comments

### Commit Messages
Format: `type(scope): message`

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Styling changes
- refactor: Code refactoring
- test: Tests
- chore: Build/config changes

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit PR with description

## Resources

### External APIs
- [TMDB API Docs](https://developers.themoviedb.org/3)
- [MongoDB Docs](https://docs.mongodb.com/)

### Libraries
- [Next.js Docs](https://nextjs.org/docs)
- [Three.js Docs](https://threejs.org/docs/)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [Framer Motion](https://www.framer.com/motion/)

### Design Inspiration
- 80s Retro Sci-Fi Aesthetics
- Neon Typography
- Glassmorphism UI Patterns

---

**Last Updated**: 2024
**Version**: 1.0.0
