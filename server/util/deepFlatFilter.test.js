const deepFlatFilter = require('./deepFlatFilter');

describe('deepFlatFilter', () => {
    it('finds values shallowly and deeply in nested object', () => {
        const testCallback = value => value?.detectable === true;
        const nested = [
            {
                detectable: true,
                title: 'some title',
                channel_id: '123we',
                options: [
                    {
                        channel_id: 'abc',
                        image: 'http://asdasd.com/all-inclusive-block-img.jpg',
                        title: 'All-Inclusive',
                        options: [
                            {
                                channel_id: 'dsa2',
                                title: 'Some Recommends',
                                options: [
                                    {
                                        image: 'http://www.asdasd.com',
                                        title: 'Sandals',
                                        id: '1',
                                        content: {},
                                        detectable: true
                                    }
                                ]
                            },
                            false,
                            null,
                            undefined,
                            () => {},
                            'Television'
                        ]
                    }
                ]
            }
        ];
        const result = deepFlatFilter(nested, testCallback);
        expect(result.length).toBe(2);
        expect(result[0].channel_id).toBe('123we');
        expect(result[1].title).toBe('Sandals');
    });

    it('handles null', () => {
        let result;
        expect(() => {
            result = deepFlatFilter(null, value => value?.detectable === true);
        }).not.toThrow();
        expect(result).toEqual([]);
    });
});
