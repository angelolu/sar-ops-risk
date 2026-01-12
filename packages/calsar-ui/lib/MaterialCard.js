"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MaterialCard = void 0;
var _expoRouter = require("expo-router");
var _react = require("react");
var _reactNative = require("react-native");
var _ThemeContext = require("./ThemeContext");
var _styles = require("./styles");
var _jsxRuntime = require("react/jsx-runtime");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; } /**
 * MaterialCard
 * A MD3 card component with optional hover and press animations (if a href is provided)
 * Fixed hook stability and improved contrast.
 */
var MaterialCard = exports.MaterialCard = function MaterialCard(_ref) {
  var title = _ref.title,
    subtitle = _ref.subtitle,
    children = _ref.children,
    _ref$href = _ref.href,
    href = _ref$href === void 0 ? "" : _ref$href,
    color = _ref.color,
    _ref$noMargin = _ref.noMargin,
    noMargin = _ref$noMargin === void 0 ? false : _ref$noMargin;
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme;
  var textStyle = (0, _styles.textStyles)();
  var styles = cardStyles();
  var _useState = (0, _react.useState)(false),
    _useState2 = _slicedToArray(_useState, 2),
    hovered = _useState2[0],
    setHovered = _useState2[1];
  var scaleAnim = (0, _react.useRef)(new _reactNative.Animated.Value(1)).current;
  var colorVal = color || colorTheme.surfaceContainer;
  var handlePressIn = function handlePressIn() {
    if (!href) return;
    _reactNative.Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 20
    }).start();
  };
  var handlePressOut = function handlePressOut() {
    if (!href) return;
    _reactNative.Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };
  var contents = /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [title && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
      style: [textStyle.cardTitleText, {
        color: colorTheme.primary,
        fontWeight: '700'
      }],
      children: title
    }), subtitle && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
      style: [textStyle.text, {
        marginTop: title ? 2 : 0,
        color: colorTheme.onSurfaceVariant
      }],
      children: subtitle
    }), children]
  });
  var cardStyle = [styles.card, _objectSpread({
    backgroundColor: colorVal,
    transform: [{
      scale: scaleAnim
    }]
  }, colorVal === colorTheme.surfaceContainerLowest ? {
    borderWidth: 1,
    borderColor: colorTheme.outlineVariant
  } : {}), noMargin && {
    marginHorizontal: 0
  }, hovered && href && {
    backgroundColor: colorTheme.surfaceContainerHigh
  }];
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Animated.View, {
    style: cardStyle,
    children: href ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
      onHoverIn: function onHoverIn() {
        return setHovered(true);
      },
      onHoverOut: function onHoverOut() {
        return setHovered(false);
      },
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      onPress: function onPress() {
        _expoRouter.router.navigate(href);
      },
      android_ripple: {
        color: colorTheme.surfaceContainerHighest
      },
      style: function style(_ref2) {
        var pressed = _ref2.pressed;
        return [styles.pressable, {
          backgroundColor: pressed && _reactNative.Platform.OS !== 'android' ? colorTheme.surfaceContainerHighest : 'transparent'
        }];
      },
      children: contents
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: styles.contentContainer,
      children: contents
    })
  });
};
var cardStyles = function cardStyles() {
  return _reactNative.StyleSheet.create({
    card: _objectSpread(_objectSpread({
      marginHorizontal: 20,
      marginVertical: 6,
      borderRadius: 20,
      overflow: 'hidden'
    }, _reactNative.Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1
        },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 1
      }
    })), _reactNative.Platform.select({
      web: {
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    })),
    pressable: {
      flexGrow: 1,
      padding: 24,
      gap: 12
    },
    contentContainer: {
      flexGrow: 1,
      padding: 24,
      gap: 12
    }
  });
};