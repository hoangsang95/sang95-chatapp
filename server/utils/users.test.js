const expect = require('expect');

var { Users } = require('./users');

describe('Users', () => {
    var users;
    beforeEach(() => {
        users = new Users();
        users.users = [
            { id: 1, name: 'Sang', room: 'NodeJS' },
            { id: 2, name: 'ABC', room: 'Angular' },
            { id: 3, name: 'DEF', room: 'NodeJS' }
        ]
    });

    it('should create new user', () => {
        var users = new Users();
        var resUser = {
            id: 123,
            name: 'Sang',
            room: 'a',
        };
        users.addUser(resUser.id, resUser.name, resUser.room);
        expect(users.users).toEqual([resUser]);
    });

    it('should remove user', () => {
        var userId = 1;
        var user = users.removeUser(userId);
        expect(user.id).toBe(userId);
        expect(users.users.length).toBe(2);
    });

    it('should not remove user', () => {
        var userId = 69;
        var user = users.removeUser(userId);
        expect(user).toNotExist();
        expect(users.users.length).toBe(3);
    })

    it('should find user', () => {
        var userId = 2;
        var user = users.getUser(userId);
        expect(user.id).toBe(userId);
    });

    it('should not find user', () => {
        var userId = 23;
        var user = users.getUser(userId);
        expect(user).toNotExist();
    });

    it('should return names for NodeJS', () => {
        var userList = users.getUserList('NodeJS');

        expect(userList).toEqual(['Sang', 'DEF']);
    });

    it('should return names for Angular', () => {
        var userList = users.getUserList('Angular');
        expect(userList).toEqual(['ABC']);
    });
})