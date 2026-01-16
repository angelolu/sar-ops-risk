"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BrandingBar = BrandingBar;
var _react = require("react");
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _ThemeContext = require("./ThemeContext");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var calsar = require('../assets/calsar_150.png');
var bannerAnimationTimeout;
var bannerHoverTimeout;
function BrandingBar(_ref) {
  var textColor = _ref.textColor,
    title = _ref.title,
    menuButton = _ref.menuButton,
    _ref$noLogo = _ref.noLogo,
    noLogo = _ref$noLogo === void 0 ? false : _ref$noLogo;
  var wordmarkOpacity = (0, _reactNativeReanimated.useSharedValue)(1); // Shared value for opacity
  var titleOpacity = (0, _reactNativeReanimated.useSharedValue)(0);
  var workmarkDisplay = (0, _reactNativeReanimated.useSharedValue)('flex');
  var titleDisplay = (0, _reactNativeReanimated.useSharedValue)('none');
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme;
  var styles = brandingStyles(colorTheme);
  var titleAnimatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function () {
    return {
      opacity: titleOpacity.value,
      display: titleDisplay.value
    };
  });
  var wordmarkAnimatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function () {
    return {
      opacity: wordmarkOpacity.value,
      display: workmarkDisplay.value
    };
  });
  var animateBanner = function animateBanner() {
    clearTimeout(bannerAnimationTimeout);
    wordmarkOpacity.value = 1;
    titleDisplay.value = "none";
    workmarkDisplay.value = "flex";
    titleOpacity.value = 0;
    bannerAnimationTimeout = setTimeout(function () {
      wordmarkOpacity.value = (0, _reactNativeReanimated.withTiming)(0, {
        duration: 500,
        easing: _reactNativeReanimated.Easing.linear
      });
      setTimeout(function () {
        titleDisplay.value = "flex";
        workmarkDisplay.value = "none";
        titleOpacity.value = (0, _reactNativeReanimated.withTiming)(1, {
          duration: 500,
          easing: _reactNativeReanimated.Easing.linear
        });
      }, 500);
    }, 2500);
  };

  // Animation on load
  (0, _react.useEffect)(function () {
    if (!noLogo) animateBanner();
    return function () {
      wordmarkOpacity.value = 0;
      titleDisplay.value = "flex";
      workmarkDisplay.value = "none";
      titleOpacity.value = 1;
    };
  }, []);
  var windowWidth = _reactNative.Dimensions.get('window').width;
  if (windowWidth > 600) {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: styles.brandingBanner,
      children: [noLogo ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: {
          flex: 1
        }
      }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.webWorkmarkContainer,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
          source: calsar,
          style: {
            width: 35,
            height: 35,
            zIndex: 999
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: styles.wordmarkStack,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.wordmarkLine1,
            children: "CALIFORNIA"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.wordmarkLine2,
            children: "SEARCH & RESCUE"
          })]
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        style: [styles.title, {
          color: textColor,
          flex: 1,
          textAlign: windowWidth > 1000 ? "center" : "right"
        }],
        children: title
      }), windowWidth > 1000 && (menuButton ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: [styles.menuContainer],
        children: menuButton
      }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: {
          flex: 1
        }
      }))]
    });
  } else {
    // Reanimate the banner if the mouse is hovering for over 500 ms
    // This way it's not too distracting but still a fun easter egg
    var onBannerEnter = function onBannerEnter() {
      bannerHoverTimeout = setTimeout(function () {
        animateBanner();
      }, 500);
    };
    var onBannerExit = function onBannerExit() {
      clearInterval(bannerHoverTimeout);
    };
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: styles.brandingBanner,
      onTouchEnd: animateBanner,
      onPointerEnter: onBannerEnter,
      onPointerLeave: onBannerExit,
      onPointerUp: animateBanner,
      children: noLogo ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        style: [styles.title, titleAnimatedStyle, {
          color: textColor
        }],
        children: title
      }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeReanimated["default"].Image, {
          source: calsar,
          style: {
            width: 35,
            height: 35,
            zIndex: 999
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNativeReanimated["default"].View, {
          style: [wordmarkAnimatedStyle, styles.wordmarkStack],
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.wordmarkLine1,
            children: "CALIFORNIA"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.wordmarkLine2,
            children: "SEARCH & RESCUE"
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeReanimated["default"].Text, {
          style: [styles.title, titleAnimatedStyle, {
            color: textColor
          }],
          children: title
        })]
      })
    });
  }
}
var brandingStyles = function brandingStyles(colorTheme) {
  return _reactNative.StyleSheet.create({
    brandingBanner: {
      marginTop: 14,
      marginLeft: 20,
      marginRight: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      height: 32
    },
    menuContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: 'hidden',
      flex: 1,
      alignItems: "flex-end"
    },
    webWorkmarkContainer: {
      flex: 1,
      gap: 12,
      flexDirection: 'row',
      alignItems: 'center'
    },
    title: {
      fontSize: 20,
      zIndex: 5,
      color: colorTheme.white,
      fontWeight: '600'
    },
    wordmarkStack: {
      flex: 1,
      flexDirection: 'column'
    },
    wordmarkLine1: {
      fontSize: 13,
      color: colorTheme.white
    },
    wordmarkLine2: {
      fontSize: 16,
      color: colorTheme.white,
      fontWeight: 'bold'
    }
  });
};