/**
 * [chain-network]{@link https://github.com/emn178/chain-network}
 *
 * @version 0.1.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2017
 */
(function () {
  var KEY = 'chain-network';
  var EDGE_LEVEL = 20;
  var MAX_EDGE_WIDTH = 5;

  function interpolate(str, vars) {
    var args = arguments.length > 2 || typeof vars != 'object' ? arguments : vars;
    return str.replace(/\{(\w+)\}/g, function(match, term) {
      if (term in args) {
        return args[term];
      } else {
        return '{' + term + '}';
      }
    });
  };

  function ChainNetwork(element, options) {
    var self = this;
    this.element = element;
    this.pageSize = options.pageSize || 10;
    this.projectColor = options.projectColor || '#f0ad4e';
    this.projectTooltipTemplate = options.project.tooltipTemplate || 'Target: {target}<br/>Current: {incomingValue}({incomingPercentage}%)<br/>Used: {outgoingValue}({outgoingPercentage}%)';
    this.incomingEdgeColor = options.incomingEdgeColor || '#02c66c';
    this.outgoingEdgeColor = options.outgoingEdgeColor || '#ff0000';
    this.project = options.project;
    this.nodesMap = {};
    this.nodes = options.nodes || [];
    this.nodes.forEach(function (node) {
      self.nodesMap[node.id] = node;
    });
    this.networkNodes = [];
    this.networkEdges = [];

    this.incomingNodeIds = {};
    this.transcationsMap = {};
    this.aggEdgesMap = {};
    this.transcations = options.transcations || [];
    var incomingValue = 0, outgoingValue = 0;
    this.transcations.forEach(function (transcation) {
      self.transcationsMap[transcation.id] = transcation;
      var color, dashes = false, incoming;
      if (transcation.to === self.project.id) {
        self.incomingNodeIds[transcation.from] = true;
        color = self.incomingEdgeColor;
        incomingValue += transcation.value;
        incoming = true;
      } else {
        color = self.outgoingEdgeColor;
        if (self.incomingNodeIds[transcation.to]) {
          dashes = true;
        }
        outgoingValue += transcation.value;
        incoming = false;
      }
      var edgeId = transcation.from + '_' + transcation.to;
      if (!self.aggEdgesMap[edgeId]) {
        var edge = $.extend({
          arrows: 'to',
          color: color,
          dashes: dashes,
          arrowStrikethrough: false,
          smooth: dashes ? { type: 'continuous' } : false
        }, transcation);
        edge.id = edgeId;
        delete edge.value;
        self.networkEdges.push(edge);
        self.aggEdgesMap[edgeId] = { 
          id: edgeId, 
          transcations: [], 
          edge: edge,
          incoming: incoming
        };
      }
      var aggEdge = self.aggEdgesMap[edgeId];
      aggEdge.transcations.push(transcation);
      aggEdge.value = aggEdge.transcations.reduce(function (pre, current) {
        return pre + current.value;
      }, 0);
    });

    Object.keys(this.aggEdgesMap).forEach(function (key) {
      var aggEdge = self.aggEdgesMap[key];
      var total = aggEdge.incoming ? incomingValue : outgoingValue;
      aggEdge.edge.width = aggEdge.value / total * EDGE_LEVEL;
      if (aggEdge.edge.width > MAX_EDGE_WIDTH) {
        aggEdge.edge.width = MAX_EDGE_WIDTH;
      } else {
        aggEdge.edge.width = Math.max(aggEdge.edge.width, 1);
      }
    })

    this.incomingNodes = [];
    this.outgoingNodes = [];
    this.nodes.forEach(function (node) {
      if (self.incomingNodeIds[node.id]) {
        self.incomingNodes.push(node);
      } else {
        self.outgoingNodes.push(node);
      }
    });

    var incomingPercentage = incomingValue / options.project.target * 100;
    var outgoingPercentage = outgoingValue / incomingValue * 100;
    var showPercentage = Math.min(incomingPercentage, 100).toFixed(2);

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" >' +
      '<foreignObject>' +
        '<div xmlns="http://www.w3.org/1999/xhtml" style="width: 50px;height: 50px;background-color: #d0d0d0;position: relative;border-radius: 50%; overflow: hidden;">' +
          '<div style="width: 100%;height: ' + showPercentage + '%;background-color: #02c66c;position: absolute;bottom: 0">' +
            '<div style="width: 100%;height: ' + outgoingPercentage.toFixed(2) + '%;background-color: #ff0000;position: absolute;bottom: 0">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</foreignObject>'+
    '</svg>';
    var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

    var title = interpolate(this.projectTooltipTemplate, { 
      target: options.project.target,
      incomingValue: incomingValue,
      incomingPercentage: incomingPercentage.toFixed(2),
      outgoingValue: outgoingValue,
      outgoingPercentage: outgoingPercentage.toFixed(2)
    });

    this.rootNode = this.createNode(options.project, 1, {
      image: url,
      shape: 'image',
      color: this.projectColor,
      fixed: true,
      title: title
    });
    this.rootNode.label = '';

    var data = {
      nodes: [],
      edges: []
    };

    this.network = new vis.Network(element[0], data, $.extend({
      layout: {
        hierarchical: {
          direction: 'UD'
        }
      },
      edges: {
        smooth: {
          roundness: 0.5
        }
      }
    }, options.vis));

    this.network.on('select', function (obj) {
      if (obj.nodes.length) {
        var node = self.nodesMap[obj.nodes[0]];
        if (node) {
          element.trigger('chain:node', [obj.pointer, node]);
        } else if (obj.nodes[0].indexOf('_PAGE_') !== -1) {
          var parts = obj.nodes[0].split('_');
          if (parts[0] === 'incoming') {
            self.setIncomingPage(parseInt(parts[2]));
          } else {
            self.setOutgoingPage(parseInt(parts[2]));
          }
        }
      } else if (obj.edges.length) {
        var aggEdge = self.aggEdgesMap[obj.edges[0]];
        if (aggEdge) {
          element.trigger('chain:transcation', [obj.pointer, aggEdge.transcations]);
        }
      }
    });

    this.incomingPage = this.outgoingPage = 1;
    this.incomingPages = this.calculatePages(this.incomingNodes.length);
    this.outgoingPages = this.calculatePages(this.outgoingNodes.length);

    this.render();
  };

  ChainNetwork.prototype.calculatePages = function (count) {
    if (count <= this.pageSize) {
      return 1;
    } else if (count <= (this.pageSize - 1) * 2) {
      return 2;
    }
    count -= (this.pageSize - 1) * 2;
    return Math.ceil(count / (this.pageSize - 2)) + 2;
  };

  ChainNetwork.prototype.setIncomingPage = function (page) {
    if (this.incomingPage === page) {
      return;
    }
    this.incomingPage = page;
    this.render();
  };

  ChainNetwork.prototype.setOutgoingPage = function (page) {
    if (this.outgoingPage === page) {
      return;
    }
    this.outgoingPage = page;
    this.render();
  };

  ChainNetwork.prototype.render = function () {
    var self = this;
    this.pageEdges = [];
    this.prePageEdges = [];
    this.networkNodes = [this.rootNode];

    this.getNodesByType('incoming').forEach(function (node) {
      self.addNode(node, 0);
    });

    this.getNodesByType('outgoing').forEach(function (node) {
      self.addNode(node, 2);
    });

    var data = {
      nodes: this.networkNodes,
      edges: this.prePageEdges.concat(this.networkEdges.concat(this.pageEdges))
    };

    this.network.setData(data);
  };

  ChainNetwork.prototype.getNodesByType = function (type) {
    var nodes, page, pages;
    if (type === 'incoming') {
      nodes = this.incomingNodes;
      page = this.incomingPage;
      pages = this.incomingPages;
    } else {
      nodes = this.outgoingNodes;
      page = this.outgoingPage;
      pages = this.outgoingPages;
    }
    var start;
    if (page === 1) {
      start = 0;
      size = this.incomingPages === 1 ? this.pageSize : this.pageSize - 1;
    } else if (page === pages) {
      start = this.pageSize - 1 + (this.pageSize - 2) * (page - 2);
      size = this.pageSize - 1;
    } else {
      start = this.pageSize - 1 + (this.pageSize - 2) * (page - 2);
      size = this.pageSize - 2;
    }
    end = start + size;
    nodes = nodes.slice(start, end);
    if (page !== 1) {
      nodes.unshift(this.createPageNode(type, page - 1, this.prePageEdges, 'Previous Group'));
    }
    if (page !== pages) {
      nodes.push(this.createPageNode(type, page + 1, this.pageEdges, 'Next Group'));
    }
    return nodes;
  };

  ChainNetwork.prototype.createPageNode = function (type, page, edges, label) {
    var from, to, color, pageId = type + '_PAGE_' + page;
    if (type === 'incoming') {
      from = pageId;
      to = this.project.id;
      color = this.incomingEdgeColor;
    } else {
      from = this.project.id;
      to = pageId;
      color = this.outgoingEdgeColor;
    }

    edges.push({ 
      id: type + '_PAGE_' + page,
      arrows: 'to',
      from: from,
      to: to,
      color: color,
      arrowStrikethrough: false,
      smooth: false
    });

    return {
      id: pageId,
      label: label,
      group: 'page'
    };
  };

  ChainNetwork.prototype.addNode = function (node, level, extra) {
    this.networkNodes.push(this.createNode(node, level, extra));
  };

  ChainNetwork.prototype.createNode = function (node, level, extra) {
    return $.extend({
      level: level,
      physics: false
    }, extra, node);
  };

  var init = false;
  $.fn.chainNetwork = function (options) {
    var chainNetwork = new ChainNetwork(this, options);
    if (!init) {
      var font = $('<i class="fa fa-user" style="display:none"></i>');
      $('body').append(font);
      setTimeout(function () {
        chainNetwork.network.redraw();
        font.remove();
      }, 50);
      init = true;
    }
    return this.data('KEY', chainNetwork);
  };
})();
