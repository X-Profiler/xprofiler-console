'use strict';

module.exports = {
  createFileKey(fileId, fileType) {
    return `${fileId}::${fileType}`;
  },

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

    const systemUser = 999999;
    if (userIds.includes(systemUser)) {
      users[systemUser] = {
        id: systemUser,
        name: 'System',
        nick: 'System',
      };
    }
    return users;
  },

  authFailed(code, message) {
    // const { app } = this;
    // if (app.isAjax(this.headers)) {
    //   this.body = { ok: false, message, code };
    // } else {
    //   this.redirect(`/${code}`);
    // }
    this.body = { ok: false, message, code };
  },

  checkPossibleParams(keys, thow = true) {
    const query = this.query;
    const body = this.request.body;

    for (const key of keys) {
      if (query[key] === undefined && body[key] === undefined) {
        if (thow) {
          this.authFailed(400, '缺少参数');
        }
        return false;
      }
    }
    return true;
  },

  async handleXtransitResponse(func, ...args) {
    const { service: { manager } } = this;
    const result = await manager[func](...args);
    if (!result) {
      this.body = { ok: false, message: 'Inner server error' };
      return false;
    }

    if (!result.ok) {
      this.body = result;
      return false;
    }

    const { stdout, stderr } = result.data;
    if (stderr) {
      this.body = { ok: false, message: stderr };
      return false;
    }

    return stdout;
  },

  checkAppMember(appId, userId) {
    const { service: { mysql } } = this;
    const tasks = [];
    tasks.push(mysql.checkAppOwnerByUserId(appId, userId));
    tasks.push(mysql.checkAppMemberByUserId(appId, userId, 2));
    return Promise.all(tasks);
  },
};
