'use strict';

module.exports = {
  async mockUser(user) {
    this.mockContext({
      user: {
        userId: 1,
        name: 'mockuser',
        nick: 'mocknick',
        mail: 'mockuser@mock.com',
        ...user,
      },
    });
  },
};
