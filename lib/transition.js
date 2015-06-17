var nodeTypes = require('./ligula/node-types')

function transition(component, node, message) {
  /**
   * Conditionally transition context to a new node (version)
   * node argument should be a single partial (literal, object or list)
   * */

  var scope = component.scope.split('|')[0];
  var key = [ component.operation, scope, component.expression.type ].join('-');
  var link = nodeTypes[key];
  switch (link) {
    case	'.@':
    case	'.#':
    case	'.@@':
    case	'.(@)':
    case	'.({@})':
      return this.node({$node: node, $parent: node, $path: node.path}, message, null, {location: link});
    case	'.*':
    case	'..@':
    case	'..#':
    case	'..@@':
    case	'..(@)':
    case	'..({@})':
    case	'..*':
      return this.commit({$parent: node}, link); //noop
    case	'[$]':
    case	'[@]':
    case	'[#]':
    case	'[&]':
    case	'[@@]':
    case	'[{{#}}]':
    case	'[(@)]':
    case	'[({@})]':
      return this.node({$node: node, $parent: node, $path: node.path}, message, null, {location: link});
    case	'[#:#]':
    case	'[({@}):({@})]':
    case	'[?(@)]':
    case	'[*]':
      return this.commit({$parent: node}, link); //noop
    case	'[,]':
      return this.commit({$parent: node}, link); //noop
    case	'..[@]':
    case	'..[#]':
    case	'..[?(@)]':
    case	'..[*]':
    case	'..[,]':
      return this.commit({$parent: node}, link); //noop
  }
}

module.exports = {
  transition: transition,
};
