const NameGenerator = (filename) => {
  let lastIndexof = filename.lastIndexOf(".");
  let ext = filename.substring(lastIndexof);
  let newfilename = `${Date.now()}${ext}`;
  return newfilename;
};

const validURL = (str) => {
  if (str) {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  } else {
    return true;
  }
};

const validEmail = (email) => {
  if (email) {
    let value = email.toString().trim();
    var valid = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(value);
    return valid;
  } else {
    return false;
  }
};

const validRegex = (string, regex) => {
  if (string) {
    let value = string.toString().trim();
    let regexString = regex.toString().trim();
    let regexPattern = new RegExp(regexString);
    var valid = regexPattern.test(value);
    return valid;
  } else {
    return false;
  }
};

const validDate = (date) => {
  if (date) {
    if (Object.prototype.toString.call(date) === "[object Date]") {
      if (isNaN(date.getTime())) {
        return false;
      } else {
        return true;
      }
    }
  } else {
    return false;
  }
};

subtractMonths = (date, months) => {
  var d = new Date(date || new Date());
  d.setMonth(d.getMonth() - (months || 0), d.getDate());
  return d;
};

module.exports = {
  validURL,
  validEmail,
  validRegex,
  validDate,
  subtractMonths
};
