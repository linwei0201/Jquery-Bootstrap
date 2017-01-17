import {findDOMNode} from 'react-dom';
// 当serach中带有参数debug时， 为调试模式
export const openPageDebug = url => getSearch('debug') ? window.open(url) : (window.location.href = url);

// 获取所有的search
export const getSearchAll = () => {
  let res = {};
  let search = window.location.search;
  if(search === '') {
    return res;
  }
  let arr = search.substring(1).split('&');
  arr.map((v, i) => {
    let temp = v.split('=');
    res[temp[0]] = decodeURIComponent(temp[1]);
  });
  return res;
};

// 获取单个search
export const getSearch = key => {
  return getSearchAll()[key];
};

// json => string
export const jsonToString = json => {
  let ret = '';
  for(let k in json) {
    ret += `&${k}=${json[k]}`;
  }
  return ret.substring(1);
};

// json => array
export const jsonToArray = (json, first) => {
  let ret = [];
  first && ret.push(['', first]);
  for(let k in json) {
    ret.push([k, json[k]])
  }
  return ret;
};

// 函数节流
export const throttle = (fn, delay, mustRunDelay) => {
  let timer = null;
  let t_start;
  return function() {
    let context = this,
        args = arguments,
        t_curr = +new Date();
    clearTimeout(timer);
    if(!t_start) {
      t_start = t_curr;
    }
    if(t_curr - t_start >= mustRunDelay) {
      fn.apply(context, args);
      t_start = t_curr;
    }else {
      timer = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    }
  }
};

// 首字母大写
export const firstUpperCase = s => s.replace(/^\S/, (s) => s.toUpperCase());

// 净化json
export const pureJson = json => {
  for(let k in json) {
    if(json[k] === '' || json[k] === undefined) {
      delete json[k];
    }
  }
};

// 时间补零(两位数)
export const padTime = s => ('0' + s).slice(-2);

// 将秒数格式化成 hh:mm:ss
export const formatSecToTime = (num, separator = ':') => {
  let h = Math.floor(num / 3600);
  let m = Math.floor((num - h * 3600) / 60);
  let s = num % 60;
  return [padTime(h), padTime(m), padTime(s)].join(separator);
};

// 将 hh:mm:ss 变成秒数
export const formatTimeToSec = (time, separator = ':') => {
  let [h, m, s] = time.split(separator).map(v => +v);
  return 3600 * h + 60 * m + s;
};

// 获取 YYYY-mm-dd
export const getTimeFormate = (date, separator = '-') => {
  if(typeof date === 'number') {
    date = new Date(date);
  }
  return [date.getFullYear(), (date.getMonth() + 1), date.getDate()].map((v, i) => i == 0 ? v : padTime(v)).join(separator);
};

// 交换数组的位置
export const moveArray = (arr, m, n) => [arr[m], arr[n]] = [arr[n], arr[m]];

// 中文2, 英文1
export const getRealLength = s => s.replace(/[^\x00-\xff]/g, 'aa').length;


//判断是否URL
const isURL = str => {
    let expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    let regex = new RegExp(expression);
    return !!str.match(regex);
}


const checkSingle = (type, value, $ele) => {
  switch (type){
    case "error":
      return !($ele.hasClass("err") || $ele.has(".err").length);
    case "editor":
    case "not null":
      return !!value;
    case "not empty array":
      return !!value && !!value.length;
    case "url":
      return isURL(value);
    case "level":
      return (value === 0) || (!!value);
    case "levels":
      return value[0] || (value[1] && value[2])
    default:
      return false;
  }
}

//校验输入是否合法
export const checkValidInput = (types, value, $ele) => {
  let isValid = true;
  for(var t of types){
    if(!checkSingle(t, value, $ele)){
      isValid = false;
    }
  }
  return isValid;
}

/*
* url
* type    get post
* data    请求参数
* success 成功回调
* fail    请求成功，但服务端返回errno
* error   请求失败回调 404，500等
*/
export const SendAjax = ({url, type="get", data={}, success=()=>{}, fail=()=>{}, error=()=>{}, ...params}) => {
  var dtd = $.Deferred();
  let ajaxObj = {
    url: url,
    type: type,
    data: data,
    success: data => {
      if(!data.errno){
        success(data);
        dtd.resolve();
      }else{
        fail(data);
        // console.error(`API Error => URL:${url}, msg:${data.errMsg}`);
        dtd.reject();
      }
    },
    error: err => {
      error(err);
      console.error(`API Error Code: ${err.status}=> URL:${url}, msg:${err.statusText}`);
      dtd.reject();
    }
  };
  ajaxObj = Object.assign(ajaxObj, params);
  $.ajax(ajaxObj);
  return dtd.promise();
}


export const setHighLight = (words) => {
    if(!words || !words.length){
        $("input[type='text'], textarea, .keywordWrap .tags li").removeClass("has-sense-word");
        return false;
    }
    $("input[type='text']:not(.tag, [name='url'] input), textarea, .keywordWrap .tags li").each(function(k, v){
        let val = $(this).is("li") ? $(this).attr("value") : $(this).val();
        $(this).removeClass("has-sense-word");
        for(let word of words){
            if(val.indexOf(word) >= 0){
                $(this).addClass("has-sense-word");
                break;
            }
        }
    })

}

export const isMounted = (component) => {
  // exceptions for flow control :(
  try {
    findDOMNode(component);
    return true;
  } catch (e) {
    // Error: Invariant Violation: Component (with keys: props,context,state,refs,_reactInternalInstance) contains `render` method but is not mounted in the DOM
    return false;
  }
};
