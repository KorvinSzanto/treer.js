function Node(title) {
  if (!(this instanceof Node)) return new Node(title);
  var me = {
    title: null,
    width: 0,
    parent: null,
    color: 'black'
  };

  this.set = function(k, v) {
    me[k] = v;
    return this;
  }
  this.get = function(k) {
    return me[k];
  }
  this.with = function(k, handler) {
    return handler.call(this,k);
  }

  return this.init(title);
}

Node.prototype = {
  init:function(title){
    this.setTitle(title);
    return this;
  },
  setTitle: function(title) {
    this.set('title', title);
    this.getWidth(1);
    return this;
  },
  getTitle: function() {
    return this.get('title');
  },
  setColor: function(color) {
    if (!color) return this;
    return this.set('color',color);
  },
  getColor: function() {
    return this.get('color');
  },
  getWidth: function(reset) {
    var width = 10, element;
    if (!reset && this.get('width') !== null) {
      return this.get('width');
    }
    element = document.createElement('span');
    element.style.fontFamily = '"HelveticaNeue-Light", ' +
                               '"Helvetica Neue Light", ' +
                               '"Helvetica Neue", ' +
                               'Helvetica, Arial, ' +
                               '"Lucida Grande", sans-serif';
    element.style.fontSize = '16px';
    element.innerText = element.textContent = this.getTitle();
    document.body.appendChild(element);
    width += element.offsetWidth;
    document.body.removeChild(element);
    this.set('width', width);
    return width;
  },
  renderInContext: function(ctx, offset) {
    ctx.font = '16px "HelveticaNeue-Light", ' +
               '"Helvetica Neue Light", ' +
               '"Helvetica Neue", ' +
               'Helvetica, Arial, ' +
               '"Lucida Grande", sans-serif';
    ctx.fontWeight = 'bold';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.fillStyle = this.getColor();
    ctx.fillText(this.getTitle(), offset + 8, parseInt(ctx.canvas.style.height));
  }
};
