const jp = require('../../index');

const data = require('./data/store.json');

describe('orig-google-code-issues', () => {

    it('comma in eval', () => {
        const pathExpression = '$..book[?(@.price && ",")]';
        const results = jp.query(data, pathExpression);
        expect(results).toEqual(data.store.book);
    });

    it('member names with dots', () => {
        const data = {'www.google.com': 42, 'www.wikipedia.org': 190};
        const results = jp.query(data, '$["www.google.com"]');
        expect(results).toEqual([42]);
    });

    it('nested objects with filter', () => {
        const data = {
            dataResult: {
                object: {
                    objectInfo: {
                        className: 'folder',
                        typeName: 'Standard Folder',
                        id: 'uniqueId'
                    }
                }
            }
        };
        const results = jp.query(data, '$..object[?(@.className=="folder")]');
        expect(results).toEqual([data.dataResult.object.objectInfo]);
    });

    it('script expressions with @ char', () => {
        const data = {'DIV': [{'@class': 'value', 'val': 5}]};
        const results = jp.query(data, '$..DIV[?(@["@class"]=="value")]');
        expect(results).toEqual(data.DIV);
    });

});

