const checkDevice = (obj) => {
  if (obj) {
    if (obj.header("user-agent").toLowerCase().indexOf("mobile") != -1) {
      return "mobile";
    } else if (
      obj.header("user-agent").toLowerCase().indexOf("postman") != -1
    ) {
      return "postman";
    } else {
      return "computer";
    }
  } else {
    return "undefined";
  }
};

export default checkDevice;
