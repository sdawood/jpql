const {ContextManager, ResourceNode} = require('../context');

describe('context manager', () => {

    it('should return initial state', () => {
        const ctx = new ContextManager();
        expect(ctx.head()).toEqual(ctx.merge(new ResourceNode(), {
            commit: 0,
            commitMessages: [],
            revision: -1,
            revisionTags: [],
            version: -1,
            versionTags: [],
            origin: 'master'
        }));
    });

//  it('should increment commit# with every commit', () => {
//    var ctx = new ContextManager();
//    var commitFeed = Rx.Observable.ofArrayChanges(ctx._branches['master']);
//    var subscription = commitFeed.subscribe(
//      (next) => { console.log('commitFeed', debug_inspect(next));},
//      (err) => { console.log('commitFeed', err);},
//      () => {console.log('commitFeed', 'completed');}
//    );
//    ctx.commit({$root: {x: 0, y: 0}}, 'commit#1');
//      expect(ctx.head()).toEqual(ctx.merge(new ResourceNode(), {
//        'commit': 1,
//        'commitMessages': [
//          'commit#1'
//        ],
//        'origin': 'master',
//        'revision': -1,
//        'revisionTags': [],
//        'version': -1,
//        'versionTags': [],
//        $root: {x: 0, y: 0}
//      }));
//      done();
//      subscription.dispose();
//  });

    it('should increment version# with every node', () => {
        const ctx = new ContextManager();
        ctx.node({$root: {x: 0, y: 1}}, '$root|node#1');
        expect(ctx.head()).toEqual(ctx.merge(new ResourceNode(), {
            '$root': {
                x: 0,
                y: 1
            },
            commit: 1,
            commitMessages: [
                '$root|node#1'
            ],
            origin: 'master',
            revision: -1,
            revisionTags: [],
            version: 0,
            versionTags: [
                '$root|node#1'
            ]
        }));
    });

    it('should increment commit# with every commit', () => {
        const ctx = new ContextManager();
        ctx.node({$root: {x: 0, y: 1}}, '$root|node#1');
        ctx.node({$node: {store: {book: [{title: 'book0'}]}}}, 'node#2');
        ctx.commit({$parent: {book: [{title: 'book0'}]}}, 'node#2|commit#1');
        expect(ctx.head()).toEqual(ctx.merge(new ResourceNode(), {
            '$node': {
                store: {
                    book: [
                        {
                            title: 'book0'
                        }
                    ]
                }
            },
            '$parent': {
                book: [
                    {
                        title: 'book0'
                    }
                ]
            },
            '$root': {
                x: 0,
                y: 1
            },
            commit: 3,
            commitMessages: [
                '$root|node#1',
                'node#2',
                'node#2|commit#1'
            ],
            origin: 'master',
            revision: -1,
            revisionTags: [],
            version: 1,
            versionTags: [
                '$root|node#1',
                'node#2'
            ]
        }));
    });

    it('should increment version# with every branch', () => {
        const ctx = new ContextManager();
        ctx.node({$root: {x: 0, y: 1}}, '$root|node#1');
        ctx.node({$node: {store: {book: [{title: 'book0'}]}}}, 'node#2');
        ctx.commit({$parent: {book: [{title: 'book0'}]}}, 'node#2|commit#1');
        ctx.branch({$parent: {title: 'book0'}}, 'node#2|commit#1|branch#1', 'branch1');
        expect(ctx.head()).toEqual(ctx.merge(new ResourceNode(), {
            '$node': {
                store: {
                    book: [
                        {
                            title: 'book0'
                        }
                    ]
                }
            },
            '$parent': {
                title: 'book0'
            },
            '$root': {
                x: 0,
                y: 1
            },
            commit: 4,
            commitMessages: [
                '$root|node#1',
                'node#2',
                'node#2|commit#1',
                'node#2|commit#1|branch#1'
            ],
            origin: 'master',
            revision: 0,
            revisionTags: [
                'node#2|commit#1|branch#1'
            ],
            version: 1,
            versionTags: [
                '$root|node#1',
                'node#2'
            ]
        }));
    });

    it('should keep branch changes isolated from master', () => {
        const ctx = new ContextManager();
        ctx.node({$root: {x: 0, y: 1}}, '$root|node#1');
        ctx.node({$parent: {store: {book: [{title: 'book0'}]}}}, 'node#2');
        ctx.commit({$parent: {book: [{author: 'author0'}]}}, 'node#2|commit#1');
        const branchfrommaster = ctx.branch({$parent: {author: 'author0'}}, 'node#2|commit#2|branch#1', 'branch1');
        ctx.commit({$options: {relative: true}}, 'branch1::options', null, false);
        const branchfrombranch = ctx.branch({$parent: 'author'}, 'node#2|commit#3|branch#2', 'branch2');
        ctx.commit({$options: {relative: true}}, 'branch2::options', null, false);
        ctx.switch(branchfrombranch.origin); // back to branch1
        ctx.switch(branchfrommaster.origin); // back to master
        ctx.commit({$parent: {author: 'author0'}}, 'node#2|commit#5|master');
        expect(ctx.head()).toEqual(ctx.merge(new ResourceNode(), {
            '$parent': {
                author: 'author0'
            },
            '$root': {
                x: 0,
                y: 1
            },
            commit: 4,
            commitMessages: [
                '$root|node#1',
                'node#2',
                'node#2|commit#1',
                'node#2|commit#5|master'
            ],
            origin: 'master',
            revision: -1,
            revisionTags: [],
            version: 1,
            versionTags: [
                '$root|node#1',
                'node#2'
            ]
        }));
    });

});