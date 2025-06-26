// Hexo plugin to merge categories from pages and update global categories

const pagination = require('hexo-pagination');

const temp= function(locals) {
  const config = this.config;
  console.log(this.config)
  const perPage = config.per_page;
  const paginationDir = config.pagination_dir || 'page';
  const orderBy = config.order_by || '-date';
  const pages = hexo.locals.get("pages");
  let categories=hexo.locals.get("categories")||[]
  console.log(categories)
  pages.data.forEach(page => {
    const globalCategories = categories.data || [];
    // Get page categories (if any)
    const pageCategories = page.categories || [];
    
    if (pageCategories.length > 0) {
        // Create category objects for each category
        const newCategories = pageCategories.filter(category => !globalCategories.some(cat => cat.name === category)).map(category => ({
            name: category,
            posts: []
        }));
        
        // Merge with existing categories
        const allCategories = [...new Set([...globalCategories, ...newCategories])];
        //console.log(allCategories)
        // Update locals.categories with the new structure
        categories.data = allCategories.map(category => ({
            ...category,
            posts: [...(category.posts || [])],
            length:category.posts.length,path:category.path||"category/"+category.name
        })).map((cat)=>{
            //console.log(cat)
            if( pageCategories.includes(cat.name)){
                if(!cat.posts.some(cat => cat._id === page._id)){
                  cat.posts.push(page)
                }
               
            }
            return cat
        });
        categories.length=allCategories.length
        //console.log("les categories sont "+JSON.stringify(categories,null,2))
        //require("fs").writeFileSync("./category.json",JSON.stringify(categories,null,2))
    }
});
//hexo.locals.invalidate();
hexo.locals.set("categories",function(){return categories})
//console.log(hexo.database)
//hexo.database.model("category").insertMany(categories.data)
//hexo.set("categories",categories)
  return categories.data.reduce((result, category) => {
    if (!category.length) return result;

    const posts = category.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const data = pagination(category.path, posts, {
      perPage,
      layout: ['category', 'archive', 'index'],
      format: paginationDir + '/%d/',
      data: {
        category: category.name
        ,postTotal: category.length,
        posts: category.posts
      }
    });

    return result.concat(data);
  }, []);
};
hexo.extend.generator.register('category', temp);
// Export the plugin


// Documentation
/**
 * This Hexo plugin merges categories from pages and updates global categories.
 * When a page has categories, the plugin will:
 * 1. Create category objects for each category
 * 2. Merge them with existing categories
 * 3. Add the page to each category's posts array
 * 4. Update the global categories list
 * 
 * Usage:
 * 1. Place this file in your Hexo theme's scripts directory
 * 2. The plugin will automatically run during site generation
 * 
 * Note: This plugin assumes both posts and pages use the same category format.
 */ 