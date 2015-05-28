var assert = require('chai').assert;
var jpql = require('../lib/index');

suite('jsonGpath', function() {

  test('Conditional Graph Edges', function () {
    /**
     * Walking an edge is a genral case of moving to the path next component.
     * In otherwords, jsonpath is a special case of walking graph edges, but since the graph is limited to a tree, where every child has one and only one parent,
     * walking from parent to child is implicitely waking the edge === 'has'.
     * Within an edge expression - by convention surrounded by [ and ] - a child can walk an edge to the parent using $, or to a remote relative using $.path.to.relative.
     * navigation is exclusively within the sub-graph we accessed as $ earlier, which provides an inherent scoping security aspect.
     * within the edge expression ( member, filter, script, slice, ... ) child can access:
     * 1. @ == immediate parent
     * 2. $ == sub-graph root
     * 3. @$ == immediate parent for easy access to siblings
     * Obviously relative bacwards path from child to parent are a no brainer in case of JSON, since in a json tree there is one and only one parent
     * in "json" mode:
     * - @$$ can easily point back to the grandparent
     * - @$$$ grand grand parent, etc ...
     * - @.parent.grandparent[-1:]
     * -
     * */
    var path = jpql.parse("node(id: 123){id,name,birthdate{month,day}, friends[?(@.knows === $.name; )][0:10.profile[name, email, avatar],10:50[name]]}");
    assert.deepEqual(path, []);
  });
})
