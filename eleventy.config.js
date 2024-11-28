const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
module.exports = async function(eleventyConfig) {
	eleventyConfig.setInputDirectory("views");
    eleventyConfig.setIncludesDirectory("my_includes");
    eleventyConfig.setLayoutsDirectory("_layouts");
    eleventyConfig.setOutputDirectory("dist");
    const { EleventyHtmlBasePlugin } = await import("@11ty/eleventy");

	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(feedPlugin, {
		type: "rss", // or "rss", "json"
		outputPath: "/feed.xml",
		collection: {
			name: "posts", // iterate over `collections.posts`
			limit: 0,     // 0 means no limit
		},
		metadata: {
			language: "en",
			title: "Blog Title",
			subtitle: "This is a longer description about your blog.",
			base: "https://example.com/",
			author: {
				name: "Your Name",
				email: "", // Optional
			}
		}
	});
};
module.exports.config = {
	pathPrefix: "/eleventy-base-blog/",
}