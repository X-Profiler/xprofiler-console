'use strict';

module.exports = {
  isAjax(headers) {
    const accept = headers.accept || '';
    return accept.includes('application/json');
  },
};
