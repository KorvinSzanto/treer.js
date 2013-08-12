function Node(title) {
  if (!(this instanceof Node)) return new Node(title);
  var me = {
    title: null,
    width: 0,
    parent: null,
    color: 'black',
    font_family: '"HelveticaNeue-Light", ' +
                 '"Helvetica Neue Light", ' +
                 '"Helvetica Neue", ' +
                 'Helvetica, Arial, ' +
                 '"Lucida Grande", sans-serif',
    font_weight: 300,
    font_size: 16
  };

  this.set = function(k, v, direct) {
    if (direct !== true) {
      var method = 'set' + k.split('_').map(function(val){
        return val[0].toUpperCase() + val.substr(1)
      }).join('');
      if (this[method] && typeof this[method] === 'function') {
        return this[method](v);
      }
    }
    me[k] = v;
    return this;
  }
  this.get = function(k, direct) {
    if (direct !== true) {
      var method = 'get' + k.split('_').map(function(val){
        return val[0].toUpperCase() + val.substr(1)
      }).join('');
      if (this[method] && typeof this[method] === 'function') {
        return this[method]();
      }
    }
    return me[k];
  }
  this.with = function(k, handler) {
    return handler.call(this,k);
  }

  if (title instanceof HTMLElement) {
    return this.getFromElement(title);
  }
  return this.init(title);
}

Node.prototype = {
  init:function(title){
    this.set('title', title);
    return this;
  },
  setTitle: function(title) {
    this.set('title', title, true);
    this.getWidth(1);
    return this;
  },
  setColor: function(color) {
    if (!color) return this;
    return this.set('color', color, true);
  },
  getWidth: function(reset) {
    var width = 10, element;
    if (!reset && this.get('width', true) !== null) {
      return this.get('width', true);
    }
    element = document.createElement('span');
    element.style.fontFamily = this.get('font_family');
    element.style.fontSize = this.get('font_size') + 'px';
    element.style.fontWeight = this.get('font_weight');
    element.innerText = element.textContent = this.get('title');
    document.body.appendChild(element);
    width += element.offsetWidth;
    document.body.removeChild(element);
    this.set('width', width);
    return width;
  },
  getFromElement: function(element) {
    if (element.style.fontFamily) {
      this.set('font_family', element.style.fontFamily);
    }
    if (element.style.fontSize) {
      this.set('font_style', parseInt(element.style.fontSize));
    }
    if (element.style.fontWeight) {
      this.set('font_weight', element.style.fontWeight);
    }
    this.setTitle(element.innerText || element.textContent);
  },
  renderInContext: function(ctx, height, offset) {
    ctx.font = this.get('font_weight') + ' ' +this.get('font_size') + 'px' + this.get('font_family');
    ctx.fontWeight = this.get('font_weight');
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.fillStyle = this.get('color');
    ctx.fillText(this.get('title'), offset + 8, height);
  }
};
