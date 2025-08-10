# AI Spam Detection Feature

## Overview
The AI Spam Detection feature automatically analyzes senior care requests to identify potential spam or irrelevant content. Each request now displays a spam indicator badge showing the AI's assessment with confidence scores and reasoning.

## ✨ Features

### 🔍 **Automatic Spam Detection**
- All requests automatically show spam detection status
- Real-time AI analysis of request content
- Confidence scores from 0-100%
- Detailed reasoning for spam classification

### 🎯 **Visual Indicators**
- **Red Badge**: High confidence spam (80%+)
- **Orange Badge**: Likely spam (lower confidence)
- **Green Badge**: High confidence clean (80%+)
- **Yellow Badge**: Likely clean (lower confidence)
- **Gray Badge**: Pending analysis

### 📊 **Spam Information Display**
- Hover over any spam badge to see:
  - Spam status (Clean/Flagged as Spam)
  - AI confidence percentage
  - Detection reasoning
  - Detection timestamp

## 🎨 **UI Integration**

### Request Cards
All request cards now display spam indicators:
- **Regular Request Cards**: Small badge next to priority/status
- **AI Recommended Cards**: Integrated with ranking badges
- **Request Management Views**: Visible in all list views

### Badge Sizes
- `sm`: Compact view for cards
- `md`: Standard size for details
- `lg`: Large size for emphasis

## 🔧 **Technical Implementation**

### Backend Integration
```java
// SeniorRequestDto now includes:
Boolean isSpam;
BigDecimal spamConfidenceScore;
String spamDetectionReason;
OffsetDateTime spamDetectedAt;
```

### Frontend Components
```typescript
// SpamIndicatorBadge component
<SpamIndicatorBadge
  isSpam={request.isSpam}
  confidenceScore={request.spamConfidenceScore}
  detectionReason={request.spamDetectionReason}
  detectedAt={request.spamDetectedAt}
  size="sm"
  showText={false}
/>
```

### API Endpoints
- `POST /ai/filter/spam/single/{requestId}` - Check single request
- `POST /ai/filter/spam/batch` - Check multiple requests
- `GET /ai/filter/spam/history` - Get detection history

## 🚀 **Usage Examples**

### Viewing Spam Status
1. **Request Cards**: Look for colored badges next to request IDs
2. **Tooltip Information**: Hover over badges for detailed information
3. **Historical Data**: All past detections are preserved

### Understanding Indicators
- **🔴 High Risk**: Likely spam with high confidence
- **🟠 Medium Risk**: Possible spam, review recommended
- **🟡 Low Risk**: Likely clean but uncertain
- **🟢 Safe**: Clean content with high confidence
- **⚪ Unknown**: Analysis pending or unavailable

## 📋 **Manual Actions Available**

### Individual Requests
- View detailed spam analysis in tooltips
- Access full detection reasoning
- See confidence scores and timestamps

### Batch Operations (Future Enhancement)
- Bulk spam checking for multiple requests
- Filtering by spam status
- Exporting spam detection reports

## 🔒 **Security & Privacy**

### Data Protection
- Spam detection runs on request titles and descriptions only
- No personal senior information is analyzed
- All analysis is logged for audit purposes

### AI Model Information
- Uses Claude AI for natural language processing
- Specifically trained on senior care request patterns
- Considers context-appropriate content classification

## 🛠 **Configuration**

### Environment Variables
```env
# Backend configuration
LLM_API_KEY=your_claude_api_key
LLM_API_BASE_URL=https://api.anthropic.com/v1/messages
LLM_API_MODEL=claude-3-sonnet-20240229
```

### Frontend Configuration
```typescript
// Automatic spam detection is enabled by default
// Configure in spam-filter-service.ts if needed
```

## 🐛 **Troubleshooting**

### Common Issues

**Badge Not Showing**
- Check if `isSpam` field is present in request data
- Verify backend spam detection service is running
- Check browser console for API errors

**Confidence Score Missing**
- Backend may be returning `null` confidence scores
- Check LLM service configuration
- Verify spam detection has completed

**Detection Not Working**
- Ensure Claude API key is configured
- Check backend logs for LLM client errors
- Verify network connectivity to Anthropic API

### Support Commands
```bash
# Check spam detection status
curl -X GET "http://localhost:8080/ai/filter/spam/history"

# Test single request detection
curl -X POST "http://localhost:8080/ai/filter/spam/single/123"
```

## 📈 **Future Enhancements**

### Planned Features
- **Spam Filtering**: Filter request lists by spam status
- **Batch Actions**: Multi-select spam checking
- **Admin Dashboard**: Spam detection analytics
- **Auto-Quarantine**: Automatically hide high-confidence spam
- **Custom Rules**: User-defined spam detection criteria
- **Reporting**: Export spam detection reports

### Technical Improvements
- **Caching**: Cache spam detection results
- **Real-time Updates**: WebSocket notifications for spam detection
- **Performance**: Optimize batch processing
- **Accuracy**: Continuously improve AI model training

## 🎉 **Benefits**

### For Staff
- **Quick Assessment**: Instantly see request legitimacy
- **Prioritization**: Focus on genuine requests first
- **Quality Control**: Maintain high-quality request database

### For Administrators
- **System Health**: Monitor spam infiltration
- **Data Quality**: Ensure clean request database
- **Resource Efficiency**: Reduce time spent on invalid requests

### For Seniors
- **Better Service**: Staff can focus on legitimate requests
- **Faster Response**: Reduced processing time for valid requests
- **Quality Assurance**: Higher quality care coordination
