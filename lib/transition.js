var TRANSITIONS = {
  'member-child-identifier':                    '.@',
  'member-child-numeric_literal':               '.#',
  'member-child-keyword':                       '.@@',
  'member-child-script_expression':             '.(@)',
  'member-child-script_expression|active':      '.({@})',
  'member-child-wildcard':                      '.*',
  'member-descendant-identifier':               '..@',
  'member-descendant-numeric_literal':          '..#',
  'member-descendant-keyword':                  '..@@',
  'member-descendant-script_expression':        '..(@)',
  'member-descendant-script_expression|active': '..({@})',
  'member-descendant-wildcard':                 '..*',
  'subscript-child-root':                       '[$]',
  'subscript-child-identifier':                 '[@]',
  'subscript-child-numeric_literal':            '[#]',
  'subscript-child-string_literal':             '[&]',
  'subscript-child-keyword':                    '[@@]',
  'subscript-child-active_position':            '[{{#}}]',
  'subscript-child-script_expression':          '[(@)]',
  'subscript-child-script_expression|active':   '[({@})]',
  'subscript-child-slice':                      '[#:#]',
  'subscript-child-slice|active':               '[({@}):({@})]',
  'subscript-child-filter_expression':          '[?(@)]',
  'subscript-child-wildcard':                   '[*]',
  'subscript-child-union':                      '[,]',
  'subscript-descendant-identifier':            '..[@]',
  'subscript-descendant-numeric_literal':       '..[#]',
  'subscript-descendant-filter_expression':     '..[?(@)]',
  'subscript-descendant-wildcard':              '..[*]',
  'subscript-descendant-union':                 '..[,]',
  descend:                                    '..?',
  traverse:                                   '*?'
};

function transition(component, node, message) {
  /**
   * Conditionally transition context to a new node (version)
   * node argument should be a single partial (literal, object or list)
   * */

  var scope = component.scope.split('|')[0];
  var key = [ component.operation, scope, component.expression.type ].join('-');
  var link = TRANSITIONS[key];
  switch (link) {
    case	'.@':
    case	'.#':
    case	'.@@':
    case	'.(@)':
    case	'.({@})':
      return this.node({$node: node, $parent: node, $path: node.path}, link + ':' + message);
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
      return this.node({$node: node, $parent: node, $path: node.path}, link + ':' + message);
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
  tags: TRANSITIONS
};
