"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
    hovered = _useState2[0],
    setHovered = _useState2[1];
  var _useWindowDimensions = (0, _reactNative.useWindowDimensions)(),
    width = _useWindowDimensions.width;
  var textStyle = (0, _styles.textStyles)(colorTheme, width);
  var buttonStyle = buttonStyles();
  var scaleAnim = (0, _react.useRef)(new _reactNative.Animated.Value(1)).current;
  var handlePressIn = function handlePressIn() {
    if (disabled) return;
    _reactNative.Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  // Standard MD3 Dynamic Color Logic
  var colors = {
    // Sharpened disabled state: Use higher contrast, less blur (no opacity)
    disabledBg: colorTheme.surfaceContainerLow,
    disabledText: colorTheme.outline,
    primaryBg: hovered ? getHoverColor(colorTheme.primary, 0.9) : colorTheme.primary,
    onPrimary: colorTheme.onPrimary,
    tonalBg: hovered ? colorTheme.secondaryContainer : colorTheme.surfaceContainerHigh,
    onTonal: colorTheme.onSecondaryContainer,
    selectedBg: colorTheme.secondary,
    onSelected: colorTheme.onSecondary,
    destructiveText: colorTheme.error,
    destructiveBg: hovered ? getHoverColor(colorTheme.error, 0.1) : 'transparent'
  };
  var finalBg = backgroundColor || colors.tonalBg;
  var finalTextColor = colors.onTonal;
  var finalBorderColor = 'transparent';
  var finalBorderWidth = 0;
  if (disabled) {
    finalBg = colors.disabledBg;
    finalTextColor = colors.disabledText;
  } else if (selected) {
    finalBg = colors.selectedBg;
    finalTextColor = colors.onSelected;
  } else if (primary) {
    finalBg = colors.primaryBg;
    finalTextColor = colors.onPrimary;
  } else if (destructive) {
    finalBg = colors.destructiveBg;
    finalTextColor = colors.destructiveText;
    finalBorderColor = colorTheme.error;
    finalBorderWidth = 1;
  } else {
    finalBg = colors.tonalBg;
    finalTextColor = colors.onTonal;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Animated.View, {
    style: [buttonStyle.baseContainer, small && buttonStyle.smallBaseContainer, rightAlign && {
      alignSelf: 'flex-end'
    }, {
      backgroundColor: finalBg,
      borderColor: finalBorderColor,
      borderWidth: finalBorderWidth,
      transform: [{
        scale: scaleAnim
      }],
      flexShrink: 0
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
      style: [buttonStyle.pressable, small && buttonStyle.smallPressable],
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: {
          flexDirection: 'row',
          gap: 8,
          alignItems: "center"
        },
        children: [icon && /*#__PURE__*/(0, _jsxRuntime.jsx)(_vectorIcons.Ionicons, {
          name: icon,
          size: small ? 16 : 18,
          color: finalTextColor
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: [textStyle.labelLarge, {
            color: finalTextColor,
            fontWeight: '500',
            // REDUCED weight as requested
            // Flair: Extremely subtle text shadow for depth
            textShadowColor: 'rgba(0, 0, 0, 0.05)',
            textShadowOffset: {
              width: 0,
              height: 0.5
            },
            textShadowRadius: 0.5
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
  var _useWindowDimensions2 = (0, _reactNative.useWindowDimensions)(),
    width = _useWindowDimensions2.width;
  var buttonStyle = buttonStyles();
  var textStyle = (0, _styles.textStyles)(colorTheme, width);
  var borderColor = disabled ? getHoverColor(colorTheme.onSurface, 0.12) : colorTheme.outline;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: [buttonStyle.segmentedContainer, small && buttonStyle.smallBaseContainer, grow && {
      width: "100%"
    }, {
      borderColor: borderColor,
      borderWidth: 1
    }],
    children: items.map(function (item, i) {
      var isSelected = i === selected;
      var isFirst = i === 0;
      var itemBg = isSelected ? colorTheme.secondaryContainer : 'transparent';
      var itemTextColor = isSelected ? colorTheme.onSecondaryContainer : disabled ? colorTheme.outline : colorTheme.onSurface;
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
        onPress: disabled ? function () {} : function () {
          return onPress(i);
        },
        android_ripple: {
          color: colorTheme.surfaceContainerHighest
        },
        style: function style(_ref3) {
          var pressed = _ref3.pressed;
          return [buttonStyle.segmentedItem, grow && {
            flex: 1
          }, {
            backgroundColor: isSelected ? itemBg : pressed ? colorTheme.surfaceContainerLow : 'transparent',
            borderLeftWidth: isFirst ? 0 : 0.5,
            borderColor: colorTheme.outlineVariant
          }];
        },
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: {
            flexDirection: 'row',
            gap: 6,
            alignItems: "center",
            justifyContent: 'center'
          },
          children: [isSelected && !noCheck && /*#__PURE__*/(0, _jsxRuntime.jsx)(_vectorIcons.Ionicons, {
            name: "checkmark",
            size: small ? 16 : 18,
            color: itemTextColor
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: [textStyle.labelLarge, {
              color: itemTextColor,
              fontWeight: isSelected ? '500' : '400',
              // REDUCED
              fontSize: small ? 12 : 14
            }],
            children: item
          })]
        })
      }, item);
    })
  });
};
var buttonStyles = function buttonStyles() {
  return _reactNative.StyleSheet.create({
    baseContainer: _objectSpread({
      height: 48,
      borderRadius: 24,
      overflow: 'hidden',
      justifyContent: 'center'
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
    })),
    smallBaseContainer: {
      height: 38,
      borderRadius: 19
    },
    segmentedContainer: {
      height: 48,
      borderRadius: 24,
      flexDirection: 'row',
      overflow: 'hidden'
    },
    segmentedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      height: '100%'
    },
    pressable: {
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24
    },
    smallPressable: {
      paddingHorizontal: 16
    }
  });
};