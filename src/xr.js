/**
 * xr (c) James Cleveland 2015
 * URL: https://github.com/radiosilence/xr
 * License: BSD
 */

const res = xhr => ({
  status: xhr.status,
  response: xhr.response,
  xhr: xhr
});

const assign = function(t, s) {
  let l = arguments.length, i = 1;
  while (i < l) {
    let s = arguments[i++];
    for (let k in s) { t[k] = s[k]; }
  }
  return t;
};

const getParams = (data, url) => {
  let ret = [];
  for (let k in data) ret.push(`${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`);
  if (url && url.split('?').length > 1) ret.push(url.split('?')[1]);
  return ret.join('&');
};

const Methods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS'
};

const defaults = {
  method: Methods.GET,
  data: undefined,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  dump: JSON.stringify,
  load: JSON.parse,
  promise: (typeof window !== "undefined") ? window.Promise : Promise
};

const promise = (args, fn) => new (
  (args && args.promise)
    ? args.promise
    : defaults.promise
)(fn);

const xr = args => promise(args, (resolve, reject) => {

  let opts = assign({}, defaults, args);


  let xhr = new XMLHttpRequest();

  xhr.open(
    opts.method,
    opts.params
      ? `${opts.url.split('?')[0]}?${getParams(opts.params)}`
      : opts.url,
    true
  );
  xhr.addEventListener('load', () => (xhr.status >= 200 && xhr.status < 300)
    ? resolve(assign({}, res(xhr), {
      data: xhr.response
        ? opts.load(xhr.response)
        : null
    }), false)
    : reject(res(xhr))
  );

  if (opts.raw) {
    delete opts.headers['Content-Type'];
  }

  for (let header in opts.headers) xhr.setRequestHeader(header, opts.headers[header]);
  for (let event in opts.events) xhr.addEventListener(event, opts.events[event].bind(null, xhr), false);

  xhr.send(
    (typeof opts.data === 'object' && !opts.raw)
      ? opts.dump(opts.data)
      : opts.data
  );
});

xr.assign = assign;
xr.Methods = Methods;
xr.defaults = defaults;

xr.get = (url, params, args) => xr(assign({url: url, method: Methods.GET, params: params}, args));
xr.put = (url, data, args) => xr(assign({url: url, method: Methods.PUT, data: data}, args));
xr.post = (url, data, args) => xr(assign({url: url, method: Methods.POST, data: data}, args));
xr.patch = (url, data, args) => xr(assign({url: url, method: Methods.PATCH, data: data}, args));
xr.del = (url, args) => xr(assign({url: url, method: Methods.DELETE}, args));
xr.options = (url, args) => xr(assign({url: url, method: Methods.OPTIONS}, args));

export default xr;
