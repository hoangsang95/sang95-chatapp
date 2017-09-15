var expect = require('expect');

var {generateMessage} = require('./message');

describe('generateMessage', () => {
    it('should generate correct message object', () => {
        var from = "Sang";
        var text = "Some text";
        var message = generateMessage(from,text);

        expect(message.createAt).toBeA('number');
        expect(message).toInclude({from,text});
    })
})