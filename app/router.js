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
    agentAccessibleRequired,
    fileAccessibleRequired,
    strategyAccessibleRequired,
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
  router.get('/xapi/app', userRequired, appMemberRequired, 'app.getAppInfo');
  router.post('/xapi/app', userRequired, checkParams(['newAppName']), 'app.saveApp');

  // overview
  router.get('/xapi/overview_metrics', userRequired, appMemberRequired, 'overview.getOverviewMetrics');
  router.get('/xapi/main_metrics', userRequired, appMemberRequired, 'overview.getMainMetrics');

  // instance
  router.get('/xapi/agents', userRequired, appMemberRequired, 'instance.getAgents');
  router.get('/xapi/agent', userRequired, agentAccessibleRequired, checkParams(['agentId']), 'instance.checkAgent');

  // instance/process
  router.get('/xapi/node_processes', userRequired, agentAccessibleRequired, checkParams(['agentId']), 'process.getNodeProcesses');
  router.get('/xapi/xprofiler_processes', userRequired, agentAccessibleRequired, checkParams(['agentId']), 'process.getXprofilerProcesses');
  router.get('/xapi/xprofiler_status', userRequired, agentAccessibleRequired, checkParams(['agentId', 'pid']), 'process.checkXprofilerStatus');
  router.get('/xapi/process_trend', userRequired, agentAccessibleRequired, checkParams(['agentId', 'pid', 'trendType', 'duration']), 'process.getProcessTrend');
  router.post('/xapi/process_trend', userRequired, agentAccessibleRequired, checkParams(['agentId', 'pid']), 'process.saveProcessTrend');
  router.post('/xapi/action', userRequired, agentAccessibleRequired, checkParams(['agentId', 'pid', 'action']), 'process.takeAction');

  // instance/system
  router.get('/xapi/system_overview', userRequired, agentAccessibleRequired, checkParams(['agentId']), 'system.getOverview');
  router.get('/xapi/system_trend', userRequired, agentAccessibleRequired, checkParams(['agentId', 'trendType', 'duration']), 'system.getSystemTrend');

  // instance/error
  router.get('/xapi/error_files', userRequired, agentAccessibleRequired, checkParams(['agentId']), 'error.getFiles');
  router.get('/xapi/error_logs', userRequired, agentAccessibleRequired, checkParams(['agentId', 'errorFile', 'currentPage', 'pageSize']), 'error.getLogs');

  // instance/module
  router.get('/xapi/module_files', userRequired, agentAccessibleRequired, checkParams(['agentId']), 'module.getFiles');
  router.get('/xapi/module', userRequired, agentAccessibleRequired, checkParams(['agentId', 'moduleFile']), 'module.getModules');

  // file
  router.get('/xapi/files', userRequired, appMemberRequired, checkParams(['filterType', 'currentPage', 'pageSize']), 'file.getFiles');
  router.get('/file/download', userRequired, fileAccessibleRequired, checkParams(['fileId', 'fileType']), 'file.downloadFile');
  router.post('/xapi/file_status', userRequired, fileAccessibleRequired, checkParams(['files']), 'file.checkFileStatus');
  router.post('/xapi/file_transfer', userRequired, fileAccessibleRequired, checkParams(['fileId', 'fileType']), 'file.transferFile');
  router.post('/xapi/file_favor', userRequired, fileAccessibleRequired, checkParams(['fileId', 'fileType', 'favor']), 'file.favorFile');
  router.delete('/xapi/file_deletion', userRequired, fileAccessibleRequired, checkParams(['fileId', 'fileType']), 'file.deleteFile');

  // devtools
  router.get('/dashboard/devtools-new', userRequired, fileAccessibleRequired, checkParams(['fileId', 'fileType', 'selectedTab']), 'devtools.newDevtools');
  router.get('/dashboard/devtools-old', userRequired, fileAccessibleRequired, checkParams(['fileId', 'fileType', 'selectedTab']), 'devtools.oldDevtools');

  // thirdparty analytics
  router.get('/dashboard/speedscope', userRequired, fileAccessibleRequired, checkParams(['fileId', 'fileType', 'downloadPath']), 'thirdparty.speedscope');

  // upload file
  router.post('/xapi/upload_file', userRequired, appMemberRequired, checkParams(['fileType']), 'upload.fromConsole');
  router.post('/xapi/upload_from_xtransit', checkParams(['fileId', 'fileType', 'nonce', 'timestamp', 'signature']), 'upload.fromXtransit');

  // team
  router.get('/xapi/team_members', userRequired, appMemberRequired, 'team.getMembers');
  router.post('/xapi/team_member', userRequired, appMemberRequired, checkParams(['userId']), 'team.inviteMember');
  router.post('/xapi/team_ownership', userRequired, appOwnerRequired, checkParams(['userId']), 'team.transferOwnership');
  router.put('/xapi/invitation', userRequired, appInvitationRequired, checkParams(['status']), 'team.updateInvitation');
  router.delete('/xapi/leave_team', userRequired, appMemberRequired, 'team.leaveTeam');
  router.delete('/xapi/team_member', userRequired, appOwnerRequired, checkParams(['userId']), 'team.removeMember');

  // alarm
  router.get('/xapi/alarm_strategies', userRequired, appMemberRequired, 'alarm.getStrategies');
  router.post('/xapi/alarm_strategy', userRequired, appMemberRequired, 'alarm.addStrategy');
  router.put('/xapi/alarm_strategy', userRequired, strategyAccessibleRequired, 'alarm.updateStrategy');
  router.put('/xapi/alarm_strategy_status', userRequired, strategyAccessibleRequired, 'alarm.updateStrategyStatus');
  router.delete('/xapi/alarm_strategy', userRequired, strategyAccessibleRequired, 'alarm.deleteStrategy');

  // alarm/history
  router.get('/xapi/alarm_strategy_history', userRequired, strategyAccessibleRequired, 'alarm.getStrategyHistory');

  // alarm/contacts
  router.get('/xapi/alarm_strategy_contacts', userRequired, strategyAccessibleRequired, 'alarm.getStrategyContacts');
  router.post('/xapi/alarm_strategy_contact', userRequired, strategyAccessibleRequired, 'alarm.addContactToStrategy');
  router.delete('/xapi/alarm_strategy_contact', userRequired, strategyAccessibleRequired, 'alarm.deleteContactFromStrategy');

  // settings
  router.get('/xapi/settings', userRequired, appOwnerRequired, 'settings.getSettingInfo');
  router.put('/xapi/settings_app_name', userRequired, appOwnerRequired, checkParams(['newAppName']), 'settings.renameApp');
  router.delete('/xapi/settings_app', userRequired, appOwnerRequired, 'settings.deleteApp');
};
