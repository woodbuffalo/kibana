import expect from 'expect.js';
import sinon from 'sinon';
import Status from '../status';
import ServerStatus from '../server_status';

describe('Status class', function () {
  let server;
  let serverStatus;

  beforeEach(function () {
    server = { expose: sinon.stub(), log: sinon.stub() };
    serverStatus = new ServerStatus(server);
  });

  it('should have an "uninitialized" state initially', function () {
    expect(serverStatus.create('test')).to.have.property('state', 'uninitialized');
  });

  it('emits change when the status is set', function (done) {
    let status = serverStatus.create('test');

    status.once('change', function (prev, prevMsg) {
      expect(status.state).to.be('green');
      expect(status.message).to.be('GREEN');
      expect(prev).to.be('uninitialized');

      status.once('change', function (prev, prevMsg) {
        expect(status.state).to.be('red');
        expect(status.message).to.be('RED');
        expect(prev).to.be('green');
        expect(prevMsg).to.be('GREEN');

        done();
      });

      status.red('RED');
    });

    status.green('GREEN');
  });

  it('should only trigger the change listener when something changes', function () {
    let status = serverStatus.create('test');
    let stub = sinon.stub();
    status.on('change', stub);
    status.green('Ready');
    status.green('Ready');
    status.red('Not Ready');
    sinon.assert.calledTwice(stub);
  });

  it('should create a JSON representation of the status', function () {
    let status = serverStatus.create('test');
    status.green('Ready');

    let json = status.toJSON();
    expect(json.state).to.eql('green');
    expect(json.message).to.eql('Ready');
  });

  it('should call on handler if status is already matched', function (done) {
    let status = serverStatus.create('test');
    let msg = 'Test Ready';
    status.green(msg);

    status.on('green', function (prev, prevMsg) {
      expect(arguments.length).to.equal(2);
      expect(prev).to.be('green');
      expect(prevMsg).to.be(msg);
      expect(status.message).to.equal(msg);
      done();
    });
  });

  it('should call once handler if status is already matched', function (done) {
    let status = serverStatus.create('test');
    let msg = 'Test Ready';
    status.green(msg);

    status.once('green', function (prev, prevMsg) {
      expect(arguments.length).to.equal(2);
      expect(prev).to.be('green');
      expect(prevMsg).to.be(msg);
      expect(status.message).to.equal(msg);
      done();
    });
  });

  function testState(color) {
    it(`should change the state to ${color} when #${color}() is called`, function () {
      let status = serverStatus.create('test');
      let message = 'testing ' + color;
      status[color](message);
      expect(status).to.have.property('state', color);
      expect(status).to.have.property('message', message);
    });

    it(`should trigger the "change" listner when #${color}() is called`, function (done) {
      let status = serverStatus.create('test');
      let message = 'testing ' + color;
      status.on('change', function (prev, prevMsg) {
        expect(status.state).to.be(color);
        expect(status.message).to.be(message);

        expect(prev).to.be('uninitialized');
        expect(prevMsg).to.be('uninitialized');
        done();
      });
      status[color](message);
    });

    it(`should trigger the "${color}" listner when #${color}() is called`, function (done) {
      let status = serverStatus.create('test');
      let message = 'testing ' + color;
      status.on(color, function (prev, prevMsg) {
        expect(status.state).to.be(color);
        expect(status.message).to.be(message);
        done();
      });
      status[color](message);
    });
  }

  testState('green');
  testState('yellow');
  testState('red');

});
