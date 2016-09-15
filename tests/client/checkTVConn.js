var TVConnectionTestObject = Core.processObject({
    checkCodeGenerated: function() {
        var event = CatchEvent(TV_CreateConnectionRequest_Success);

        console.log(event);
    }
});

describe('DOM Elements tests', function() {
    var codeEl = document.getElementById('code');

    it('should be a tv connection code', function() {
        console.log(codeEl);
        //expect(codeEl.innerHTML).to.equal('');
        //expect(codeEl).to.not.equal(null);
    })
});