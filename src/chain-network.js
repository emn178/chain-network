/**
 * [chain-network]{@link https://github.com/emn178/chain-network}
 *
 * @version 0.1.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2017
 */
(function () {
  var KEY = 'chain-network';

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
    this.transcationsMap = {}
    this.transcations = options.transcations || [];
    var incomingValue = 0, outgoingValue = 0;
    this.transcations.forEach(function (transcation) {
      self.transcationsMap[transcation.id] = transcation;
      var color, dashes = false;
      if (transcation.to === self.project.id) {
        self.incomingNodeIds[transcation.from] = true;
        color = self.incomingEdgeColor;
        incomingValue += transcation.value;
      } else {
        color = self.outgoingEdgeColor;
        if (self.incomingNodeIds[transcation.to]) {
          dashes = true;
        }
        outgoingValue += transcation.value;
      }
      var edge = $.extend({
        arrows: 'to',
        color: color,
        dashes: dashes,
        label: transcation.value
      }, transcation);
      self.networkEdges.push(edge);
    });

    var levelSize = Math.ceil(this.pageSize / 2);
    var incomingCount = Object.keys(this.incomingNodeIds).length;
    var outgoingCount = this.nodes.length - incomingCount;
    var incomingSwitch = incomingCount > levelSize;
    var outgoingSwitch = outgoingCount > levelSize;
    var leftIndex = 0, rightIndex = 0, level;
    this.nodes.forEach(function (node) {
      if (self.incomingNodeIds[node.id]) {
        if (incomingSwitch) {
          level = leftIndex % 2 ? 0 : 1;
        } else {
          level = 1;
        }
        ++leftIndex;
      } else {
        if (outgoingSwitch) {
          level = rightIndex % 2 ? 4 : 3;
        } else {
          level = 3;
        }
        ++rightIndex;
      }
      self.addNode(node, level);
    });

    var incomingPercentage = incomingValue / options.project.target * 100;
    var outgoingPercentage = outgoingValue / incomingValue * 100;
    var showPercentage = Math.min(incomingPercentage, 100).toFixed(2);

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" >' +
      '<foreignObject>' +
        '<div xmlns="http://www.w3.org/1999/xhtml" style="width: 20px;height: 20px;background-color: #d0d0d0;position: relative;border-radius: 50%; overflow: hidden;">' +
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
      incomingPercentage: incomingPercentage,
      outgoingValue: outgoingValue,
      outgoingPercentage: outgoingPercentage
    });

    this.addNode(options.project, 2, {
      image: url,
      shape: 'image',
      color: this.projectColor,
      fixed: true,
      title: title
    });

    var data = {
      nodes: this.networkNodes,
      edges: this.networkEdges
    };

    this.network = new vis.Network(element[0], data, $.extend({
      layout: {
        hierarchical: {
          direction: 'LR'
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
          element.trigger('chain:node', node);
        }
      } else if (obj.edges.length) {
        var transcation = self.transcationsMap[obj.edges[0]];
        if (transcation) {
          element.trigger('chain:transcation', transcation);
        }
      }
    });
  };

  ChainNetwork.prototype.addNode = function (node, level, extra) {
    node = $.extend({
      level: level,
      physics: false
    }, extra, node);
    this.networkNodes.push(node);
  }

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
