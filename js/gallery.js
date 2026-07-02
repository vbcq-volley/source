(function($){
  // Caption
  $('.content').each(function(i){
    $(this).find('img').each(function(){
      if (!$(this).hasClass('nofancybox')){
        const alt = this.alt;
        if (alt){
          $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox" rel="gallery' + i + '" />');
        } else {
          $(this).wrap('<a href="' + this.src + '" class="fancybox" rel="gallery' + i + '" />');
	    }
      }
    });
  });

  // Gallery
  const play = function(parent, item, callback){
    const width = parent.width();

    item.imagesLoaded(function(){
      const _this = this[0], nWidth = _this.naturalWidth, nHeight = _this.naturalHeight;

      callback();
      this.animate({opacity: 1}, 500);
      parent.animate({height: width * nHeight / nWidth}, 500);
    });
  };

  $('.gallery').each(function(){
    const $this = $(this), current = 0, photoset = $this.children('.photoset').children(), all = photoset.length
	let loading = true;
    play($this, photoset.eq(0), function(){
      loading = false;
    });

    $this.on('click', '.prev', function(){
      if (!loading){
        const next = (current - 1) % all;
        loading = true;

        play($this, photoset.eq(next), function(){
          photoset.eq(current).animate({opacity: 0}, 500);
          loading = false;
          current = next;
        });
      }
    }).on('click', '.next', function(){
      if (!loading){
        const next = (current + 1) % all;
        loading = true;

        play($this, photoset.eq(next), function(){
          photoset.eq(current).animate({opacity: 0}, 500);
          loading = false;
          current = next;
        });
      }
    });
  });
})(jQuery);
