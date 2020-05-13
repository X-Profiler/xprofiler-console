'use strict';

module.exports = {
  async tryCatch(serv, func, args, message) {
    const { service } = this;

    let res = false;
    try {
      res = await service[serv][func](...args);
      if (!res) {
        res = true;
      }
    } catch (err) {
      this.logger.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        this.body = { ok: false, message };
        return res;
      }
      this.body = { ok: false, message: '服务器错误，请重试' };
      return res;
    }
    return res;
  },

  async getUserMap(userIds) {
    const { service: { mysql } } = this;
    let users = await mysql.getUserByUserIds(userIds);
    users = users.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {});
    return users;
  },
};
