function getCookie(cookie) {
  let result = {};
  let arr = cookie.split(';');
  arr.map(el => {
    const cookieStr = el.split('=');
    result[cookieStr[0].split(" ").join("")] = cookieStr[1];
  });
  return result;
}

export const cookieParser = function(req, res, next) {
  if (req.headers.cookie) {
    req.parsedCookies = getCookie(req.headers.cookie);
  } else req.parsedCookies = {};
  req.pipe(res);
  next();
};

export const queryParser = function(req, res, next) {
  req.parsedQuery = req.query;
  req.pipe(res);
  next();
};