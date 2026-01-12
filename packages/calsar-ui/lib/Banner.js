"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BannerGroup = exports.Banner = void 0;
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
  if (!isGrouped) return {
    borderRadius: 26
  };
  var big = 26;
  var small = 8;
  return {
    borderTopLeftRadius: isFirst ? big : small,
    borderTopRightRadius: isFirst ? big : small,
    borderBottomLeftRadius: isLast ? big : small,
    borderBottomRightRadius: isLast ? big : small
  };
};

/**
 * Banner Component
 * Polished with animations and responsive grouped state support.
 */
var Banner = exports.Banner = function Banner(_ref) {
  var title = _ref.title,
    icon = _ref.icon,
    backgroundColor = _ref.backgroundColor,
    color = _ref.color,
    _ref$pad = _ref.pad,
    pad = _ref$pad === void 0 ? false : _ref$pad,
    _ref$noRadius = _ref.noRadius,
    noRadius = _ref$noRadius === void 0 ? false : _ref$noRadius,
    _ref$noShadow = _ref.noShadow,
    noShadow = _ref$noShadow === void 0 ? false : _ref$noShadow,
    _ref$isGrouped = _ref.isGrouped,
    isGrouped = _ref$isGrouped === void 0 ? false : _ref$isGrouped,
    _ref$isFirst = _ref.isFirst,
    isFirst = _ref$isFirst === void 0 ? false : _ref$isFirst,
    _ref$isLast = _ref.isLast,
    isLast = _ref$isLast === void 0 ? false : _ref$isLast,
    onPress = _ref.onPress,
    children = _ref.children,
    selected = _ref.selected;
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme;
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
  var bgColor = backgroundColor || colorTheme.surfaceVariant;
  var textColor = color || colorTheme.onSurfaceVariant;
  var radiusStyles = noRadius ? {
    borderRadius: 0
  } : getGroupedRadius(isGrouped, isFirst, isLast);
  var shadowStyle = {
    shadowColor: noShadow ? 'transparent' : colorTheme.shadow,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: noShadow || noRadius ? 0 : isGrouped ? 0.08 : 0.15,
    shadowRadius: 3,
    elevation: noShadow || noRadius ? 0 : 1
  };
  var containerStyle = [styles.card, radiusStyles, _objectSpread({
    backgroundColor: bgColor,
    marginHorizontal: pad ? 20 : 0,
    transform: [{
      scale: scaleAnim
    }]
  }, shadowStyle)];
  var Content = function Content() {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: styles.cardContent,
      children: [icon && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: styles.iconContainer,
        children: /*#__PURE__*/_react["default"].isValidElement(icon) ? /*#__PURE__*/_react["default"].cloneElement(icon, {
          color: textColor
        }) : icon
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: {
          flexDirection: "column",
          flex: 1,
          gap: 2
        },
        children: [title && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: [textStyle.text, {
            color: textColor
          }, selected && {
            fontWeight: "bold"
          }],
          children: title
        }), children]
      })]
    });
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Animated.View, {
    style: containerStyle,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
      accessibilityRole: "button",
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      onPress: onPress,
      disabled: !onPress,
      android_ripple: {
        color: colorTheme.surfaceContainerHighest
      },
      style: function style(_ref2) {
        var pressed = _ref2.pressed;
        return [_objectSpread({
          backgroundColor: pressed && _reactNative.Platform.OS !== 'android' ? colorTheme.surfaceContainerHighest : 'transparent'
        }, radiusStyles)];
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Content, {})
    })
  });
};

/**
 * Banner Group
 */
var BannerGroup = exports.BannerGroup = function BannerGroup(_ref3) {
  var children = _ref3.children,
    _ref3$marginHorizonta = _ref3.marginHorizontal,
    marginHorizontal = _ref3$marginHorizonta === void 0 ? 20 : _ref3$marginHorizonta;
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
var styles = _reactNative.StyleSheet.create({
  card: {},
  cardContent: {
    flexDirection: 'row',
    columnGap: 14,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center'
  }
});