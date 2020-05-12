'use strict';

const Service = require('egg').Service;

class MysqlService extends Service {
  consoleQuery(sql, params) {
    const { ctx: { app: { mysql } } } = this;
    const xprofiler_console = mysql.get('xprofiler_console');
    return xprofiler_console.query(sql, params);
  }

  getUserByName(name) {
    const sql = 'SELECT * FROM user WHERE name = ?';
    const params = [name];
    return this.consoleQuery(sql, params).then(data => data[0]);
  }

  saveUser(name, pass) {
    const sql = 'INSERT INTO user (name, pass) VALUES (?, ?)';
    const params = [name, pass];
    return this.consoleQuery(sql, params);
  }

  getMyApps(userId) {
    const sql = 'SELECT * FROM apps WHERE owner = ?';
    const params = [userId];
    return this.consoleQuery(sql, params);
  }

  getJoinedApps(userId) {
    const sql = 'SELECT * FROM apps WHERE id in (SELECT app FROM members WHERE user = ?)';
    const params = [userId];
    return this.consoleQuery(sql, params);
  }

  saveApp(userId, appName, secret) {
    const sql = 'INSERT INTO apps (name, owner, secret) VALUES (?, ?, ?)';
    const params = [appName, userId, secret];
    return this.consoleQuery(sql, params);
  }
}

module.exports = MysqlService;
