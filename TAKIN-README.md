# Takin Changes Documentation

This document lists all files that have been modified by Takin, organized by functionality.

## User Data Isolation
- `api/models/model.py`: Added user_id field for data isolation and username field for display
- `api/services/app_service.py`: Added user ID to app creation
- `api/services/app_dsl_service.py`: Added user ID for data isolation in app DSL
- `api/controllers/console/explore/installed_app.py`: Added user ID filtering for data isolation

## Tools and Workflow Management
- `api/core/tools/tool_manager.py`:
  - Modified API tool visibility filtering
  - Updated workflow tool visibility to be user-specific
- `api/services/tools/workflow_tools_manage_service.py`: Added user filtering for workflow tools
- `api/core/tools/provider/builtin/takin_dalle/tools/dalle2.py`: Added parameters for billing calculation
- `api/core/tools/provider/builtin/takin_dalle/tools/dalle3.py`: Added parameters for billing calculation
- `api/core/tools/provider/builtin/webscraper/tools/webscraper.py`: Disabled large model usage for web scraping

## Recommended Apps System
- `api/services/recommended_app_service.py`: Added APIs for creating and deleting recommended apps
- `api/controllers/console/explore/recommended_app.py`: Added pagination support
- `api/services/recommend_app/database/database_retrieval.py`: Modified app recommendations based on user roles

## Database and Infrastructure
- `api/extensions/ext_database.py`: Database connection modifications
- `api/models/dataset.py`: Added index_struct field for vector indexing
- `api/core/rag/datasource/vdb/pgvector/pgvector.py`: Modified table naming convention for PGVector

## Explore Features
- `api/controllers/console/explore/workflow.py`: Added tracking for billing calculations
- `api/controllers/common/helpers.py` and `api/controllers/common/fields.py`: Added agent mode configuration for tools billing

## Account Management
- `api/services/account_service.py`: Added email-based user queries and Takin-specific queries

## Frontend Changes

### Base Components and Services
- `web/service/base.ts`: Base service modifications
- `web/service/explore.ts`: Added community features and recommendation functionality
- `web/next.config.js`: Adjusted body size limit configuration
- `web/models/common.ts`: Added Takin-specific user fields (takin_id, credits, role)
- `web/models/explore.ts`: Added username display functionality

### Billing and Credits System
- `web/app/api/pricing.ts`: Core billing logic implementation
  - Credit system (subscription_credits and extra_credits)
  - USD to credits conversion with Takin coefficient
  - Agent tool usage billing
  - Workflow tracing and consumption tracking
- `web/app/components/billing/credits-billing-modal/index.tsx`: Credits billing UI
- `web/app/components/header/credits/index.tsx`: Credits display in header
- `web/app/api/user.ts`: User cookie handling for Takin domain

### Authentication and User Management
- `web/app/account/avatar.tsx`: Added Takin logout redirect
- `web/app/signin/_header.tsx`: Integrated Takin logo
- `web/app/components/header/account-dropdown/index.tsx`: Added language switcher and logout handling
- `web/app/components/swr-initor-takin.tsx`: Authentication flow handling
- `web/app/signin/page.tsx`: Sign-in page integration
- `web/app/components/header/index.tsx`: Navigation and Takin links

### App and Workflow Features
- `web/app/components/app/app-publisher/index.tsx`: Added app public status management
- `web/app/components/workflow/hooks/use-workflow-run.ts`: Added billing integration
- `web/app/components/share/text-generation/result/index.tsx`: Added workflow process data handling
- `web/context/app-context.tsx`: Added user ID handling for billing and profile navigation

### Chat and UI Components
- `web/app/components/base/chat/chat/hooks.ts`: Integrated billing module and credit tracking
- `web/app/components/base/toast/index.tsx`: UI improvements for error notifications
- `web/app/components/base/tag-management/favourite.tsx`: Added app favoriting functionality

### Dataset Management
- `web/app/components/datasets/create/step-two/index.tsx`: Added QA calculation and file upload billing
- `web/app/(commonLayout)/datasets/Container.tsx`: Modified API page visibility

### Explore Features
- `web/app/components/explore/app-card/index.tsx`: Added internationalization
- `web/app/components/explore/takin-list/index.tsx`: Added share card functionality
- `web/app/components/explore/sidebar/index.tsx`: Added loading states

## Summary of Changes

Total number of files modified: 43 files (20 Python files, 23 TypeScript/JavaScript files)

Changes by area:
1. **Frontend Changes** (23 files)
   - Base components and services modifications
   - Billing and credits system implementation
   - Authentication and user management
   - App and workflow features
   - Chat and UI components
   - Dataset management
   - Explore features integration
   - Focus on billing integration, UI/UX improvements, and internationalization

2. **Tools and Workflow Management** (6 files)
   - Tool visibility and permissions
   - Billing integration
   - DALL-E and web scraper modifications

3. **User Data Isolation** (4 files)
   - Core model and service files
   - User-specific data separation

4. **Recommended Apps System** (3 files)
   - App recommendations
   - Pagination support
   - Role-based filtering

5. **Database and Infrastructure** (3 files)
   - Database connections
   - Vector storage optimizations

6. **Explore Features** (3 files)
   - Billing tracking
   - Agent mode configurations

7. **Account Management** (1 file)
   - User query and authentication updates

Key Themes Across Changes:
1. **Billing Integration**: Comprehensive implementation across frontend and backend for tracking and managing user credits
2. **User Experience**: Enhanced UI components, internationalization, and improved error handling
3. **Data Isolation**: Strengthened user-specific data handling and permissions
4. **Community Features**: Added sharing, favoriting, and public app management capabilities
5. **Infrastructure**: Optimized database connections and vector storage

The most significant changes were in the Frontend (23 files) and Tools and Workflow Management (6 files) areas, with a strong focus on billing integration, user experience improvements, and data isolation.