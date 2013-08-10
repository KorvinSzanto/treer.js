
  HTMLElement.prototype.treer = function() {
    var cat = Category(this);
    return cat.renderCanvas();
  };
  if (window.jQuery) {
    window.jQuery.fn.treer = function(){
      this.each(function(){
        this.treer();
      });
    }
  }

}(window, document, undefined));
