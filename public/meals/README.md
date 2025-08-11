# Meal Images

Add your meal images to this folder with the following filenames:

- `mloukhia.jpg`
- `kamounia.jpg` 
- `mermez.jpg`
- `loubia-b.jpg`
- `makarony-b.jpg`
- `bolognaise.jpg`
- `bnadek.jpg`
- `zaara-b.jpg`
- `ojja.jpg`
- `petit-pois.jpg`
- `makarony-p.jpg`
- `zaara-p.jpg`
- `makarony-crevette.jpg`
- `tchich-poulpe.jpg`
- `ojja-crevette.jpg`

## Image Requirements:
- Format: JPG, PNG, or WebP
- Recommended size: 400x300 pixels (4:3 ratio)
- File size: Keep under 500KB for better performance
- Use descriptive, URL-friendly filenames (lowercase, hyphens instead of spaces)

## How it works:
1. Images are stored in `/public/meals/` folder
2. Database stores just the filename (e.g., `mloukhia.jpg`)
3. App displays them as `/meals/mloukhia.jpg`
4. Falls back to placeholder if image not found
