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
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; } /**
 * IconButton
 * A modern icon-only button with MD3 styling and spring animations.
 */
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
    _ref$outline = _ref.outline,
    outline = _ref$outline === void 0 ? false : _ref$outline,
    color = _ref.color,
    size = _ref.size;
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme,
    getHoverColor = _useContext.getHoverColor;
  var _useState = (0, _react.useState)(false),
    _useState2 = _slicedToArray(_useState, 2),
    hovered = _useState2[0],
    setHovered = _useState2[1];
  var styles = buttonStyles();
  var scaleAnim = (0, _react.useRef)(new _reactNative.Animated.Value(1)).current;
  var handlePressIn = function handlePressIn() {
    if (disabled) return;
    _reactNative.Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 20
    }).start();
  };
  var handlePressOut = function handlePressOut() {
    if (disabled) return;
    _reactNative.Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  // Color Logic
  var colors = {
    primaryBg: colorTheme.primary,
    onPrimary: colorTheme.onPrimary,
    tonalBg: colorTheme.secondaryContainer,
    onTonal: colorTheme.onSecondaryContainer,
    outlineBorder: colorTheme.outline,
    onOutline: colorTheme.onSurfaceVariant,
    destructiveText: colorTheme.error,
    basicText: colorTheme.onSurfaceVariant,
    hoverBg: getHoverColor(colorTheme.onSurface, 0.08)
  };
  var finalBg = 'transparent';
  var finalIconColor = color || colors.basicText;
  var finalBorderColor = 'transparent';
  var finalBorderWidth = 0;
  if (disabled) {
    finalIconColor = getHoverColor(colorTheme.onSurface, 0.38);
    if (primary || tonal) finalBg = getHoverColor(colorTheme.onSurface, 0.12);
  } else if (primary) {
    finalBg = hovered ? getHoverColor(colors.primaryBg, 0.9) : colors.primaryBg;
    finalIconColor = color || colors.onPrimary;
  } else if (tonal) {
    finalBg = hovered ? getHoverColor(colors.tonalBg, 0.9) : colors.tonalBg;
    finalIconColor = color || colors.onTonal;
  } else if (outline) {
    finalBorderColor = colors.outlineBorder;
    finalBorderWidth = 1.5; // Standard MD3 border
    finalIconColor = color || colors.onOutline;
    if (hovered) finalBg = colors.hoverBg;
  } else {
    // Standard icon button
    if (hovered) finalBg = colors.hoverBg;
    if (destructive) finalIconColor = color || colors.destructiveText;
  }
  if (!ionicons_name) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: {
        height: small ? 36 : 44,
        width: small ? 36 : 44
      }
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Animated.View, {
    style: [styles.baseContainer, small && styles.smallBaseContainer, {
      backgroundColor: finalBg,
      borderColor: finalBorderColor,
      borderWidth: finalBorderWidth,
      transform: [{
        scale: scaleAnim
      }],
      opacity: disabled ? 0.6 : 1
    }],
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
      onHoverIn: function onHoverIn() {
        return setHovered(true);
      },
      onHoverOut: function onHoverOut() {
        return setHovered(false);
      },
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      onPress: disabled ? function () {} : onPress,
      android_ripple: {
        color: colorTheme.surfaceContainerHighest
      },
      style: styles.pressable,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_vectorIcons.Ionicons, {
        name: ionicons_name,
        size: small ? 18 : size || 24,
        color: finalIconColor
      })
    })
  });
};
var buttonStyles = function buttonStyles() {
  return _reactNative.StyleSheet.create({
    baseContainer: {
      height: 44,
      width: 44,
      borderRadius: 22,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center'
    },
    smallBaseContainer: {
      height: 36,
      width: 36,
      borderRadius: 18
    },
    pressable: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
};