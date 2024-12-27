"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IconButton = void 0;
var _vectorIcons = require("@expo/vector-icons");
var _react = require("react");
var _reactNative = require("react-native");
var _ThemeContext = require("./ThemeContext");
var _jsxRuntime = require("react/jsx-runtime");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var IconButton = exports.IconButton = function IconButton(_ref) {
  var ionicons_name = _ref.ionicons_name,
    onPress = _ref.onPress,
    _ref$small = _ref.small,
    small = _ref$small === void 0 ? false : _ref$small,
    _ref$destructive = _ref.destructive,
    destructive = _ref$destructive === void 0 ? false : _ref$destructive,
    _ref$disabled = _ref.disabled,
    disabled = _ref$disabled === void 0 ? false : _ref$disabled,
    _ref$primary = _ref.primary,
    primary = _ref$primary === void 0 ? false : _ref$primary,
    _ref$tonal = _ref.tonal,
    tonal = _ref$tonal === void 0 ? false : _ref$tonal,
    color = _ref.color,
    size = _ref.size;
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme;
  var _useState = (0, _react.useState)(false),
    _useState2 = _slicedToArray(_useState, 2),
    focus = _useState2[0],
    setFocus = _useState2[1];
  var styles = buttonStyles();
  var disabledFun = function disabledFun() {};
  var textColors = {
    basic: colorTheme.onSurfaceVariant,
    primary: colorTheme.onPrimary,
    disabled: colorTheme.onSurface,
    destructive: colorTheme.error,
    tonal: colorTheme.onSecondaryContainer
  };
  var focusTheme = focus && !disabled ? {
    backgroundColor: colorTheme.surfaceContainerHigh
  } : {};
  if (ionicons_name) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: [styles.baseContainer, small && styles.smallBaseContainer, disabled && styles.disabled, primary && styles.primary, tonal && styles.tonal],
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
        onHoverIn: function onHoverIn() {
          setFocus(true);
        },
        onHoverOut: function onHoverOut() {
          setFocus(false);
        },
        onPress: disabled ? disabledFun : onPress,
        android_ripple: disabled || {
          color: colorTheme.surfaceContainerHighest
        },
        style: [styles.pressable, focusTheme],
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_vectorIcons.Ionicons, {
          name: ionicons_name,
          size: small ? 16 : size || 24,
          color: color || disabled && textColors.disabled || destructive && textColors.destructive || primary && textColors.primary || tonal && textColors.tonal || textColors.basic
        })
      })
    });
  } else {
    // Just return a space holder
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: {
        height: small ? 32 : 40
      }
    });
  }
};
var buttonStyles = function buttonStyles() {
  var _useContext2 = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext2.colorTheme;
  return _reactNative.StyleSheet.create({
    primary: {
      backgroundColor: colorTheme.primary
    },
    disabled: {
      backgroundColor: colorTheme.onSurface,
      opacity: 0.2
    },
    tonal: {
      backgroundColor: colorTheme.secondaryContainer
    },
    baseContainer: {
      height: 40,
      width: 40,
      borderRadius: 20,
      overflow: 'hidden'
    },
    smallBaseContainer: {
      height: 32,
      width: 32,
      borderRadius: 16
    },
    pressable: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
};