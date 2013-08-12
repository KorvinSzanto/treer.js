;(function(){
  "use strict";
function Category(config) {
  if (!(this instanceof Category)) {
    return new Category(config);
  }

  var me = {
    title: null,
    width: null,
    depth: 1,
    children: [],
    parent: null,
    element: null,
    title_width: null,
    color: 'black',
    font_family: '"HelveticaNeue-Light", ' +
                 '"Helvetica Neue Light", ' +
                 '"Helvetica Neue", ' +
                 'Helvetica, Arial, ' +
                 '"Lucida Grande", sans-serif',
    font_weight: 'normal',
    bracket_color: '#aaa',
    font_size: 12,
    scale: window.devicePixelRatio,
    category_type: Category.CategoryType.default
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
// Enum
Category.CategoryType = {
  default: 0,
  center: 1,
  none: 2
};

Category.prototype = {
  init:function(config) {
    this.setTitle(config.title);
  },
  setColor: function(color) {
    if (!color) return this;
    return this.set('color', color, true);
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
    var children = this.get('children');
    return (children[children.length - 1] == child)
  },
  addChild: function(child) {
    child.set('parent', this);
    return this.addTo('children',child);
  },
  getWidth: function() {
    if (this.get('width', true) > 0) {
      return this.get('width', true);
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
    if (!reset && this.get('title_width', true) !== null) {
      return this.get('title_width', true);
    }
    element = document.createElement('span');
    element.style.fontFamily = this.get('font_family');
    element.style.fontWeight = this.get('font_weight');
    element.style.fontSize = this.get('font_size') + 'px';
    element.innerText = element.textContent = this.get('title');
    document.body.appendChild(element);
    title_width += element.offsetWidth;
    document.body.removeChild(element);
    this.set('title_width', title_width);
    return title_width;
  },
  getFromElement: function(element) {
    var nodes, i, node, child, width = 0, text,
        data_type = element.getAttribute('data-type'),
        bracket_color;
    this.set('element',element);
    this.set('title', element.getAttribute('data-title'));
    this.setColor(element.getAttribute('data-color'));
    if (element.style.fontFamily) {
      this.set('font_family', element.style.fontFamily);
    }
    if (element.style.fontSize) {
      this.set('font_size', parseInt(element.style.fontSize));
    }
    if (element.style.fontWeight) {
      this.set('font_weight', element.style.fontWeight);
    }
    if (bracket_color = element.getAttribute('data-bracket-color')) {
      this.set('bracket_color', bracket_color);
    }

    if (data_type === 'center') {
      this.set('category_type', Category.CategoryType.center);
    } else if (data_type === 'none') {
      this.set('category_type', Category.CategoryType.none);
    }
    node = element.firstChild;

    while(node) {
      if (node.parentNode !== element) continue;
      child = null;
      if (node.nodeName === 'DIV') {
        child = Category(node);
        if (child.get('depth') >= this.get('depth')) {
          this.set('depth', child.get('depth') + 1);
        }
      } else if (node.nodeName === 'SPAN') {
        child = Node(node);
        child.setColor(node.style.color);
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
        element = this.get('element'),
        width   = this.getWidth() - 5,
        height  = (this.get('title') ? 17 : 0) + 17 * this.get('depth'),
        scale   = this.get('scale');

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * scale;
    canvas.height = height * scale;
    context.scale(scale, scale);

    this.renderInContext(context, height, 0);
    if (element && element.parentNode) {
      element.parentNode.replaceChild(canvas, element);
    }
    return canvas;
  },
  renderInContext: function(ctx, height, offset) {
    var m = this.get('scale'),
        bottom = height - 6.5,
        top = Math.round(bottom - (17 * this.get('depth'))) - 0.5,
        start = offset + 0.5,
        stop = Math.round(offset + this.get('width')) - 5.5,
        center = start + (stop - start) / 2,
        title_start = center - (this.getTitleWidth() / 2),
        title_stop = title_start + this.getTitleWidth(),
        actual_title_start = Math.max(title_start, start),
        actual_title_stop = Math.min(title_stop, stop);

    ctx.strokeStyle = this.get('bracket_color');
    ctx.beginPath();
    if (this.get('title')) {
      switch (this.get('category_type')) {
        case Category.CategoryType.default:
        default:
          ctx.moveTo(start, bottom);
          ctx.lineTo(start, top);
          ctx.lineTo(actual_title_start, top);
          ctx.moveTo(actual_title_stop, top);
          ctx.lineTo(stop, top);
          ctx.lineTo(stop, bottom);

          break;
        case Category.CategoryType.center:
          if (top + 10 < bottom - 17) {
            ctx.moveTo(start + (stop - start) / 2, top + 10);
            ctx.lineTo(start + (stop - start) / 2, bottom - 17);
          }

          break;
        case Category.CategoryType.none:
          break;
      }
      ctx.stroke();
      ctx.closePath();


      ctx.font = this.get('font_weight') + ' ' +
                 this.get('font_size') + 'px ' +
                 this.get('font_family');
      ctx.fillStyle = this.get('color');
      ctx.fontWeight = 'normal';
      ctx.textBaseline = 'middle';
      ctx.fontWeight = 'normal';
      ctx.fillText(this.get('title'), title_start + 5, top);
    }

    var lastNode;
    this.get('children').forEach(function(child){
      if (child instanceof Category && lastNode === 'node') {
        offset += 10;
      }
      child.renderInContext(ctx, height, offset);
      offset += child.get('width');
      lastNode = child instanceof Node ? 'node' : 'category';
    });

  }
};
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
