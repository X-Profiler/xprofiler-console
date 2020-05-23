'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router } = app;
  const {
    userRequired,
    appInvitationRequired,
    appMemberRequired,
    appOwnerRequired,
    fileAccessibleRequired,
  } = app.middlewares.auth({}, app);
  const {
    checkParams,
  } = app.middleware.params({}, app);

  // home
  router.get('/', userRequired, 'home.index');

  // user
  router.get('/xapi/user', userRequired, 'user.index');

  // app
  router.get('/xapi/apps', userRequired, checkParams(['type']), 'app.getApps');
  router.post('/xapi/app', userRequired, checkParams(['newAppName']), 'app.saveApp');
  router.get('/xapi/app', userRequired, appMemberRequired, 'app.getAppInfo');

  // overview
  router.get('/xapi/overview_metrics', userRequired, appMemberRequired, 'overview.getOverviewMetrics');
  router.get('/xapi/main_metrics', userRequired, appMemberRequired, 'overview.getMainMetrics');

  // instance
  router.get('/xapi/agents', userRequired, appMemberRequired, 'instance.getAgents');
  router.get('/xapi/agent', userRequired, appMemberRequired, checkParams(['agentId']), 'instance.checkAgent');

  // instance/process
  router.get('/xapi/node_processes', userRequired, appMemberRequired, checkParams(['agentId']), 'process.getNodeProcesses');
  router.get('/xapi/xprofiler_processes', userRequired, appMemberRequired, checkParams(['agentId']), 'process.getXprofilerProcesses');
  router.get('/xapi/xprofiler_status', userRequired, appMemberRequired, checkParams(['agentId', 'pid']), 'process.checkXprofilerStatus');
  router.get('/xapi/process_trend', userRequired, appMemberRequired, checkParams(['agentId', 'pid', 'trendType', 'duration']), 'process.getProcessTrend');
  router.post('/xapi/action', userRequired, appMemberRequired, checkParams(['agentId', 'pid', 'action']), 'process.takeAction');

  // instance/system
  router.get('/xapi/system_overview', userRequired, appMemberRequired, checkParams(['agentId']), 'system.getOverview');
  router.get('/xapi/system_trend', userRequired, appMemberRequired, checkParams(['agentId', 'trendType', 'duration']), 'system.getSystemTrend');

  // file
  router.get('/xapi/files', userRequired, appMemberRequired, checkParams(['filterType', 'currentPage', 'pageSize']), 'file.getFiles');
  router.post('/xapi/file_status', userRequired, fileAccessibleRequired, checkParams(['files']), 'file.checkFileStatus');

  // team
  router.put('/xapi/invitation', userRequired, appInvitationRequired, checkParams(['status']), 'team.updateInvitation');
  router.get('/xapi/team_members', userRequired, appMemberRequired, 'team.getMembers');
  router.post('/xapi/team_member', userRequired, appMemberRequired, checkParams(['userId']), 'team.inviteMember');
  router.delete('/xapi/leave_team', userRequired, appMemberRequired, 'team.leaveTeam');
  router.delete('/xapi/team_member', userRequired, appOwnerRequired, checkParams(['userId']), 'team.removeMember');
  router.post('/xapi/team_ownership', userRequired, appOwnerRequired, checkParams(['userId']), 'team.transferOwnership');

  // settings
  router.get('/xapi/settings', userRequired, appOwnerRequired, 'settings.getSettingInfo');
  router.put('/xapi/settings_app_name', userRequired, appOwnerRequired, checkParams(['newAppName']), 'settings.renameApp');
  router.delete('/xapi/settings_app', userRequired, appOwnerRequired, 'settings.deleteApp');
};
