"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TabContainer = TabContainer;
var _vectorIcons = require("@expo/vector-icons");
var _react = require("react");
var _reactNative = require("react-native");
var _reactNativeSafeAreaContext = require("react-native-safe-area-context");
var _ThemeContext = require("./ThemeContext");
var _jsxRuntime = require("react/jsx-runtime");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function TabButton(_ref) {
  var icon = _ref.icon,
    label = _ref.label,
    isActive = _ref.isActive,
    onPress = _ref.onPress;
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme;
  var _useState = (0, _react.useState)(false),
    _useState2 = _slicedToArray(_useState, 2),
    isHovered = _useState2[0],
    setIsHovered = _useState2[1];

  // Animation values
  var scaleAnim = (0, _react.useRef)(new _reactNative.Animated.Value(1)).current;
  var activeAnim = (0, _react.useRef)(new _reactNative.Animated.Value(isActive ? 1 : 0)).current;
  (0, _react.useEffect)(function () {
    _reactNative.Animated.timing(activeAnim, {
      toValue: isActive ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
      easing: _reactNative.Easing.bezier(0.4, 0.0, 0.2, 1)
    }).start();
    if (isActive) {
      _reactNative.Animated.sequence([_reactNative.Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 50,
        useNativeDriver: false
      }), _reactNative.Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: false
      })]).start();
    }
  }, [isActive]);
  var handlePressIn = function handlePressIn() {
    _reactNative.Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: false,
      speed: 20,
      bounciness: 0
    }).start();
  };
  var handlePressOut = function handlePressOut() {
    _reactNative.Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: false
    }).start();
  };

  // Interpolations
  var backgroundColor = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isHovered ? colorTheme.surfaceContainerHigh : 'transparent', colorTheme.primary]
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Pressable, {
    onHoverIn: function onHoverIn() {
      return setIsHovered(true);
    },
    onHoverOut: function onHoverOut() {
      return setIsHovered(false);
    },
    onPress: onPress,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    android_ripple: {
      color: colorTheme.surfaceContainerHighest,
      borderless: true,
      radius: 32
    },
    style: styles.tabButton,
    accessibilityRole: "tab",
    accessibilityState: {
      selected: isActive
    },
    accessibilityLabel: label,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Animated.View, {
      style: [styles.iconContainer, {
        backgroundColor: backgroundColor,
        transform: [{
          scale: scaleAnim
        }]
      }],
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_vectorIcons.Ionicons, {
        name: isActive ? icon : "".concat(icon, "-outline"),
        size: 22,
        color: isActive ? colorTheme.onPrimary : colorTheme.onSurfaceVariant
      })
    }), label && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Animated.Text, {
      style: [styles.label, {
        color: isActive ? colorTheme.onSurface : colorTheme.onSurfaceVariant,
        fontWeight: isActive ? '700' : '500',
        opacity: activeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1]
        })
      }],
      children: label
    })]
  });
}
function TabContainer(_ref2) {
  var _items$find;
  var items = _ref2.items,
    selectedId = _ref2.selectedId,
    onSelect = _ref2.onSelect,
    _ref2$readOnly = _ref2.readOnly,
    readOnly = _ref2$readOnly === void 0 ? false : _ref2$readOnly;
  var _useContext2 = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext2.colorTheme;
  var insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();
  var activeContent = (_items$find = items.find(function (item) {
    return item.id === selectedId;
  })) === null || _items$find === void 0 ? void 0 : _items$find.content;
  var visibleTabs = items.filter(function (item) {
    return !item.hidden;
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
    style: styles.container,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: styles.contentContainer,
      children: activeContent
    }), !readOnly && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: [styles.tabBar, {
        backgroundColor: colorTheme.surfaceContainer,
        paddingBottom: _reactNative.Platform.OS === 'ios' ? 0 : insets.bottom,
        height: 80 + (_reactNative.Platform.OS === 'ios' ? 0 : insets.bottom)
      }],
      children: visibleTabs.map(function (item) {
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(TabButton, {
          label: item.label,
          icon: item.icon,
          isActive: item.id === selectedId,
          onPress: function onPress() {
            return onSelect(item.id);
          }
        }, item.id);
      })
    })]
  });
}
var styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1
  },
  contentContainer: {
    flex: 1
  },
  tabBar: {
    flexDirection: "row",
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2
    },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  iconContainer: {
    height: 32,
    width: 64,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    overflow: 'hidden'
  },
  label: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4
  }
});