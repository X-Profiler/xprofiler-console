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
    if (!userIds.length) {
      return [];
    }
    const sql = `SELECT * FROM user WHERE id in (${userIds.map(() => '?').join(',')})`;
    const params = [...userIds];
    return this.query(sql, params);
  }

  /* table <apps> */
  getMyApps(userId) {
    const sql = 'SELECT * FROM apps WHERE owner = ? ORDER BY gm_modified ASC';
    const params = [userId];
    return this.query(sql, params);
  }

  getJoinedApps(userId, status) {
    const sql = 'SELECT * FROM apps WHERE id in (SELECT app FROM members WHERE user = ? AND status = ?) ORDER BY gm_modified ASC';
    const params = [userId, status];
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

  deleteAppByAppId(appId) {
    const sql = 'DELETE FROM apps WHERE id = ?';
    const params = [appId];
    return this.query(sql, params);
  }

  checkAppOwnerByUserId(appId, userId) {
    const sql = 'SELECT * FROM apps WHERE id = ? AND owner = ?';
    const params = [appId, userId];
    return this.query(sql, params).then(data => data[0]);
  }

  checkAppMemberByUserId(appId, userId, status) {
    const sql = 'SELECT * FROM apps WHERE id in (SELECT app FROM members WHERE app = ? AND user = ? AND status = ?)';
    const params = [appId, userId, status];
    return this.query(sql, params).then(data => data[0]);
  }

  updateAppOwner(appId, userId) {
    const sql = 'UPDATE apps SET owner = ? WHERE id = ?';
    const params = [userId, appId];
    return this.query(sql, params);
  }

  /* table <members> */
  getTeamMembersByAppId(appId) {
    const sql = 'SELECT * FROM members WHERE app = ?';
    const params = [appId];
    return this.query(sql, params);
  }

  inviteMember(appId, invitedUser, status) {
    const sql = 'INSERT INTO members (app, user, status) VALUES (?, ?, ?)';
    const params = [appId, invitedUser, status];
    return this.query(sql, params);
  }

  confirmInvitation(invitedApp, userId) {
    const sql = 'UPDATE members SET status = ? WHERE app = ? AND user = ?';
    const params = [2, invitedApp, userId];
    return this.query(sql, params);
  }

  deleteMember(appId, userId) {
    const sql = 'DELETE FROM members WHERE app = ? AND user = ?';
    const params = [appId, userId];
    return this.query(sql, params);
  }

  deleteMembersByAppId(appId) {
    const sql = 'DELETE FROM members WHERE app = ?';
    const params = [appId];
    return this.query(sql, params);
  }
}

module.exports = MysqlService;
