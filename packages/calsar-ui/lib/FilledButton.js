"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SegmentedButtons = exports.FilledButton = void 0;
var _react = require("react");
var _reactNative = require("react-native");
var _vectorIcons = require("@expo/vector-icons");
var _ThemeContext = require("./ThemeContext");
var _styles = require("./styles");
var _jsxRuntime = require("react/jsx-runtime");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var FilledButton = exports.FilledButton = function FilledButton(_ref) {
  var text = _ref.text,
    onPress = _ref.onPress,
    _ref$small = _ref.small,
    small = _ref$small === void 0 ? false : _ref$small,
    _ref$icon = _ref.icon,
    icon = _ref$icon === void 0 ? false : _ref$icon,
    _ref$disabled = _ref.disabled,
    disabled = _ref$disabled === void 0 ? false : _ref$disabled,
    _ref$destructive = _ref.destructive,
    destructive = _ref$destructive === void 0 ? false : _ref$destructive,
    _ref$primary = _ref.primary,
    primary = _ref$primary === void 0 ? false : _ref$primary,
    _ref$rightAlign = _ref.rightAlign,
    rightAlign = _ref$rightAlign === void 0 ? false : _ref$rightAlign,
    backgroundColor = _ref.backgroundColor,
    _ref$selected = _ref.selected,
    selected = _ref$selected === void 0 ? false : _ref$selected;
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme,
    getHoverColor = _useContext.getHoverColor;
  var _useState = (0, _react.useState)(false),
    _useState2 = _slicedToArray(_useState, 2),
    focus = _useState2[0],
    setFocus = _useState2[1];
  var textStyle = (0, _styles.textStyles)();
  var buttonStyle = buttonStyles();
  var disabledFun = function disabledFun() {};
  var buttonColors = {
    disabled: getHoverColor(colorTheme.onSurface, 0.3),
    "default": focus ? getHoverColor(colorTheme.surfaceContainerHigh) : "transparent",
    primary: focus ? getHoverColor(colorTheme.primary) : colorTheme.primary,
    selected: focus ? getHoverColor(colorTheme.secondary) : colorTheme.secondary,
    destructive: focus ? getHoverColor(colorTheme.error, 0.1) : "transparent"
  };
  var textColors = {
    disabled: getHoverColor(colorTheme.surface),
    "default": colorTheme.secondary,
    primary: colorTheme.onPrimary,
    selected: colorTheme.onSecondary,
    destructive: colorTheme.error
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: [buttonStyle.baseContainer, small && buttonStyle.smallBaseContainer, rightAlign && {
      alignSelf: 'flex-end'
    }, {
      backgroundColor: selected ? buttonColors.selected : disabled ? buttonColors.disabled : primary ? buttonColors.primary : destructive ? buttonColors.destructive : buttonColors["default"],
      outlineStyle: "solid",
      outlineWidth: 2,
      outlineColor: destructive ? textColors.destructive : disabled ? buttonColors.disabled : primary ? buttonColors.primary : textColors["default"]
    }, backgroundColor && {
      backgroundColor: backgroundColor
    }],
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
      onHoverIn: function onHoverIn() {
        setFocus(true);
      },
      onHoverOut: function onHoverOut() {
        setFocus(false);
      },
      onPress: disabled ? disabledFun : onPress,
      android_ripple: disabled || {
        color: colorTheme.surfaceContainerHigh
      },
      style: [buttonStyle.pressable, small && buttonStyle.smallPressable],
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: {
          flexDirection: 'row',
          gap: 12,
          alignItems: "center"
        },
        children: [icon && /*#__PURE__*/(0, _jsxRuntime.jsx)(_vectorIcons.Ionicons, {
          name: icon,
          size: small ? 16 : 20,
          color: disabled ? textColors.disabled : primary ? textColors.primary : destructive ? textColors.destructive : textColors["default"]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: [textStyle.buttonText, {
            color: selected ? textColors.selected : disabled ? textColors.disabled : primary ? textColors.primary : destructive ? textColors.destructive : textColors["default"]
          }],
          children: text
        })]
      })
    })
  });
};
var SegmentedButtons = exports.SegmentedButtons = function SegmentedButtons(_ref2) {
  var items = _ref2.items,
    selected = _ref2.selected,
    onPress = _ref2.onPress,
    _ref2$noCheck = _ref2.noCheck,
    noCheck = _ref2$noCheck === void 0 ? false : _ref2$noCheck,
    _ref2$small = _ref2.small,
    small = _ref2$small === void 0 ? false : _ref2$small,
    _ref2$grow = _ref2.grow,
    grow = _ref2$grow === void 0 ? false : _ref2$grow,
    _ref2$disabled = _ref2.disabled,
    disabled = _ref2$disabled === void 0 ? false : _ref2$disabled,
    _ref2$destructive = _ref2.destructive,
    destructive = _ref2$destructive === void 0 ? false : _ref2$destructive,
    _ref2$primary = _ref2.primary,
    primary = _ref2$primary === void 0 ? false : _ref2$primary;
  var _useContext2 = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext2.colorTheme,
    getHoverColor = _useContext2.getHoverColor;
  var _useState3 = (0, _react.useState)(Array(items.length).fill(false)),
    _useState4 = _slicedToArray(_useState3, 2),
    focusArray = _useState4[0],
    setFocusArray = _useState4[1];
  var buttonStyle = buttonStyles();
  var textStyle = (0, _styles.textStyles)();
  var getButtonBGTheme = function getButtonBGTheme(focus, colorTheme) {
    var buttonColors = {
      disabled: getHoverColor(colorTheme.onSurface, 0.3),
      "default": focus ? getHoverColor(colorTheme.surfaceContainerHigh) : "transparent",
      primary: focus ? getHoverColor(colorTheme.primary) : colorTheme.primary,
      destructive: focus ? getHoverColor(colorTheme.error, 0.1) : "transparent"
    };
    return {
      backgroundColor: buttonColors["default"]
    };
  };
  var textColors = {
    disabled: getHoverColor(colorTheme.secondary, 0.4),
    "default": colorTheme.secondary,
    primary: colorTheme.onPrimary,
    destructive: colorTheme.error
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: [buttonStyle.baseContainer, small && buttonStyle.smallBaseContainer, {
      flexDirection: "row",
      flexWrap: "wrap",
      outlineStyle: "solid",
      height: "auto",
      outlineWidth: 2,
      outlineColor: disabled ? textColors.disabled : destructive ? textColors.destructive : textColors["default"]
    }, grow && {
      width: "100%"
    }],
    children: items.map(function (item, i) {
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
        onHoverIn: function onHoverIn() {
          disabled ? function () {} : setFocusArray(function (prev) {
            return prev.map(function (value, x) {
              return x === i ? true : value;
            });
          });
        },
        onHoverOut: function onHoverOut() {
          disabled ? function () {} : setFocusArray(function (prev) {
            return prev.map(function (value, x) {
              return x === i ? false : value;
            });
          });
        },
        onPress: disabled ? function () {} : function () {
          return onPress(i);
        },
        android_ripple: disabled || {
          color: colorTheme.surfaceContainerHigh
        },
        style: [buttonStyle.pressable, small && buttonStyle.smallPressable, getButtonBGTheme(focusArray[i], colorTheme), i === selected && {
          backgroundColor: getHoverColor(colorTheme.secondaryContainer)
        }, {
          outlineStyle: "solid",
          outlineWidth: 1,
          outlineColor: disabled ? textColors.disabled : primary ? textColors.primary : destructive ? textColors.destructive : textColors["default"]
        }, grow && {
          flexGrow: 1
        }],
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: {
            flexDirection: 'row',
            gap: 12,
            alignItems: "center"
          },
          children: [i === selected && !noCheck && /*#__PURE__*/(0, _jsxRuntime.jsx)(_vectorIcons.Ionicons, {
            name: "checkmark",
            size: small ? 16 : 20,
            color: disabled ? textColors.disabled : primary ? textColors.primary : destructive ? textColors.destructive : textColors["default"]
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: [textStyle.buttonText, {
              color: disabled ? textColors.disabled : primary ? textColors.primary : destructive ? textColors.destructive : textColors["default"]
            }],
            children: item
          })]
        })
      }, item);
    })
  });
};
var buttonStyles = function buttonStyles() {
  var _useContext3 = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext3.colorTheme;
  return _reactNative.StyleSheet.create({
    baseContainer: {
      height: 40,
      borderRadius: 20,
      overflow: 'hidden'
    },
    smallBaseContainer: {
      height: 34,
      borderRadius: 17
    },
    pressable: {
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24
    },
    smallPressable: {
      height: 34,
      paddingHorizontal: 16
    }
  });
};