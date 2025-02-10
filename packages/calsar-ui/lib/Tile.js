"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tile = void 0;
var _expoRouter = require("expo-router");
var _react = require("react");
var _reactNative = require("react-native");
var _ThemeContext = require("./ThemeContext");
var _styles = require("./styles");
var _jsxRuntime = require("react/jsx-runtime");
var Tile = exports.Tile = function Tile(_ref) {
  var title = _ref.title,
    subtitle = _ref.subtitle,
    children = _ref.children,
    _ref$href = _ref.href,
    href = _ref$href === void 0 ? "" : _ref$href,
    icon = _ref.icon,
    _ref$width = _ref.width,
    width = _ref$width === void 0 ? "auto" : _ref$width,
    _onPress = _ref.onPress;
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme;
  var styles = tileStyles();
  var textStyle = (0, _styles.textStyles)();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: [styles.card, {
      width: width
    }],
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Pressable, {
      onPress: function onPress() {
        _onPress ? _onPress() : _expoRouter.router.navigate(href);
      },
      android_ripple: href === "" || _onPress ? {} : {
        color: colorTheme.surfaceContainerHighest
      },
      style: {
        flexGrow: 1,
        padding: 16,
        gap: 6,
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center"
      },
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: {
          flexDirection: "row",
          gap: 14,
          alignItems: "center",
          flexShrink: 1
        },
        children: [icon, /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: {
            flexShrink: 1,
            gap: 2
          },
          children: [title && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: textStyle.rowTitleTextPrimary,
            numberOfLines: 1,
            children: title
          }), subtitle && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: textStyle.tertiaryText,
            numberOfLines: 1,
            children: subtitle
          })]
        })]
      }), children]
    })
  });
};
var tileStyles = function tileStyles() {
  var _useContext2 = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext2.colorTheme;
  return _reactNative.StyleSheet.create({
    card: {
      backgroundColor: colorTheme.surfaceContainer,
      borderRadius: 6,
      // Rounded corners
      overflow: 'hidden'
    }
  });
};