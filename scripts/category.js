// Hexo plugin to merge categories from pages into posts and update global categories
hexo.extend.filter.register('before_post_render', function(posts) {
    // Get all pages
    const pages = hexo.locals.get('pages');
    // Get global categories
    const globalCategories = hexo.locals.get('categories');
    
    // Process each post
    posts.forEach(post => {
        // Get post categories (if any)
        let postCategories = post.categories || [];
        
        // Find matching page by title or slug
        const matchingPage = pages.find(page => {
            return page.title === post.title || page.slug === post.slug;
        });
        
        if (matchingPage && matchingPage.categories) {
            // Merge categories from page into post categories
            const newCategories = [...new Set([...postCategories, ...matchingPage.categories])];
            post.categories = newCategories;
            
            // Add merged categories to global categories
            const allCategories = [...new Set([...globalCategories.toArray(), ...newCategories])];
            hexo.locals.set('categories', allCategories);
            
            // Add the page to each of its categories
            matchingPage.categories.forEach(category => {
                // Get the category object from global categories
                const categoryObj = allCategories.find(cat => cat.name === category);
                if (categoryObj) {
                    // Add the page to the category's posts array if not already present
                    if (!categoryObj.posts.some(p => p.path === matchingPage.path)) {
                        categoryObj.posts.push(matchingPage);
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