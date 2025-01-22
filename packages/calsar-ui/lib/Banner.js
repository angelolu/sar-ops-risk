"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Banner = void 0;
var _react = require("react");
var _reactNative = require("react-native");
var _ThemeContext = require("./ThemeContext");
var _jsxRuntime = require("react/jsx-runtime");
var Banner = exports.Banner = function Banner(_ref) {
  var title = _ref.title,
    icon = _ref.icon,
    backgroundColor = _ref.backgroundColor,
    color = _ref.color,
    _ref$pad = _ref.pad,
    pad = _ref$pad === void 0 ? false : _ref$pad,
    _ref$noRadius = _ref.noRadius,
    noRadius = _ref$noRadius === void 0 ? false : _ref$noRadius,
    onPress = _ref.onPress,
    children = _ref.children;
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme;
  if (typeof backgroundColor === 'undefined') backgroundColor = colorTheme.surfaceVariant;
  if (typeof color === 'undefined') color = colorTheme.onSurfaceVariant;
  if (onPress === undefined) return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
    style: [styles.card, {
      backgroundColor: backgroundColor
    }, pad && {
      marginLeft: 20,
      marginRight: 20
    }, noRadius && {
      borderRadius: 0
    }, styles.cardContainer],
    children: [icon, /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: {
        flexDirection: "column",
        flexShrink: 1
      },
      children: [title && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        style: {
          color: color
        },
        children: title
      }), children]
    })]
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: [styles.card, {
      backgroundColor: backgroundColor
    }, pad && {
      marginLeft: 20,
      marginRight: 20
    }, noRadius && {
      borderRadius: 0
    }],
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
      onPress: onPress,
      android_ripple: {
        color: backgroundColor
      },
      style: {
        flexGrow: 1
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: [styles.cardContainer],
        children: [icon, title && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: {
            color: color,
            flex: 1
          },
          children: title
        })]
      })
    })
  });
};
var styles = _reactNative.StyleSheet.create({
  card: {
    borderRadius: 26 // Rounded corners
  },
  cardContainer: {
    flexDirection: 'row',
    columnGap: 12,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexShrink: 1
  }
});