# computer-store-admin

## Overview
Back-office Admin Dashboard for an online computer & hardware retail platform.
Serves: Staff, Warehouse, CSKH, Admin roles.
Tech: Next.js 16 App Router, TypeScript, TailwindCSS, Recharts.

## Shared UI
This repo uses @computer-store/ui (shared package with computer-store-frontend).
DO NOT recreate components that exist in the shared package.
Check: ls node_modules/@computer-store/ui/src/components/

## Quick Start
git clone <repo-url> && cd computer-store-admin
cp .env.example .env.local && npm install && npm run dev
# → http://localhost:3001

## Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXTAUTH_SECRET=your-admin-secret
NEXTAUTH_URL=http://localhost:3001

## Roles & Permissions
Staff     : Products, Orders, Reviews, Promotions
Warehouse : Inventory (import/export), Order fulfillment
CSKH      : Support tickets, Returns processing
Admin     : Full access + Reports + Staff management

## AI Development — READ FIRST
1. .ai/CODING_RULES.md
2. .ai/PROJECT_CONTEXT.md
3. .ai/SYSTEM_ARCHITECTURE.md  ← Role-based auth, data always fresh
4. .ai/UI_DESIGN_SYSTEM.md     ← Admin violet theme + DM Sans
5. .ai/COMPONENT_GUIDELINES.md ← DataTable, StatCard patterns
6. .ai/FEATURE_SPEC.md
7. .ai/API_CONTRACT.md
8. .ai/AI_DEVELOPMENT_GUIDE.md
