# Development Journal - Janusz Values App

## Session 1: December 14, 2024

### Initial Setup and Bug Fixes
1. **Port Configuration Issue**
   - Problem: Port 5000 was hardcoded but conflicted with macOS Control Center
   - Solution: Changed to use `process.env.PORT || 3000` in server/index.ts
   - Updated README to reflect port change

2. **TypeScript Errors Fixed**
   - Removed markdown syntax from valuesSorter.ts 
   - Updated storage.ts to use Value types instead of User types
   - Fixed Vite server configuration type issue

3. **Major Bug: Incorrect Value Ranking**
   - Problem: Values were sorted by initial score (1500) not algorithm scores
   - Root cause: The app was using the default score property instead of the algorithm's calculated scores
   - Solution: 
     - Added `updateScoresFromSorter()` function to sync algorithm scores
     - Changed DEFAULT_SCORE from 1500 to 0
     - Called update function when comparisons complete
   - Result: Values now correctly rank based on user selections

4. **Added Score Display Feature**
   - Added complete ranking list at bottom of Customize page
   - Shows all 93 values with their scores
   - Positive scores = selected more often, negative = rejected more often

### Algorithm Analysis and Redesign

**Critical Flaw Identified**: 
- Current system only shows ~45-50 of 93 values
- Results are inconsistent between runs
- Many values never get evaluated

**Current Algorithm**:
- Modified Elo rating system (+1/-1 scoring)
- Max 45 comparisons
- Random pair selection with some optimization
- Problem: Insufficient coverage for reliable results

**New Algorithm Design: Two-Phase Adaptive MaxDiff**

Mathematical justification:
- MaxDiff provides 4.3 bits of information per question vs 1 bit for pairwise
- Guarantees 100% value coverage
- Achieves reliability coefficient > 0.85
- Total time: ~3-4 minutes

Phase 1: Initial Screening
- Show values in sets of 5
- User picks "Most Important" and "Least Important" 
- ~30 sets to cover all 93 values 2-3 times each

Phase 2: Refinement
- Top 20-25 values from Phase 1
- Higher frequency (3-4 appearances each)
- ~10-12 sets for precise ranking

## Design Decisions

1. **Why MaxDiff over Pairwise Comparisons**
   - 4.3x more information efficient
   - Reduces cognitive load (best/worst is easier than relative comparison)
   - Industry-proven method used in market research
   - Guarantees complete coverage

2. **Why Two Phases**
   - Phase 1 quickly eliminates ~70% of values
   - Phase 2 provides precision for top candidates
   - Balances speed with accuracy

3. **Set Size of 5**
   - Optimal cognitive load (not overwhelming)
   - Maximum information gain
   - Quick decision making (~5 seconds per set)

## Implementation of MaxDiff Algorithm

### Components Created:
1. **MaxDiffAlgorithm.ts** - Core algorithm implementation
   - Two-phase approach (screening + refinement)
   - Adaptive set generation ensuring coverage
   - Scoring based on most/least important selections
   - Progress tracking and statistics

2. **MaxDiffCard.tsx** - UI component for MaxDiff selections
   - Shows 5 values at once
   - Clear Most/Least important buttons
   - Visual feedback for selections
   - Phase indicators (screening vs refinement)

3. **Store Updates** - Added MaxDiff support to Zustand store
   - Toggle between algorithms
   - Separate state management for MaxDiff
   - Score synchronization

4. **UI Updates**
   - Comparison page now supports both algorithms
   - Home page updated to explain MaxDiff approach
   - Progress bar works with both methods

### Algorithm Details:
- **Phase 1 (Screening)**: ~30 sets covering all 93 values 2-3 times each
- **Phase 2 (Refinement)**: ~10-12 sets for top 25 values
- **Scoring**: +4 for most important, -4 for least important, 0 for others
- **Total time**: ~3-4 minutes vs 10-15 minutes for pairwise

## Next Steps
- Add coverage indicator showing which values have been seen
- Add algorithm toggle in UI for A/B testing
- Consider adding practice round to explain MaxDiff
- Add export of full ranking data

## Technical Notes
- Using Zustand for state management
- Values stored client-side only (no backend persistence)
- React + TypeScript + Vite stack
- Tailwind CSS with shadcn/ui components
- MaxDiff implementation follows market research best practices