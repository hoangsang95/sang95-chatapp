var expect = require('expect');

var { generateMessage, generateLocationMessage } = require('./message');

describe('generateMessage', () => {
    it('should generate correct message object', () => {
        var from = "Sang";
        var text = "Some text";
        var message = generateMessage(from,text);

        expect(message.createAt).toBeA('number');
        expect(message).toInclude({from,text});
    })
});

describe('generateLocationMessage', () => {
    it('should generate correct location message object', () => {
        var from = 'Sang';
        var latitude = 1;
        var longitude = 2;
        var url = 'https://www.google.com/maps?q=1,2';
        var message = generateLocationMessage(from, latitude, longitude);

        expect(message.createAt).toBeA('number');
        expect(message).toInclude({from, url});
    });
});