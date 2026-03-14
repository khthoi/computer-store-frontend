# UI DESIGN SYSTEM — computer-store-admin
# Inherits ALL tokens from @computer-store/ui shared preset.
# Admin-specific additions below.

## SHARED TOKENS (same as frontend — do not redefine)
# primary-*  : Blue scale — used in content area buttons
# success-*  : Green — order delivered, stock OK, approved
# warning-*  : Amber — low stock, pending, expiring
# error-*    : Red — failed, rejected, critical
# slate-*    : Page bg, text, borders

## ADMIN-SPECIFIC TOKENS

# SIDEBAR (violet — admin identity)
sidebar-bg     : #1E1B4B  (deep violet) → bg-[#1E1B4B] or use sidebar CSS var
sidebar-text   : #C4B5FD  (light violet) → active nav link text
sidebar-active : #7C3AED  (violet-600) → active nav item bg
sidebar-hover  : #2D2A5A  (slightly lighter than bg)

# HEADER
header-bg      : #FFFFFF  → bg-white
header-border  : #E2E8F0  → border-b border-slate-200
header-height  : 64px     → h-16

# SIDEBAR WIDTH
sidebar-width  : 280px    → w-70 (custom) or w-72 approx
sidebar-collapsed: 72px  → w-18 (icon-only mode)

## TYPOGRAPHY
Font: 'DM Sans', sans-serif  (admin uses DM Sans, NOT Inter)
# DM Sans: more structured, professional — suits data-dense interfaces
# Same type scale as shared (text-sm, text-base, etc.)

# Admin-specific patterns:
Table header  : text-xs font-semibold text-slate-500 uppercase tracking-wide
Table cell    : text-sm text-slate-700
Stat value    : text-3xl font-bold text-slate-900
Stat label    : text-sm text-slate-500
Stat change + : text-sm text-success-600 font-medium
Stat change - : text-sm text-error-600 font-medium

## LAYOUT
# Admin Shell:
sidebar  : fixed left, 280px wide (72px when collapsed)
header   : fixed top (within content area), 64px tall
content  : margin-left 280px (or 72px), padding 24px

# Content padding:
Page padding : p-6 (24px all sides)
Card/panel   : bg-white rounded-xl shadow-sm p-6
Section gap  : space-y-6 (24px between sections)

## STATUS BADGE PATTERNS (admin context)
# Same colors as frontend — consistent across both repos
Order pending   : bg-warning-50 text-warning-700
Order confirmed : bg-info-50 text-info-700
Order packing   : bg-info-50 text-info-600
Order shipping  : bg-primary-50 text-primary-700
Order delivered : bg-success-50 text-success-700
Order cancelled : bg-error-50 text-error-700
Stock OK        : bg-success-50 text-success-700
Stock low       : bg-warning-50 text-warning-700
Stock out       : bg-error-50 text-error-700
Ticket open     : bg-warning-50 text-warning-700
Ticket resolved : bg-success-50 text-success-700
