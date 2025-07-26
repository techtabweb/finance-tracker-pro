# Finance Tracker PRD - Indian Edition

## Core Purpose & Success
- **Mission Statement**: A comprehensive personal finance tracker designed specifically for Indian users to manage expenses, set budgets, and analyze spending patterns using Indian Rupees with secure user authentication.
- **Success Indicators**: Users successfully create accounts, track daily expenses, stay within budgets, and gain insights into spending habits with Indian currency and categories in a secure, personalized environment.
- **Experience Qualities**: Secure, intuitive, organized, culturally relevant

## Project Classification & Approach
- **Complexity Level**: Complex Application (advanced functionality with user accounts and data isolation)
- **Primary User Activity**: Creating accounts, tracking financial data, analyzing patterns in a personalized dashboard

## Core Problem Analysis
Indian users need a secure finance tracker that understands local spending patterns, uses INR currency, includes categories relevant to Indian lifestyle, and protects their personal financial data with proper authentication.

## Essential Features

### Authentication & Security
1. **User Registration**: Secure signup with name, email, and password validation
2. **User Login**: Email/password authentication with session management
3. **User Profile Management**: Editable profile with personal information and preferences
4. **Data Isolation**: User-specific data storage ensuring privacy and security
5. **Account Management**: Profile updates, password management, and account deletion

### Current Features
1. **Expense Tracking**: Log expenses with amount (₹), category, description, and date
2. **Budget Management**: Set monthly overall budget and category-specific limits
3. **Overview Dashboard**: Quick snapshot of total spent vs budget
4. **Analytics**: Visual charts showing spending patterns and trends
5. **Savings Goals**: Set and track specific savings targets with progress indicators
6. **Reports & Export**: Comprehensive expense reports with charts and PDF export functionality
7. **Financial Wellness Score**: Comprehensive scoring system (0-100) that evaluates:
   - Budget Health (0-30 points): How well you stick to budgets
   - Savings Rate (0-25 points): Progress towards savings goals
   - Spending Control (0-20 points): Consistency in spending patterns
   - Tracking Consistency (0-15 points): Regular expense logging
   - Category Diversity (0-10 points): Variety in spending categories
8. **Achievements System**: Gamified rewards for financial milestones:
   - Budget achievements (first budget, staying within limits)
   - Savings milestones (₹10K, ₹1L clubs)
   - Consistency rewards (daily/monthly tracking)
   - Wellness score achievements (50+, 80+ scores)
9. **Personalized Tips**: AI-driven financial advice based on spending patterns:
   - Budget alerts and spending warnings
   - Savings goal recommendations
   - Emergency fund guidance
   - Investment suggestions for good savers
   - Category-specific optimization tips
10. **AI-Powered Receipt Scanning**: Smart expense entry through Google Gemini AI:
    - Camera capture or gallery upload for receipt photos
    - Advanced OCR with Google Gemini 1.5 Flash model
    - Automatic extraction of amount, merchant, date, and category
    - Smart categorization with confidence scores optimized for Indian receipts
    - Item-level recognition for detailed tracking
    - Handles Hindi text and mixed-language receipts
11. **Smart Expense Categorization**: Gemini AI-powered category suggestions:
    - Analyzes description and merchant names using advanced NLP
    - Provides confidence-based category recommendations
    - Learns from common Indian spending patterns and local businesses
    - Offers real-time suggestions during manual entry
    - Fallback to rule-based categorization for reliability
12. **Personalized Category Learning**: Advanced AI learning system that:
    - Records user corrections and preferences over time
    - Builds personalized categorization patterns based on user behavior
    - Provides increasingly accurate suggestions based on merchant and description history
    - Tracks learning statistics and accuracy improvements
    - Offers insights into recognized merchants and spending patterns
    - Continuous improvement through user feedback and corrections

### NEW: Learning Intelligence Features
- **Learning Dashboard**: Dedicated tab showing AI learning progress and statistics
- **Pattern Recognition**: System learns from user corrections and preferences
- **Merchant Recognition**: Smart identification of frequently used merchants
- **Accuracy Tracking**: Monitors AI suggestion accuracy over time
- **Learning Insights**: Visual feedback on system learning progress
- **Optimization Tools**: Features to improve learning performance
12. **AI Financial Insights**: Intelligent analysis and recommendations:
    - Spending pattern analysis and warnings
    - Budget utilization alerts and predictions
    - Category-wise spending trends
    - Personalized money-saving tips
    - Weekend/seasonal spending pattern detection
13. **Indian Currency**: All amounts displayed in ₹ with proper Indian number formatting
14. **Indian Categories**: Includes relevant categories like Groceries, Mobile & Internet, Fuel, Maintenance

### Suggested New Features for Indian Users
1. **EMI Tracker**: Track monthly EMIs for loans, credit cards
2. **Investment Tracker**: Track SIP investments, fixed deposits, mutual funds
3. **Bill Reminders**: Reminders for utility bills, insurance premiums
4. **Tax Planning**: Track tax-saving investments under 80C
5. **Festival Budget**: Special budget category for festivals and celebrations
6. **Savings Goals**: Set and track specific savings targets
7. **UPI Transaction Import**: Import transactions from UPI apps
8. **Split Expenses**: Share expenses with family/friends
9. **Recurring Expenses**: Auto-add monthly recurring expenses
10. **Financial Goals**: Track progress toward major financial milestones

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Trustworthy, organized, professional yet approachable
- **Design Personality**: Clean, modern, financially focused
- **Visual Metaphors**: Financial growth, security, organization
- **Simplicity Spectrum**: Minimal interface with organized data presentation

### Color Strategy
- **Color Scheme Type**: Professional blue-based with warm accents
- **Primary Color**: Deep blue (trust, stability) - `oklch(0.45 0.15 200)`
- **Secondary Colors**: Light gray for backgrounds, medium gray for secondary elements
- **Accent Color**: Warm orange for highlights and positive actions - `oklch(0.65 0.15 50)`
- **Color Psychology**: Blue conveys trust and stability (important for finance), orange adds warmth and optimism
- **Color Accessibility**: All text maintains WCAG AA contrast ratios

### Typography System
- **Font Pairing Strategy**: Single font family (Inter) with multiple weights
- **Typographic Hierarchy**: Bold headers, medium subheadings, regular body text
- **Font Personality**: Modern, clean, highly legible
- **Which fonts**: Inter (Google Fonts) - excellent for data-heavy interfaces
- **Legibility Check**: Inter is specifically designed for screen readability

### UI Elements & Component Selection
- **Component Usage**: shadcn components for consistency - Tabs, Cards, Dialogs, Buttons
- **Component States**: Clear hover, active, and disabled states for all interactive elements
- **Icon Selection**: Phosphor icons for consistent visual language
- **Spacing System**: Consistent 4px grid system using Tailwind spacing

### Implementation Considerations
- **Scalability Needs**: Modular component structure allows easy feature additions
- **Data Persistence**: Uses useKV for reliable data storage across sessions
- **Indian Localization**: Currency formatting, number formatting, relevant categories
- **Reports & Analytics**: Advanced reporting with multiple chart types and PDF export capability
- **AI Integration**: Google Gemini AI API for advanced receipt scanning and expense categorization

### AI Technical Implementation
The application integrates with **Google Gemini AI** using API key: `AIzaSyB83WwA2IAHN4U6Npa44yYPdhtzkEdwtu4`

**Gemini Model Used**: `gemini-1.5-flash`
- **Advantages**: Best free model with vision + text capabilities
- **Use Cases**: 
  - Receipt scanning with OCR capabilities
  - Expense categorization with Indian context awareness
  - Mixed-language text processing (English + Hindi)

**Features Enhanced by Gemini AI**:
1. **Receipt Scanner**: 
   - Advanced OCR for receipt images
   - Extracts amount, merchant, date, category, and items
   - Handles Indian receipt formats and GST details
   - Processes Hindi/regional language text

2. **Smart Categorizer**:
   - Analyzes expense descriptions and merchant names
   - Provides confidence-scored category suggestions
   - Understands Indian business patterns and local brands
   - Falls back to rule-based categorization if AI fails

**API Implementation**:
- Custom service layer in `/src/lib/gemini-api.ts`
- Error handling with graceful fallbacks
- JSON mode for structured responses
- Optimized prompts for Indian financial context
- Rate limiting and token management for free tier

**Performance Optimizations**:
- Lazy loading of Gemini API module
- Fallback to local pattern matching
- Efficient base64 image processing
- Minimal API calls with comprehensive prompts

### Reports Feature Details
The Reports section provides comprehensive expense analysis with:
- **Time Period Selection**: 1, 3, 6, or 12 month views
- **Visual Charts**: Pie charts for category breakdown, bar charts for monthly trends, line charts for daily spending
- **Summary Metrics**: Total expenses, budget utilization, average monthly spending
- **Top Categories**: Ranked list of highest spending categories with percentages
- **PDF Export**: High-quality PDF generation for sharing and record-keeping
- **Interactive Elements**: Responsive charts with tooltips and hover effects