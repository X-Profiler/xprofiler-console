'use strict';

const Service = require('egg').Service;

class MysqlService extends Service {
  query(sql, params) {
    const { ctx: { app: { mysql } } } = this;
    const xprofiler_console = mysql.get('xprofiler_console');
    return xprofiler_console.query(sql, params);
  }

  /* table <user> */
  getUserByName(name) {
    const sql = 'SELECT * FROM user WHERE name = ?';
    const params = [name];
    return this.query(sql, params).then(data => data[0]);
  }

  saveUser(name, pass, identity) {
    const sql = 'INSERT INTO user (name, pass, identity) VALUES (?, ?, ?)';
    const params = [name, pass, identity];
    return this.query(sql, params);
  }

  getUserByIdentity(identity) {
    const sql = 'SELECT * FROM user WHERE identity = ?';
    const params = [identity];
    return this.query(sql, params).then(data => data[0]);
  }

  getUserByUserIds(userIds) {
    const sql = `SELECT * FROM user WHERE id in (${userIds.map(() => '?').join(',')})`;
    const params = [...userIds];
    return this.query(sql, params);
  }

  /* table <apps> */
  getMyApps(userId) {
    const sql = 'SELECT * FROM apps WHERE owner = ?';
    const params = [userId];
    return this.query(sql, params);
  }

  getJoinedApps(userId) {
    const sql = 'SELECT * FROM apps WHERE id in (SELECT app FROM members WHERE user = ?)';
    const params = [userId];
    return this.query(sql, params);
  }

  saveApp(userId, appName, secret) {
    const sql = 'INSERT INTO apps (name, owner, secret) VALUES (?, ?, ?)';
    const params = [appName, userId, secret];
    return this.query(sql, params);
  }

  renameApp(appId, newAppName) {
    const sql = 'UPDATE apps SET name = ? WHERE id = ?';
    const params = [newAppName, appId];
    return this.query(sql, params);
  }

  getAppByAppId(appId) {
    const sql = 'SELECT * FROM apps WHERE id = ?';
    const params = [appId];
    return this.query(sql, params).then(data => data[0] || {});
  }

  deleteApp(appId) {
    const sql = 'DELETE FROM apps WHERE id = ?';
    const params = [appId];
    return this.query(sql, params);
  }

  checkAppOwnerByUserId(appId, userId) {
    const sql = 'SELECT * FROM apps WHERE id = ? AND owner = ?';
    const params = [appId, userId];
    return this.query(sql, params).then(data => data[0]);
  }

  /* table <members> */
  getTeamMembersByAppId(appId) {
    const sql = 'SELECT * FROM members WHERE app = ?';
    const params = [appId];
    return this.query(sql, params);
  }

  checkAppMemberByUserId(appId, userId) {
    const sql = 'SELECT * FROM members WHERE app = ? AND user = ? AND status = ?';
    const params = [appId, userId, 2];
    return this.query(sql, params).then(data => data[0]);
  }

  inviteMember(appId, invitedUser) {
    const sql = 'INSERT INTO members (app, user, status) VALUES (?, ?, ?)';
    const params = [appId, invitedUser, 1];
    return this.query(sql, params);
  }
}

module.exports = MysqlService;
