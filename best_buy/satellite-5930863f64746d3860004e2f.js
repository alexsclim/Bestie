// DTM Logger
// ---
window.DtmLogger=function(){var a="color: purple;",b="background-color: yellow; color: black;",c="background-color: black; color: red; font-size: 14px;",e=function(a,b){for(var c=[],d=a.length,e=!1,f=0;f<d;f++)"string"!=typeof a[f]||e?c.push(a[f]):(c.push("%c "+a[f]),c.push(b),e=!0);return c},f=function(){var b=Array.prototype.slice.call(arguments);console.debug.apply(console,e(b,a))},g=function(){var a=Array.prototype.slice.call(arguments);console.debug.apply(console,e(a,b))},h=function(){var a=Array.prototype.slice.call(arguments);console.debug.apply(console,e(a,c))};return{title:function(){var a=Array.prototype.slice.call(arguments);console.debug.apply(console,e(a,"background-color: #FFB6C1; color: white; font-weight: bold;"))},log:f,warn:g,error:h}}();

// Cookie Manager
// API here: https://github.com/js-cookie/js-cookie
!function(a){var b=!1;if("function"==typeof define&&define.amd&&(define(a),b=!0),"object"==typeof exports&&(module.exports=a(),b=!0),!b){var c=window.Cookies,d=window.Cookies=a();d.noConflict=function(){return window.Cookies=c,d}}}(function(){function a(){for(var a=0,b={};a<arguments.length;a++){var c=arguments[a];for(var d in c)b[d]=c[d]}return b}function b(c){function d(b,e,f){var g;if("undefined"!=typeof document){if(arguments.length>1){if(f=a({path:"/"},d.defaults,f),"number"==typeof f.expires){var h=new Date;h.setMilliseconds(h.getMilliseconds()+864e5*f.expires),f.expires=h}f.expires=f.expires?f.expires.toUTCString():"";try{g=JSON.stringify(e),/^[\{\[]/.test(g)&&(e=g)}catch(a){}e=c.write?c.write(e,b):encodeURIComponent(String(e)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),b=encodeURIComponent(String(b)),b=b.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),b=b.replace(/[\(\)]/g,escape);var i="";for(var j in f)f[j]&&(i+="; "+j,!0!==f[j]&&(i+="="+f[j]));return document.cookie=b+"="+e+i}b||(g={});for(var k=document.cookie?document.cookie.split("; "):[],l=/(%[0-9A-Z]{2})+/g,m=0;m<k.length;m++){var n=k[m].split("="),o=n.slice(1).join("=");'"'===o.charAt(0)&&(o=o.slice(1,-1));try{var p=n[0].replace(l,decodeURIComponent);if(o=c.read?c.read(o,p):c(o,p)||o.replace(l,decodeURIComponent),this.json)try{o=JSON.parse(o)}catch(a){}if(b===p){g=o;break}b||(g[p]=o)}catch(a){}}return g}}return d.set=d,d.get=function(a){return d.call(d,a)},d.getJSON=function(){return d.apply({json:!0},[].slice.call(arguments))},d.defaults={},d.remove=function(b,c){d(b,"",a(c,{expires:-1}))},d.withConverter=b,d}return b(function(){})});

// Helpers
// ---
window.Units = {
  MsToDays: 24 * 60 * 60 * 1000,
  DaysToHours: 24
};

window.getLanguage = function(localeString) {
  var matches = [{
      condition: /en-ca/i,
      language: 'English'
    },
    {
      condition: /fr-ca/i,
      language: 'French'
    },
  ];

  var matchedLanguage = '';

  matches.some(function(localeRoute) {
    matchedLanguage = localeRoute.condition.test(localeString) ? localeRoute.language : '';
    return matchedLanguage;
  });

  return matchedLanguage;
};


window.getProdSavingPercentage = function(prodSaving, prodPrice) {
  return Math.round(parseFloat(prodSaving) / (parseFloat(prodPrice) + parseFloat(prodSaving)) * 100) + '%';
};                 
                
window.ThirdPartyScripts = function() {
  // Load Google Conversion_async.js
  var conversionJs = document.createElement("script");
  conversionJs.src = "https://www.googleadservices.com/pagead/conversion_async.js";
  document.head.appendChild(conversionJs);
};
                 
// Generic Time Tracker
function DTMTimer() {
  this.timer = 0;
  return this;
}

// starts internal timer
DTMTimer.prototype.start = function() {
  DtmLogger.log('=== DTM Timer: timer started ===');
  this.timer = (new Date()).getTime();
}

// returns time lapsed from start
// does not reset timer
DTMTimer.prototype.lap = function() {
  var now = (new Date()).getTime();
  var lapsed = now - this.timer

  DtmLogger.log('=== DTM Timer: time lapsed: ' + lapsed + 'ms ===');
  return lapsed;
}

// returns time lapsed from start
// also resets timer
DTMTimer.prototype.stop = function() {
  var lapsed = this.lap();
  this.timer = 0;

  DtmLogger.log('=== DTM Timer: timer stopped. Time lapsed: ' + lapsed + 'ms ===');
  return lapsed;
}

window.DtmCookiesManager = (function() {
  var DtmCookiesMap = [{
      lookUp: 'partner',
      name: 'partner',
      config: {}
    },
    {
      lookUp: 'emi',
      name: 'dtmEMI',
      config: {
        path: '/',
        domain: window.envDomain,
        expires: 365
      }
    }
  ];

  var setCookie = function(name, value, config) {
    DtmLogger.log('=== setting cookie for ' + name + ' with value ' + value + ' ===');
    Cookies.set(name, value, config);
  };

  // Set site section cookie
  var setSiteSectionCookie = function(siteSection) {
    setCookie('dtm_siteSection', siteSection, {
      path: '/',
      domain: window.envDomain
    });
  };

  // CJ specific logic (from rule ~~~ CJ Comission ~~~)
  var setCjAffiliateCookie = function(queryMap) {
    var cjSource = queryMap.utm_source || null;
    var cjPublisher = queryMap.utm_content || null;
    var hasCmp = queryMap.cmp || false;
    var cjPrevPublisher = Cookies.get('dtmAffiliate-CJ');

    if ((cjPrevPublisher !== cjPublisher) && (cjSource !== null && cjPublisher !== null)) {
      var cjAffiliate = cjPublisher + ':' + (queryMap.acmp || '');
      setCookie('dtmAffiliate-CJ', cjAffiliate, {
        path: '/',
        domain: '.bestbuy.ca',
        expires: 14
      });
    }

    // clear cookie if external campaign
    if (hasCmp) {
      setCookie('dtmAffiliate-CJ', '', {
        path: '/',
        domain: '.bestbuy.ca',
        expires: 14
      });
      window.data_layer.hasCmp = true;
    }
  };

  // basic rule: if contains query string, set cookie to query param
  var routeCookies = function(queryMap) {
    DtmCookiesMap.forEach(function(cookieRoute) {
      var queryValue = queryMap[cookieRoute.lookUp] || queryMap[cookieRoute.lookUp.toUpperCase()] || undefined;

      // query string matched with a dtm cookie
      if (typeof queryValue !== 'undefined') {
        setCookie(cookieRoute.name, queryValue, cookieRoute.config);
      }
    });
  };

  var setPageLoadCookies = function(queryMap) {
    if (typeof queryMap === 'undefined') {
      return;
    }

    setSiteSectionCookie(Enums.SiteSection);
    routeCookies(queryMap);
    setCjAffiliateCookie(queryMap);
  };

  return {
    setPageLoadCookies: setPageLoadCookies
  };
})();

window.getParameter = function(parameter) {
  if (typeof parameter === 'string') {
    return decodeURIComponent((new RegExp('[?|&]' + parameter + '=' + '([^&;]+?)(&|#|;|$)').exec(location) || [, ""])[1].replace(/\+/g, '%20')) || null;
  } else if (parameter instanceof RegExp) {
    var paramsArray = location.href.match(/[?|&]\w+=([^&;]+?)(?=&|#|;|$)/g) || [];
    var filteredMatch = paramsArray.filter(function(qParams) {
      return qParams.match(parameter);
    });
    // no/multiple matches, bad param passed
    if (filteredMatch.length <= 0) {
      return '';
    } else {
      var paramValue = filteredMatch[0].split(parameter).filter(function(str) {return str.length != 0}) ||
        [,''];
      // trim first character, which is equal sign
      return paramValue[1].replace(/\+/g, '%20');
    }
  } else {
    return '';
  }
};

window.setCampaignData = function() {
  var cmpQuery = window.getParameter(/^(\?|\&)?cmp\=/i).replace(/^\=/, '');
  var icmpQuery = window.getParameter(/^(\?|\&)?icmp\=/i).replace(/^\=/, '');  

  window.persistentMetaData.icmp = icmpQuery;
  window.persistentMetaData.cmp = cmpQuery;

  var cmpRoutes = [{
      condition: /^bac-/ig,
      value: 'display'
    },
    {
      condition: /^eml-/ig,
      value: 'email'
    },
    {
      condition: /^(knc-|pla-)/ig,
      value: 'paid search'
    },
    {
      condition: /^fly-wdd-/ig,
      value: 'digital flyer'
    },
    {
      condition: /^sm-/ig,
      value: 'social media'
    }
  ];

  cmpRoutes.forEach(function(cmpRoute) {
    if (cmpRoute.condition instanceof RegExp) {
      if (cmpRoute.condition.test(cmpQuery)) {
        window.persistentMetaData.knownCmp = true;
        window.persistentMetaData.cmpChannel = cmpRoute.value;
      }
    }
  });
};

window.serializeProductName = function(pName) {
  if (typeof pName !== 'string') {
    return '';
  }

  var serializedName = pName.replace(/\,/g, '-');

  return serializedName;
};


// Script to build s.products
// ---
//
function DTMProduct() {
  if (typeof window.data_layer.product === 'undefined') {
    DtmLogger.error('=== DTM Libs: Failed to create s.product string: Product is empty in data layer ===');
    return;
  }

  var dtmProduct = this;
  var bundleProductsData = window.data_layer.product.product.bundleProducts;
  var isBundle = Array.isArray(bundleProductsData) && bundleProductsData.length > 0;
  var aggregateProductData = isBundle ? bundleProductsData : [window.data_layer.product.product];
  var PROD_QTY = 1;
  dtmProduct.evar = []; // global evars, applies to both products if product is bundle
  dtmProduct.event = []; // global events, applies to both products if product is bundle
  
  aggregateProductData.filter(function(productData) {
    return !productData.priceWithoutEhf;
  }).forEach(function(productData) {
    productData.priceWithoutEhf = window.data_layer.product.product.priceWithoutEhf;
  });
  
  dtmProduct.products = aggregateProductData.map(function(productData) {
    var serializedProductName = serializeProductName(productData.name);

    var productObj = {
      sku: productData.sku,
      qty: PROD_QTY,
      price: productData.priceWithoutEhf || '',
      evars: [
        {name: 'eVar51', value: serializedProductName + ':' + productData.sku},
        {name: 'eVar52', value: serializedProductName}
      ],
      events: []
    };

    if (isBundle) {
      productObj.evars.push({name: 'eVar10', value: window.data_layer.product.product.sku});
      productObj.evars.push({name: 'eVar11', value: serializeProductName(window.data_layer.product.product.name)});
    }

    return productObj;
  });

  return dtmProduct;
};

DTMProduct.prototype.addProp = function(propName, propValue) {
  if (typeof propName !== 'string') {
    DtmLogger.warn('=== DTM: tried pushing non-string prop name ===');
    return;
  }
  if (typeof propValue === 'undefined') {
    DtmLogger.warn('=== DTM: tried pushing undefined prop value for ' + propType + propName + ' to product string ===');
    return;
  }

  var propType = propName.match(/^\D*/ig)[0] || '';
  propType = (propType !== '') ? propType.toLowerCase() : propType;

  if (typeof this[propType] === 'undefined') {
    DtmLogger.warn('=== DTM: could not add ' + propType + ' as a prop to product string ===');
    return;
  }

  var duplicateIdx = 0;
  var hasDuplicate = this[propType].some(function(propObj, idx) {
    if (propObj.name === propName) {
      duplicateIdx = idx;
    }

    return propObj.name === propName;
  });

  if (hasDuplicate) {
    DtmLogger.log('=== DTM: overwrote ' + propName + ' with new value ===', propValue);
    this[propType][duplicateIdx].value = propValue;
  } else {
    this[propType].push({name: propName, value: propValue});
  }
};

DTMProduct.prototype.removeProp = function(propName) {
  if (typeof propName !== 'string') {
    DtmLogger.warn('=== DTM: prop not removed because prop not found in product string ===');
    return;
  }

  if (!this.evar instanceof Array) {
    DtmLogger.warn('=== DTM: prop cannot be removed; productString evars is not an array ===');
    return;
  }

  if (!this.evar.findIndex) {
    DtmLogger.warn('=== DTM: prop not removed; Array.prototype.findIndex is not supported ===');
    return;
  }

  var foundEvarIndex = -1;
  foundEvarIndex = this.evar.findIndex(function(evarObj) {
    return evarObj.name === propName;
  });

  if (foundEvarIndex < 0) {
    DtmLogger.warn('=== DTM: prop not removed; could not find evar in product string ===');
    return;
  }

  this.evar.splice(foundEvarIndex, 1); // remove evar from product string
};

DTMProduct.prototype.getString = function() {
  var dtmProduct = this;
  var productString = this.products.map(function(product) {
    var baseString = ';' + product.sku + ';' + product.qty + ';' + product.price;

    var productDependentEvars = product.evars.concat(dtmProduct.evar).map(function(evar) {
      return '' + evar.name + '=' + evar.value;
    }) || [];
    var productDependentEvents = product.events.concat(dtmProduct.event).map(function(ev) {
      return '' + ev.name + '=' + ev.value;
    }) || [];

    var evarsString = productDependentEvars.join('|');
    var eventsString = productDependentEvents.join('|');

    return baseString + ';' + eventsString + ';' + evarsString;
  }).join(',');

  return productString;
};

window.createProductStringBuilder = function() {
  var productBuilder;
  try {
    productBuilder = new DTMProduct();
  } catch(e) {
    DtmLogger.error('=== DTM Libs: Product String Builder failed to build ===');
    DtmLogger.error(e);
  } finally {
    return productBuilder;
  }
};

// strip scripts from ABs
var removeScripts = function(selectorName, htmlString) {
  if (typeof htmlString !== 'string' || htmlString === '') {
    return '';
  }

  var div = document.createElement('div');
  div.innerHTML = htmlString;
  var scriptNodes = div.querySelectorAll('script');

  DtmLogger.log('=== Removing ' + scriptNodes.length + ' scripts from offer ' + selectorName + ' ===');
  
  scriptNodes.forEach(function(scriptNode) {
    scriptNode.parentNode.removeChild(scriptNode);
  });

  return div.innerHTML;
};

var validateOffers = function(offers) {
  if (!offers instanceof Array) {
    return [];
  }

  return offers.map(function(offer) {
    if (offer.cssSelector !== undefined) {
      offer.content = removeScripts(offer.selector, offer.content);
    }
    
    return offer;
  });
};

// hotfix for ios11 ITP affecting XT on Mdot Home
var hotfixMboxSessionParam = function() {
  var cookiesMap = Cookies.get() || {};
  var mboxCookieStr = cookiesMap.mbox || '';

  if (!/session\#/ig.test(mboxCookieStr) || !/PC\#/ig.test(mboxCookieStr)) {
    DtmLogger.warn('=== mboxSession cookie is corrupted ===', mboxCookieStr);
    _satellite.track('ios11_mboxSession_override');
    return {
      'mboxSession': 'hotfix-10-2017'
    }
  }

  return {};
};


// Jan 16th: we fixed issue with corrupted mboxSession being empty param,
// (fixed by monkey patching req url with value)
// however, we still seeing issue with bad req, so logging entire req
// to see if there are other issues
(function() {
    var ajaxOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, reqUrl) {
      if (!/bestbuycanada\.tt\.omtrdc\.net/.test(reqUrl)) {
        // return early
        return ajaxOpen.apply(this, [method, reqUrl]);
      }
      // tracks offer responses in case of errors
      var blacklistedParams = [
        /bestbuycanada\.tt\.omtrdc\.net/ig, // filter out domain from url
        /browserwidth/ig,
        /browserheight/ig,
        /browsertimeoffset/ig,
        /screenheight/ig,
        /screenwidth/ig,
        /colordepth/ig,
        /mboxreferrer/ig,
        /vst\.trk/ig,
        /vst\.trks/ig
      ];
      var trackingStr = reqUrl.split('&').filter(function(paramInReq) {
        var isWhitelisted = true;
        var param = paramInReq;
        blacklistedParams.forEach(function(blacklistedParam) {
          if (blacklistedParam.test(param)) {
            isWhitelisted = false;
          }
        });

        return isWhitelisted;
      }).join('');

      trackOffersResponse(trackingStr);

      // patch fix
      var DEFAULT_MBOX_SESSION = 'e872a74cc53145aea95c5f240cadc1e5';
      var patchedUrl = reqUrl;
      if (/mboxSession=\&/i.test(reqUrl)) {
        var previousSession = Cookies.get('dtm_mSession') || DEFAULT_MBOX_SESSION;
        var patchedMboxSession = 'mboxSession=' + previousSession + '&';
        patchedUrl = reqUrl.replace(/mboxSession=\&/ig, patchedMboxSession);
      } else {
        var mboxSessionStr = Cookies.get('mbox').split('|').filter(function(el) { return /session/ig.test(el); }).join() || '';
        mboxSessionStr = mboxSessionStr.split('#')[1] || DEFAULT_MBOX_SESSION;
        Cookies.set('dtm_mSession', mboxSessionStr, {expires: 7});
      }
      
      return ajaxOpen.apply(this, [method, patchedUrl]);
    };
})();

// Jan 16th: we fixed issue with corrupted mboxSession being empty param,
// however, we still seeing issue with bad req, so logging entire req
// to see if there are other issues
var trackOffersResponse = function(paramStr) {
  var generateRandomId = function() {
    return Math.floor(Math.random() * 1000000);
  };
  try {
    var truncatedMsg = typeof paramStr === 'object' ? JSON.stringify(paramStr) : paramStr;
    var stitchId = '' + generateRandomId() + '|';
    var maxCharLen = 510 / 3;
    window.persistentMetaData.offersResponseA = stitchId + truncatedMsg.substr(0, maxCharLen);
    window.persistentMetaData.offersResponseB = stitchId + truncatedMsg.substr(171, maxCharLen);
    window.persistentMetaData.offersResponseC = stitchId + truncatedMsg.substr(341, maxCharLen);
    _satellite.track('Target OffersResponse');
    window.persistentMetaData.offersResponseA = undefined;
    window.persistentMetaData.offersResponseB = undefined;
    window.persistentMetaData.offersResponseC = undefined;
  } catch (e) {
    return '';
  };

  return '';
};

// Target Testing
// ---
window.TriggerTarget = function(params, mbox) {
  try {
    // Track mbox cookie to see if Apple's ITP is killing Target
    var cookiesMap = Cookies.get() || {};
    var mboxCookieStr = cookiesMap.mbox || '';
    var AMCVCookie = cookiesMap["AMCV_D6E638125859683E0A495D2D@AdobeOrg"] || '';
    window.persistentMetaData = window.persistentMetaData || {};
    window.persistentMetaData.mboxCookie = mboxCookieStr + ',' + AMCVCookie;

 // var patchMboxSessionParam = hotfixMboxSessionParam();
    var timer = new DTMTimer(); 
 // var paramsObj = Object.assign({}, params, patchMboxSessionParam);
    var paramsObj = Object.assign({}, params);
    DtmLogger.log('=== Target: Retrieving offers ===');
    timer.start();
    adobe.target.getOffer({
      'mbox': 'target-global-mbox',
      'params': paramsObj,
      'success': function(offers) {
        DtmLogger.log('=== Target: Applying offers ===');
        window.persistentMetaData.homeLoadTime = timer.lap();
        adobe.target.applyOffer({
          'mbox': 'target-global-mbox',
          'offer': validateOffers(offers)
        });
        timer.stop();
      },
      'error': function(status, error) {
        DtmLogger.error('=== Target getOffer failed: ' + error + ' ===');
      },
      'timeout': 5000
    });
  } catch (e) {
    DtmLogger.error('=== Target: failed to load ===');
    DtmLogger.error(e);
  }
};

// Mbox error tracking
var errorTrackingHandler = function(e) {
  window.persistentMetaData.errorType = e.detail.type;
  window.persistentMetaData.errorMsg = 'AtDebug ' + e.detail.message;

  // call DCR
  _satellite.track('Target ErrorTracking');

  // clear persistent data when done
  window.persistentMetaData.errorType = undefined;
  window.persistentMetaData.errorMsg = undefined;
};

document.addEventListener(adobe.target.event["CONTENT_RENDERING_FAILED"], errorTrackingHandler);
document.addEventListener(adobe.target.event["REQUEST_FAILED"], errorTrackingHandler);

