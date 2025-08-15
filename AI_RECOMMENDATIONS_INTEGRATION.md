# AI Recommendations System Integration

This document outlines the integration of the new AI Recommendations system between the backend service and frontend components.

## Backend Integration

The backend provides a comprehensive AI recommendations service with the following endpoints:

### API Endpoints

1. **GET /api/aifeatures/recommend/all** - Get all AI recommendations (admin only)
2. **GET /api/aifeatures/recommend/my/{userId}** - Get recommendations for a specific user
3. **POST /api/aifeatures/recommend/generate/{requestId}** - Generate a single AI recommendation
4. **POST /api/aifeatures/recommend/batch** - Process batch recommendations
5. **POST /api/aifeatures/recommend/priorities** - Rank task priorities using AI

### Database Schema

The migration `V202508150701__create_ai_recommendations_table.sql` creates the `ai_recommendations` table with:

- `id` - Primary key
- `request_id` - Reference to senior_requests table (unique constraint)
- `user_id` - Reference to staff table (optional)
- `priority_score` - AI-calculated priority score (0-100)
- `priority_reason` - AI explanation for the priority score
- `urgency_level` - AI-determined urgency (LOW, MEDIUM, HIGH, CRITICAL)
- `recommendation_text` - AI-generated recommendation text
- `processing_status` - Current status (PENDING, PROCESSING, COMPLETED, FAILED)
- `created_at`, `updated_at` - Timestamps

## Frontend Integration

### New Components

1. **AIRecommendationsView** (`/components/ai-recommendations-view.tsx`)
   - Full-featured AI recommendations interface
   - Batch processing capabilities
   - Priority ranking features
   - Real-time status tracking

2. **AIRecommendationsWidget** (`/components/ai-recommendations-widget.tsx`)
   - Compact widget for dashboard integration
   - Configurable display options
   - Quick stats overview

3. **Updated AIRecommendations** (`/components/ai-recommendations.tsx`)
   - Backward compatible wrapper
   - Provides access to both legacy and new interfaces
   - Progressive enhancement approach

### Services and Utilities

1. **AIRecommendationsApiService** (`/services/ai-recommendations-service.ts`)
   - Updated to match new backend API endpoints
   - Support for batch processing and priority ranking
   - Backward compatibility methods

2. **AIRecommendationsCacheService** (`/services/ai-recommendations-cache.ts`)
   - Intelligent caching with TTL
   - Real-time updates and invalidation
   - Performance optimization for large datasets

3. **useAIRecommendations Hook** (`/hooks/use-ai-recommendations.ts`)
   - Comprehensive state management
   - Async operation tracking
   - Cache integration

### Type Definitions

**AIRecommendationDto** (`/types/ai-recommendations.ts`)
- Matches backend DTO structure
- Includes utility functions for display formatting
- Status and priority color helpers

## Key Features

### 1. Smart Priority Scoring
- AI calculates priority scores (0-100) based on request analysis
- Priority reasoning provided for transparency
- Urgency levels (LOW, MEDIUM, HIGH, CRITICAL)

### 2. Batch Processing
- Process multiple requests simultaneously
- Fan-out pattern for parallel processing
- Comprehensive result reporting (success/failure counts)

### 3. Real-time Status Tracking
- Processing status updates (PENDING → PROCESSING → COMPLETED/FAILED)
- Cache invalidation on status changes
- User feedback during long-running operations

### 4. Intelligent Caching
- TTL-based cache expiration (5 minutes default)
- User-specific and global cache management
- Automatic cleanup of stale data

### 5. Progressive Enhancement
- Backward compatibility with existing components
- Optional advanced features
- Graceful degradation

## Usage Examples

### Basic Integration (Dashboard Widget)

```tsx
import { AIRecommendationsWidget } from '@/components/ai-recommendations-widget';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <AIRecommendationsWidget 
        maxItems={3}
        compact
        onViewAll={() => router.push('/recommendations')}
      />
      {/* Other dashboard widgets */}
    </div>
  );
}
```

### Advanced Integration (Full Interface)

```tsx
import { AIRecommendationsView } from '@/components/ai-recommendations-view';

function RecommendationsPage() {
  return (
    <AIRecommendationsView 
      showBatchProcessing={true}
      showPriorityRanking={true}
      maxDisplayItems={20}
    />
  );
}
```

### Legacy Integration (Backward Compatible)

```tsx
import { AIRecommendations } from '@/components/ai-recommendations';

function ExistingPage() {
  return (
    <AIRecommendations 
      showAdvancedFeatures={false} // Use legacy interface
    />
  );
}
```

## Migration Guide

### From Old to New System

1. **API Endpoints**: Update API calls to use new endpoint structure
2. **Data Types**: Replace `SeniorRequestDto[]` with `AIRecommendationDto[]`
3. **Component Props**: Update component usage to use new prop structure
4. **Error Handling**: Implement async operation error handling

### Backward Compatibility

The system maintains backward compatibility through:
- Legacy wrapper components
- Deprecated method warnings
- Progressive enhancement approach
- Graceful fallbacks

## Performance Considerations

1. **Caching Strategy**
   - 5-minute TTL for recommendations
   - User-specific cache partitioning
   - Automatic memory management

2. **Async Processing**
   - Non-blocking AI generation
   - Batch processing for efficiency
   - Real-time status updates

3. **Error Recovery**
   - Graceful degradation on failures
   - Retry mechanisms for transient errors
   - User-friendly error messages

## Future Enhancements

1. **Real-time Notifications**
   - WebSocket integration for live updates
   - Push notifications for completed recommendations

2. **Machine Learning Improvements**
   - User feedback integration
   - Recommendation accuracy tracking
   - Personalization algorithms

3. **Analytics and Reporting**
   - Recommendation effectiveness metrics
   - User engagement tracking
   - Performance analytics dashboard

## Security Considerations

1. **Authorization**
   - Role-based access control (ADMIN vs STAFF)
   - User-specific data isolation
   - Secure API endpoint protection

2. **Data Privacy**
   - Minimal data exposure in cache
   - Automatic cache cleanup
   - Secure transmission protocols

## Troubleshooting

### Common Issues

1. **Cache not updating**: Check TTL settings and cache invalidation logic
2. **Slow batch processing**: Monitor async executor configuration
3. **Missing recommendations**: Verify database constraints and foreign keys
4. **Type errors**: Ensure proper TypeScript type definitions

### Debug Tools

1. **Cache Statistics**: Use `aiRecommendationsCache.getCacheStats()`
2. **Processing Status**: Monitor `getProcessingStatus()` for request tracking
3. **Network Inspection**: Check API responses in browser dev tools

## Deployment Notes

1. **Database Migration**: Ensure migration `V202508150701__create_ai_recommendations_table.sql` is applied
2. **Environment Variables**: Configure LLM client settings
3. **Performance Monitoring**: Set up monitoring for async operations
4. **Error Logging**: Configure appropriate log levels for debugging
