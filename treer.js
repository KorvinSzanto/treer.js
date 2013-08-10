;(function(){
  "use strict";
function Category(config) {
  if (!(this instanceof Category)) {
    return new Category(config);
  }

  var me = {
    title:null,
    width:null,
    depth:1,
    children:[],
    parent:null,
    element:null,
    title_width:null,
    color:'black'
  };

  this.set = function(k, v) {
    me[k] = v;
    return this;
  }
  this.get = function(k) {
    return me[k];
  }
  this.addTo = function(k, v) {
    me[k].push(v);
    return this;
  }
  this.with = function(k, handler) {
    return handler.call(this,k);
  }
  if (config instanceof HTMLElement) {
    return this.getFromElement(config);
  }
  return this.init(config);
}

Category.prototype = {
  init:function(config) {
    this.setTitle(config.title);
  },
  getParent: function() {
    return this.get('parent');
  },
  getTitle: function() {
    this.getWidth(1);
    return this.get('title');
  },
  setTitle: function(title) {
    return this.set('title',title);
  },
  getColor: function() {
    return this.get('color');
  },
  setColor: function(color) {
    if (!color) return this;
    return this.set('color',color);
  },
  getDepth: function() {
    return this.get('depth');
  },
  setDepth: function(depth) {
    return this.set('depth',depth);
  },
  getChildren: function() {
    return this.get('children');
  },
  hasCategoryChild: function() {
    var children = this.get('children'), i;
    for (i = 0; i < children.length; i++) {
      if (children[i] instanceof Category) {
        return true;
      }
    }
    return false;
  },
  isLastChild: function(child) {
    var children = this.getChildren();
    return (children[children.length - 1] == child)
  },
  addChild: function(child) {
    child.set('parent', this);
    return this.addTo('children',child);
  },
  getWidth: function() {
    if (this.get('width') > 0) {
      return this.get('width');
    }
    var width = 10, lastNode, children = this.get('children');
    children.forEach(function(node){
      if (node instanceof Category && lastNode === 'node') {
        width += 10;
      }
      width += node.getWidth();
      lastNode = node instanceof Node ? 'node' : 'category';
    });
    var hasCategoryChild = this.hasCategoryChild();
    if (hasCategoryChild && children[children.length - 1] instanceof Category) {
      width -= 10;
    } else if (hasCategoryChild) {
      width += 5;
    }
    this.set('width', width);
    return width;
  },
  getTitleWidth: function(reset) {
    var title_width = 10, element;
    if (!reset && this.get('title_width') !== null) {
      return this.get('title_width');
    }
    element = document.createElement('span');
    element.style.fontFamily = '"HelveticaNeue-Light", ' +
                               '"Helvetica Neue Light", ' +
                               '"Helvetica Neue", ' +
                               'Helvetica, Arial, ' +
                               '"Lucida Grande", sans-serif';
    element.style.fontWeight = 'normal';
    element.style.fontSize = '12px';
    element.innerText = this.getTitle();
    document.body.appendChild(element);
    title_width += element.offsetWidth;
    document.body.removeChild(element);
    this.set('title_width', title_width);
    return title_width;
  },
  getFromElement: function(element) {
    var nodes, i, node, child, width = 0;
    this.set('element',element);
    this.setTitle(element.getAttribute('data-title'));
    this.setColor(element.getAttribute('data-color'));
    node = element.firstChild;

    while(node) {
      if (node.parentNode !== element) continue;
      child = null;
      if (node.nodeName === 'DIV') {
        child = Category(node);
        if (child.getDepth() >= this.getDepth()) {
          this.setDepth(child.getDepth() + 1);
        }
      } else if (node.nodeName === 'SPAN') {
        child = Node(node.innerText);
        child.setColor(node.getAttribute('data-color'));
      }
      if (child) {
        this.addChild(child);
        width += child.getWidth();
      }
      node = node.nextSibling;
    }
    return this;
  },
  renderCanvas: function() {
    var canvas  = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        element = this.get('element');
    canvas.width = this.getWidth() - 5;
    canvas.height = (this.getTitle() ? 17 : 0) + 17 * this.getDepth();
    this.renderInContext(context, 0);
    if (element && element.parentNode) {
      element.parentNode.replaceChild(canvas, element);
    }
    return canvas;
  },
  renderInContext: function(ctx, offset) {
    var bottom = ctx.canvas.height - 6,
        top = bottom - (17 * this.getDepth()) - 0.5,
        start = offset + 0.5,
        stop = offset + this.getWidth() - 5.5,
        title_start = start + ((stop - start) / 2 - (this.getTitleWidth() / 2)),
        title_stop = title_start + this.getTitleWidth(),
        actual_title_start = Math.max(title_start, start),
        actual_title_stop = Math.min(title_stop, stop);

    if (this.getTitle()) {
      ctx.moveTo(start, bottom);
      ctx.lineTo(start, top);
      ctx.lineTo(actual_title_start, top);
      ctx.moveTo(actual_title_stop, top)
      ctx.lineTo(stop, top);
      ctx.lineTo(stop, bottom);

      ctx.font = '12px "HelveticaNeue-Light", ' +
                       '"Helvetica Neue Light", ' +
                       '"Helvetica Neue", ' +
                       'Helvetica, Arial, ' +
                       '"Lucida Grande", sans-serif';
      ctx.fillStyle = this.getColor();
      ctx.fontWeight = 'normal';
      ctx.textBaseline = 'middle';
      ctx.fontWeight = 'normal';
      ctx.fillText(this.getTitle(), title_start + 5, top);
    }

    var lastNode;
    this.getChildren().forEach(function(child){
      if (child instanceof Category && lastNode === 'node') {
        offset += 10;
      }
      child.renderInContext(ctx, offset);
      offset += child.getWidth();
      lastNode = child instanceof Node ? 'node' : 'category';
    });

    ctx.stroke();
  }
};
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
    element.innerText = this.getTitle();
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
    ctx.fillText(this.getTitle(), offset + 8, ctx.canvas.height);
  }
};

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
