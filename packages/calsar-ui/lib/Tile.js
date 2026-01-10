"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VerticalTileGroup = exports.VerticalTile = exports.Tile = exports.HorizontalTileGroup = void 0;
var _expoRouter = require("expo-router");
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _ThemeContext = require("./ThemeContext");
var _styles = require("./styles");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * Helper to calculate position-aware border radius for grouped elements
 */
var getGroupedRadius = function getGroupedRadius(isGrouped, isFirst, isLast) {
  var horizontal = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  if (!isGrouped) return {
    borderRadius: 12
  };
  var big = 26;
  var small = 8;
  if (horizontal) {
    return {
      borderTopLeftRadius: isFirst ? big : small,
      borderBottomLeftRadius: isFirst ? big : small,
      borderTopRightRadius: isLast ? big : small,
      borderBottomRightRadius: isLast ? big : small
    };
  }
  return {
    borderTopLeftRadius: isFirst ? big : small,
    borderTopRightRadius: isFirst ? big : small,
    borderBottomLeftRadius: isLast ? big : small,
    borderBottomRightRadius: isLast ? big : small
  };
};

/**
 * Standard Horizontal Tile
 */
var Tile = exports.Tile = function Tile(_ref) {
  var title = _ref.title,
    subtitle = _ref.subtitle,
    children = _ref.children,
    icon = _ref.icon,
    _ref$href = _ref.href,
    href = _ref$href === void 0 ? "" : _ref$href,
    _onPress = _ref.onPress,
    _ref$width = _ref.width,
    width = _ref$width === void 0 ? "auto" : _ref$width,
    _ref$noRadius = _ref.noRadius,
    noRadius = _ref$noRadius === void 0 ? false : _ref$noRadius,
    _ref$noShadow = _ref.noShadow,
    noShadow = _ref$noShadow === void 0 ? false : _ref$noShadow,
    _ref$isGrouped = _ref.isGrouped,
    isGrouped = _ref$isGrouped === void 0 ? false : _ref$isGrouped,
    _ref$isFirst = _ref.isFirst,
    isFirst = _ref$isFirst === void 0 ? false : _ref$isFirst,
    _ref$isLast = _ref.isLast,
    isLast = _ref$isLast === void 0 ? false : _ref$isLast;
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme;
  var styles = tileStyles();
  var textStyle = (0, _styles.textStyles)();
  var textColor = textStyle.rowTitleTextPrimary.color;
  var scaleAnim = (0, _react.useRef)(new _reactNative.Animated.Value(1)).current;
  var handlePressIn = function handlePressIn() {
    _reactNative.Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0
    }).start();
  };
  var handlePressOut = function handlePressOut() {
    _reactNative.Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true
    }).start();
  };
  var radiusStyles = noRadius ? {
    borderRadius: 0
  } : getGroupedRadius(isGrouped, isFirst, isLast);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Animated.View, {
    style: [styles.card, radiusStyles, {
      width: width,
      transform: [{
        scale: scaleAnim
      }],
      // Individual shadows enabled for grouped items
      shadowColor: noShadow ? 'transparent' : colorTheme.shadow,
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: noShadow || noRadius ? 0 : isGrouped ? 0.08 : 0.1,
      shadowRadius: 3,
      elevation: noShadow || noRadius ? 0 : 1
    }],
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Pressable, {
      accessibilityRole: "button",
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      onPress: function onPress() {
        _onPress ? _onPress() : href ? _expoRouter.router.navigate(href) : null;
      },
      android_ripple: {
        color: colorTheme.surfaceContainerHighest
      },
      style: function style(_ref2) {
        var pressed = _ref2.pressed;
        return [_objectSpread({
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          gap: 12,
          backgroundColor: pressed && _reactNative.Platform.OS !== 'android' ? colorTheme.surfaceContainerHighest : 'transparent'
        }, radiusStyles)];
      },
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: {
          flexDirection: "row",
          gap: 14,
          alignItems: "center",
          flex: 1
        },
        children: [icon && /*#__PURE__*/_react["default"].isValidElement(icon) ? /*#__PURE__*/_react["default"].cloneElement(icon, {
          color: textColor
        }) : icon, /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: {
            flex: 1,
            gap: 2
          },
          children: [title && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: textStyle.rowTitleTextPrimary,
            children: title
          }), subtitle && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: textStyle.tertiaryText,
            children: subtitle
          })]
        })]
      }), children]
    })
  });
};

/**
 * Vertical Tile Component
 */
var VerticalTile = exports.VerticalTile = function VerticalTile(_ref3) {
  var title = _ref3.title,
    icon = _ref3.icon,
    height = _ref3.height,
    width = _ref3.width,
    _ref3$href = _ref3.href,
    href = _ref3$href === void 0 ? "" : _ref3$href,
    _onPress2 = _ref3.onPress,
    _ref3$selected = _ref3.selected,
    selected = _ref3$selected === void 0 ? false : _ref3$selected,
    backgroundColor = _ref3.backgroundColor,
    color = _ref3.color,
    _ref3$noRadius = _ref3.noRadius,
    noRadius = _ref3$noRadius === void 0 ? false : _ref3$noRadius,
    _ref3$noShadow = _ref3.noShadow,
    noShadow = _ref3$noShadow === void 0 ? false : _ref3$noShadow,
    _ref3$isGrouped = _ref3.isGrouped,
    isGrouped = _ref3$isGrouped === void 0 ? false : _ref3$isGrouped,
    _ref3$isFirst = _ref3.isFirst,
    isFirst = _ref3$isFirst === void 0 ? false : _ref3$isFirst,
    _ref3$isLast = _ref3.isLast,
    isLast = _ref3$isLast === void 0 ? false : _ref3$isLast;
  var _useContext2 = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext2.colorTheme;
  var styles = tileStyles();
  var textStyle = (0, _styles.textStyles)();
  var scaleAnim = (0, _react.useRef)(new _reactNative.Animated.Value(1)).current;
  var handlePressIn = function handlePressIn() {
    _reactNative.Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0
    }).start();
  };
  var handlePressOut = function handlePressOut() {
    _reactNative.Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true
    }).start();
  };
  var bgColor = backgroundColor || (selected ? colorTheme.primaryContainer : colorTheme.surfaceContainer);
  var textColor = color || (selected ? colorTheme.onPrimaryContainer : colorTheme.primary);

  // For VerticalTile usually used in HorizontalTileGroup
  var radiusStyles = noRadius ? {
    borderRadius: 0
  } : getGroupedRadius(isGrouped, isFirst, isLast, true);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Animated.View, {
    style: [styles.card, radiusStyles, {
      flexBasis: width ? undefined : 0,
      flexGrow: width ? 0 : 1,
      width: width,
      height: height,
      backgroundColor: bgColor,
      transform: [{
        scale: scaleAnim
      }],
      // Individual shadows enabled
      shadowColor: noShadow ? 'transparent' : colorTheme.shadow,
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: noShadow || noRadius ? 0 : isGrouped ? 0.08 : 0.1,
      shadowRadius: 3,
      elevation: noShadow || noRadius ? 0 : 1
    }],
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Pressable, {
      accessibilityRole: "button",
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      onPress: function onPress() {
        _onPress2 ? _onPress2() : href ? _expoRouter.router.navigate(href) : null;
      },
      android_ripple: {
        color: colorTheme.surfaceContainerHighest
      },
      style: function style(_ref4) {
        var pressed = _ref4.pressed;
        return [_objectSpread({
          flex: 1,
          padding: 10,
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
          backgroundColor: pressed && _reactNative.Platform.OS !== 'android' ? colorTheme.surfaceContainerHighest : 'transparent'
        }, radiusStyles)];
      },
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: {
          minHeight: 40,
          alignItems: "center",
          justifyContent: "center"
        },
        children: icon && /*#__PURE__*/_react["default"].isValidElement(icon) ? /*#__PURE__*/_react["default"].cloneElement(icon, {
          color: textColor
        }) : icon
      }), title && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: {
          justifyContent: 'center'
        },
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: [textStyle.rowTitleTextPrimary, {
            textAlign: 'center',
            color: textColor,
            fontSize: 14,
            lineHeight: 18,
            fontFamily: selected ? 'Inter_700Bold' : 'Inter_400Regular'
          }],
          numberOfLines: 2,
          children: title
        })
      })]
    })
  });
};

/**
 * Vertical Tile Group
 */
var VerticalTileGroup = exports.VerticalTileGroup = function VerticalTileGroup(_ref5) {
  var children = _ref5.children,
    _ref5$marginHorizonta = _ref5.marginHorizontal,
    marginHorizontal = _ref5$marginHorizonta === void 0 ? 20 : _ref5$marginHorizonta;
  var count = _react["default"].Children.count(children);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: {
      marginHorizontal: marginHorizontal
    },
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: {
        gap: 2
      },
      children: _react["default"].Children.map(children, function (child, index) {
        if (/*#__PURE__*/_react["default"].isValidElement(child)) {
          return /*#__PURE__*/_react["default"].cloneElement(child, {
            isGrouped: true,
            isFirst: index === 0,
            isLast: index === count - 1
          });
        }
        return child;
      })
    })
  });
};

/**
 * Horizontal Tile Group
 */
var HorizontalTileGroup = exports.HorizontalTileGroup = function HorizontalTileGroup(_ref6) {
  var children = _ref6.children,
    _ref6$marginHorizonta = _ref6.marginHorizontal,
    marginHorizontal = _ref6$marginHorizonta === void 0 ? 20 : _ref6$marginHorizonta,
    height = _ref6.height;
  var count = _react["default"].Children.count(children);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: {
      marginHorizontal: marginHorizontal
    },
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: {
        gap: 2,
        flexDirection: 'row',
        height: height
      },
      children: _react["default"].Children.map(children, function (child, index) {
        if (/*#__PURE__*/_react["default"].isValidElement(child)) {
          return /*#__PURE__*/_react["default"].cloneElement(child, {
            isGrouped: true,
            isFirst: index === 0,
            isLast: index === count - 1
          });
        }
        return child;
      })
    })
  });
};
var tileStyles = function tileStyles() {
  var _useContext3 = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext3.colorTheme;
  return _reactNative.StyleSheet.create({
    card: {
      backgroundColor: colorTheme.surfaceContainer
    }
  });
};