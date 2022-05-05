'use strict';

const zlib = require('zlib');
const promisify = require('util').promisify;
const gzip = promisify(zlib.gzip);
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const Controller = require('egg').Controller;

class ProcessController extends Controller {
  async getNodeProcesses() {
    const { ctx } = this;
    const { appId, agentId } = ctx.query;

    const processes = await ctx.handleXtransitResponse('getAgentNodeProcesses', appId, agentId);
    if (processes === false) {
      return;
    }

    const list = processes.split('\n')
      .map(process => {
        const [pid, command] = process.split('\u0000');
        if (pid && command) {
          return ({ pid, command });
        }
      })
      .filter(process => process);

    ctx.body = { ok: true, data: { list } };
  }

  async getXprofilerProcesses() {
    const { ctx, ctx: { service: { overview } } } = this;
    const { appId, agentId } = ctx.query;

    const tasks = [];
    tasks.push(overview.getLatestProcessData(appId, agentId));
    tasks.push(overview.getLatestProcessData(appId, agentId, 60 * 24, true));
    tasks.push(ctx.handleXtransitResponse('getAgentNodeProcesses', appId, agentId));
    let [logs, all, processes] = await Promise.all(tasks);
    if (processes === false) {
      return;
    }

    processes = processes.split('\n')
      .map(process => {
        const [pid, command] = process.split('\u0000');
        if (pid && command) {
          return ({ pid: Number(pid), command });
        }
      })
      .filter(process => process);

    const data = { list: [], nodes: [] };

    if (!logs) {
      data.nodes = processes;
    } else {
      const checked = Object.entries(logs).concat(Object.entries(all));
      for (const [pid, log] of checked) {
        const process = processes.filter(process => Number(process.pid) === Number(pid))[0];
        const {
          uptime,
          log_time,
          cpu_60,
          heap_used_percent,
          gc_time_during_last_record,
          rss,
          active_handles,
          active_timer_handles,
          active_tcp_handles,
          active_udp_handles,
        } = log;

        const proc = {
          pid,
          cmd: process ? process.command : undefined,
          startTime: (process ? Date.now() : new Date(log_time).getTime()) - uptime * 1000,
          updateTime: process ? undefined : new Date(log_time).getTime(),
          cpuUsage: cpu_60.toFixed(2),
          heapUsage: heap_used_percent.toFixed(2),
          gcUsage: (gc_time_during_last_record / (60 * 1000) * 100).toFixed(2),
          rss,
          uvHandles: active_handles,
          timers: active_timer_handles,
          tcpHandles: active_tcp_handles,
          udpHandles: active_udp_handles,
        };

        data.list.push(proc);
      }
    }

    const livingProcesses = data.list.filter(proc => proc.cmd);

    if (!data.list.length || !livingProcesses.length) {
      data.nodes = processes;
    } else {
      data.list.sort();
    }

    ctx.body = { ok: true, data };
  }

  async checkXprofilerStatus() {
    const { ctx } = this;
    const { appId, agentId, pid } = ctx.query;

    const stdout = await ctx.handleXtransitResponse('checkProcessStatus', appId, agentId, pid);
    if (stdout === false) {
      return;
    }

    const data = JSON.parse(stdout);

    ctx.body = { ok: true, data };
  }

  async getProcessTrend() {
    const { ctx, ctx: { service: { process } } } = this;
    const { appId, agentId, pid, trendType, duration } = ctx.query;

    const period = duration * 60;
    const trends = await process.getDataByPeriodAndPid(appId, agentId, period, pid);
    const data = process.handleTrends(trends, trendType, duration);

    ctx.body = { ok: true, data };
  }

  async saveProcessTrend() {
    const { ctx, ctx: { app: { storage, modifyFileName }, service: { process, mysql } } } = this;
    const { appId, agentId, pid } = ctx.request.body;
    const { userId } = ctx.user;

    // get trend map
    const saveTrendDuration = 24; // 1w
    const trends = await process.getDataByPeriodAndPid(appId, agentId, saveTrendDuration * 60, pid);
    const trendTypes = [
      'heapTrend', 'cpuTrend', 'heapSpaceTrend',
      'gcTrend', 'uvTrend', 'qpsTrend',
      'timerTrend', 'tcpTrend', 'udpTrend'];
    const trendMap = trendTypes.reduce((map, type) => {
      map[type] = process.handleTrends(trends, type, saveTrendDuration);
      return map;
    }, {});

    // save trends
    const storageName = `u-${uuidv4()}-u-x-process-snapshot-${pid}-` +
      `${moment().format('YYYYMMDD')}-${parseInt(Math.random() * 10e4)}.trend`;
    const fileName = modifyFileName(storageName);
    const tasks = [];
    tasks.push(mysql.addFile(appId, agentId, 'trend', fileName, userId, 3, storageName));
    tasks.push(storage.saveFile(storageName, await gzip(JSON.stringify(trendMap))));
    await Promise.all(tasks);

    ctx.body = { ok: true, data: { file: fileName } };
  }

  async takeAction() {
    const { ctx, ctx: { app: { config: { profilingTime } }, service: { mysql } } } = this;
    const { appId, agentId, pid, action } = ctx.request.body;

    let command = '';
    const options = {};
    switch (action) {
      case 'cpuprofile':
        command = 'start_cpu_profiling';
        options.profiling_time = profilingTime[command];
        break;
      case 'heapprofile':
        command = 'start_heap_profiling';
        options.profiling_time = profilingTime[command];
        break;
      case 'gcprofile':
        command = 'start_gc_profiling';
        options.profiling_time = profilingTime[command];
        break;
      case 'heapsnapshot':
        command = 'heapdump';
        break;
      case 'diag':
        command = 'diag_report';
        break;
      case 'core':
        command = 'generate_coredump';
        break;
      default:
        break;
    }

    if (!command) {
      return (ctx.body = { ok: false, message: `不支持的操作: ${action}` });
    }

    const result = await ctx.handleXtransitResponse('takeAction', appId, agentId, pid, command, options);
    if (result === false) {
      return;
    }
    const { type, filepath: file, executable_path, alinode_version, node_version } = JSON.parse(result);
    const { userId } = ctx.user;
    if (type === 'core') {
      const executableInfo = { executable_path, version: alinode_version ? alinode_version : node_version };
      await mysql.addCoredump(appId, agentId, file, JSON.stringify(executableInfo), userId, 1, '', 1, '');
    } else {
      await mysql.addFile(appId, agentId, action, file, userId);
    }

    ctx.body = { ok: true, data: { file } };
  }
}

module.exports = ProcessController;
