# Image Search System Architecture & Implementation Plan

## Overview
AmanaMart's Image Search System allows users to search for products, food items, and classified ads using images. 

## Implementation Stages

### Stage 1: Basic Metadata & Tag Matching (MVP)
*Status: Planned*
- **Frontend**: Upload component in GlobalSearch and Chrome Extension.
- **Backend**: Endpoint `POST /api/search/image`.
- **Logic**: Process uploaded image -> extract basic file info (or mock AI tags) -> query database using those tags.
- **Database**: Add `tags` or `image_keywords` column to products and ads.

### Stage 2: Visual Similarity (Vector Search)
*Status: Future*
- **Integration**: OpenAI CLIP / HuggingFace model / Google Vision API.
- **Logic**: Convert uploaded image to vector embeddings.
- **Database**: Use Supabase pgvector to store image embeddings for all products and ads. Perform cosine similarity search.
- **Enhancement**: OCR (Optical Character Recognition) to extract text from images (e.g., brand names on products).

### Stage 3: Personalized & Module-Aware Search
*Status: Future*
- **Contextualization**: Rank results based on the user's active module (e.g., if in Grocery, prioritize grocery items over classifieds).
- **Location filtering**: Filter visual matches based on the user's delivery zone.

## Backend Task List (Stage 1)
1. Create `image-search` route and controller.
2. Integrate Supabase Storage to temporarily save uploaded search images.
3. Setup dummy tag extraction (to be replaced by real AI model in Stage 2).
4. Update Prisma schema to support `tags` on `Product` and `ClassifiedAd` models.
5. Create `GET /api/extension/search?q=` for extension text searches.
6. Create `POST /api/extension/image-search` endpoint.

## Chrome Extension Integration
- Added `contextMenus` permission for right-click "Search image on AmanaMart".
- Next: Wire up the popup's Image Search button to trigger file selection and send to backend.
