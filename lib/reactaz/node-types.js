/**
 * Created by sdawood on 13/06/2015.

 REACTAZ (Resource Active Tags) or just call me "raz"
 ^
 10   Meet Reac Taz
 9
 8        ^   ^
 7       (@) (#)
 6          $
 5      <=-...+=>
 4
 3         ><
 2        DATA
 1        TAZ
 0 1 2 3 4 5 6 7 8 9 10 $*/

module.exports = {
  'member-child-identifier':                      '.@',
  'member-child-numeric_literal':                 '.#',
  'member-child-keyword':                         '.@@',
  'member-child-script_expression':               '.(@)',
  'member-child-script_expression|active':        '.({@})',
  'member-child-wildcard':                        '.*',
  'member-descendant-identifier':                 '..@',
  'member-descendant-numeric_literal':            '..#',
  'member-descendant-keyword':                    '..@@',
  'member-descendant-script_expression':          '..(@)',
  'member-descendant-script_expression|active':   '..({@})',
  'member-descendant-wildcard':                   '..*',
  'subscript-child-root':                         '[$]',
  'subscript-child-identifier':                   '[@]',
  'subscript-child-numeric_literal':              '[#]',
  'subscript-child-string_literal':               '[&]',
  'subscript-child-keyword':                      '[@@]',
  'subscript-child-active_position':              '[{{#}}]',
  'subscript-child-script_expression':            '[(@)]',
  'subscript-child-script_expression|active':     '[({@})]',
  'subscript-child-slice':                        '[#:#]',
  'subscript-child-slice|active':                 '[({@}):({@})]',
  'subscript-child-filter_expression':            '[?(@)]',
  'subscript-child-wildcard':                     '[*]',
  'subscript-child-union':                        '[,]',
  'subscript-descendant-identifier':              '..[@]',
  'subscript-descendant-numeric_literal':         '..[#]',
  'subscript-descendant-filter_expression':       '..[?(@)]',
  'subscript-descendant-wildcard':                '..[*]',
  'subscript-descendant-union':                   '..[,]',
  descend:                                        '..?',
  traverse:                                       '*?',
  $reverseLookup: {
    '.@':                                         'member-child-identifier',                   
    '.#':                                         'member-child-numeric_literal',              
    '.@@':                                        'member-child-keyword',                      
    '.(@)':                                       'member-child-script_expression',            
    '.({@})':                                     'member-child-script_expression|active',     
    '.*':                                         'member-child-wildcard',                     
    '..@':                                        'member-descendant-identifier',              
    '..#':                                        'member-descendant-numeric_literal',         
    '..@@':                                       'member-descendant-keyword',                 
    '..(@)':                                      'member-descendant-script_expression',       
    '..({@})':                                    'member-descendant-script_expression|active',
    '..*':                                        'member-descendant-wildcard',                
    '[$]':                                        'subscript-child-root',                      
    '[@]':                                        'subscript-child-identifier',                
    '[#]':                                        'subscript-child-numeric_literal',           
    '[&]':                                        'subscript-child-string_literal',            
    '[@@]':                                       'subscript-child-keyword',                   
    '[{{#}}]':                                    'subscript-child-active_position',           
    '[(@)]':                                      'subscript-child-script_expression',         
    '[({@})]':                                    'subscript-child-script_expression|active',  
    '[#:#]':                                      'subscript-child-slice',                     
    '[({@}):({@})]':                              'subscript-child-slice|active',              
    '[?(@)]':                                     'subscript-child-filter_expression',         
    '[*]':                                        'subscript-child-wildcard',                  
    '[,]':                                        'subscript-child-union',                     
    '..[@]':                                      'subscript-descendant-identifier',           
    '..[#]':                                      'subscript-descendant-numeric_literal',      
    '..[?(@)]':                                   'subscript-descendant-filter_expression',    
    '..[*]':                                      'subscript-descendant-wildcard',             
    '..[,]':                                      'subscript-descendant-union',                
    '..?':                                        'descend',
    '*?':                                         'traverse'
  }
};