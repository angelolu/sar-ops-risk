"use strict";

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
  if (typeof color === 'undefined') color = colorTheme.surfaceContainer;
  var styles = cardStyles();
  var textStyle = (0, _styles.textStyles)();
  var contents = /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [title && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
      style: textStyle.cardTitleText,
      children: title
    }), subtitle && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
      style: [textStyle.text, title ? {} : {
        marginTop: 0
      }],
      children: subtitle
    }), children]
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: [styles.card, {
      backgroundColor: color
    }, noMargin && {
      marginHorizontal: 0
    }],
    children: href ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
      onPress: function onPress() {
        _expoRouter.router.navigate(href);
      },
      android_ripple: href === "" ? {} : {
        color: colorTheme.surfaceContainerHighest
      },
      style: {
        flexGrow: 1,
        padding: 24,
        gap: 8
      },
      children: contents
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: {
        flexGrow: 1,
        padding: 24,
        gap: 8
      },
      children: contents
    })
  });
};
var cardStyles = function cardStyles() {
  var _useContext2 = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext2.colorTheme;
  return _reactNative.StyleSheet.create({
    card: {
      marginLeft: 20,
      marginRight: 20,
      borderRadius: 26,
      // Rounded corners
      overflow: 'hidden'
    }
  });
};