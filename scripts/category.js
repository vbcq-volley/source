// Hexo plugin to merge categories from pages into posts and update global categories
hexo.extend.filter.register('before_page_render', function(pages) {
    // Get all pages
    console.log(pages)
    // Get global categories
    const globalCategories = hexo.locals.get('categories');
    
    // Process each page
    pages.forEach(page => {
        // Get page categories (if any)
        let pageCategories = page.categories || [];
        console.log(pageCategories)
        // Find matching page by title or slug
      
        
        if (page && page.categories) {
            // Merge categories from page into post categories
            const newCategories = [...new Set([...pageCategories])];
       
            
            // Add merged categories to global categories
            const allCategories = [...new Set([...globalCategories.toArray(), ...newCategories])];
            hexo.locals.set('categories', allCategories);
            
            // Add the page to each of its categories
            page.categories.forEach(category => {
                // Get the category object from global categories
                const categoryObj = allCategories.find(cat => cat.name === category);
                if (categoryObj) {
                    // Add the page to the category's posts array if not already present
                    if (!categoryObj.posts.some(p => p.path === page.path)) {
                        categoryObj.posts.push(page);
                    }
                }
            });
        }
    });
    
    return posts;
});

// Export the plugin
module.exports = {};

// Documentation
/**
 * This Hexo plugin merges categories from pages into posts and updates global categories.
 * When a post and a page share the same title or slug, the plugin will:
 * 1. Retrieve categories from both the post and page
 * 2. Merge them into a single array without duplicates
 * 3. Update the post's categories with the merged result
 * 4. Add the merged categories to the global categories list
 * 5. Add the page to each of its categories in the category objects
 * 
 * Usage:
 * 1. Place this file in your Hexo theme's scripts directory
 * 2. The plugin will automatically run after post rendering
 * 
 * Note: This plugin assumes both posts and pages use the same category format.
 * When a post and a page share the same title or slug, the plugin will:
 * 1. Retrieve categories from both the post and page
 * 2. Merge them into a single array without duplicates
 * 3. Update the post's categories with the merged result
 * 
 * Usage:
 * 1. Place this file in your Hexo theme's scripts directory
 * 2. The plugin will automatically run after post rendering
 * 
 * Note: This plugin assumes both posts and pages use the same category format.
 */