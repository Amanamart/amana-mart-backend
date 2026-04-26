# Backend Scalability Documentation

## Overview
To handle 200,000+ monthly customers, the Amana Mart backend is designed with high-performance patterns.

## Database Optimization
- **Prisma Client**: Uses connection pooling to handle multiple concurrent requests.
- **Indexing**: All high-traffic fields (e.g., `ClassifiedAd.categoryId`, `ClassifiedAd.status`, `Order.customerId`) are indexed in PostgreSQL.
- **Search**: Full-text search is implemented for marketplace ads.

## Caching Strategy (Redis)
- **Search Results**: Frequent search queries for classified ads are cached in Redis for 5 minutes.
- **Session Management**: User sessions and frequently accessed metadata are stored in Redis.
- **Utility**: Use `src/lib/redis.ts` for caching operations.

## Used Goods (Classifieds) Module
The marketplace logic is decoupled into `src/classified/`.
- **Service**: `ClassifiedService` handles business logic and cache invalidation.
- **Controller**: `ClassifiedController` manages request/response.
- **Models**: `ClassifiedAd`, `AdAttribute`, `AdPromotion`, `AdReport`.

## Future Improvements
- Implement Horizontal Scaling with Docker & Nginx.
- Add Meilisearch for ultra-fast full-text search.
- Implement Queueing (BullMQ) for heavy tasks like image processing.
