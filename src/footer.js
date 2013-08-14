
  HTMLElement.prototype.treer = function(config) {
    var cat = Category(config, this);
    return cat.renderCanvas();
  };
  if (window.jQuery) {
    window.jQuery.fn.treer = function(config){
      this.each(function(){
        this.treer(config);
      });
    }
  }

}(window, document, undefined));
