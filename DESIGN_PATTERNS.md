# Design Patterns & UI Conventions

This document tracks design patterns and UI conventions used throughout the site for consistency.

## Link Arrow Animation

**Pattern**: All text links with arrows use the Flaticon icon `fi fi-ts-arrow-small-right` with a subtle slide animation on hover.

**Implementation**:
```css
.your-link-arrow {
  transform: translateY(2.5px);  /* Vertical alignment */
  display: inline-block;
  transition: transform 0.2s ease;
}

.your-link:hover .your-link-arrow {
  transform: translateY(2.5px) translateX(2px);  /* Slide right 2px on hover */
}
```

**Used in**:
- Home hero links (about us, schedule, instagram, submit proposal)
- Archive episode card "view episode" links
- Episode page "back to all" link (with left arrow, slides left)

**Rationale**: Creates a consistent, subtle interactive feedback that guides users' attention without being distracting. The 2px slide reinforces the directional action of the link.

**Variation - Back/Left Links**:
For back navigation, use `fi-ts-arrow-small-left` and slide LEFT on hover:
```css
.your-link:hover .your-link-arrow {
  transform: translateY(2.5px) translateX(-2px);  /* Slide left for back links */
}
```
