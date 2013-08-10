
  HTMLElement.prototype.treer = function() {
    var cat = Category(this);
    return cat.renderCanvas();
  };

}(window, document, undefined));
