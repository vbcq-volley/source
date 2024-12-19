const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const pluginNavigation =require("@11ty/eleventy-navigation");
const  { DateTime } =require("luxon") ;
module.exports = async function(eleventyConfig) {
	eleventyConfig.setInputDirectory("./views");
    eleventyConfig.setIncludesDirectory("../include");
    eleventyConfig.setLayoutsDirectory("../include/layouts");
    eleventyConfig.setOutputDirectory("dist");
	
    const { EleventyHtmlBasePlugin } = await import("@11ty/eleventy");
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat('yyyy-LL-dd');
	});
	eleventyConfig.addBundle("css", {
		toFileDirectory: "../public",
	});
	// Adds the {% js %} paired shortcode
	eleventyConfig.addBundle("js", {
		toFileDirectory: "../public",
	});
	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if( n < 0 ) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	}); 

	// Return the keys used in an object
	eleventyConfig.addFilter("getKeys", target => {
		return Object.keys(target);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "posts"].indexOf(tag) === -1);
	});
	eleventyConfig.addShortcode("currentBuildDate", () => {
		return (new Date()).toISOString();
	});
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginNavigation)
    eleventyConfig.addPlugin(feedPlugin, {
		type: "rss", // or "rss", "json"
		outputPath: "/feed.xml",
		collection: {
			name: "all", // iterate over `collections.posts`
			limit: 0,     // 0 means no limit
		},
		metadata: {
			language: "en",
			title: "Blog Title",
			subtitle: "This is a longer description about your blog.",
			base: "https://thomas-iniguez-visioli.github.io/",
			author: {
				name: "Your Name",
				email: "", // Optional
			}
		}
	});
};
module.exports.config = {
	pathPrefix: "/vbcq/",
	markdownTemplateEngine: "njk",
	templateFormats: [
		"md",
		"njk",
		"html",
		"liquid",
		"11ty.js",
	],dir:{data:"../data"},
	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",
}