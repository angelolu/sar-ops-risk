"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RiskModal = RiskModal;
var _react = require("react");
var _reactNative = require("react-native");
var _reactNativeModal = _interopRequireDefault(require("react-native-modal"));
var _reactNativeSafeAreaContext = require("react-native-safe-area-context");
var _IconButton = require("./IconButton");
var _ThemeContext = require("./ThemeContext");
var _styles = require("./styles");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function RiskModal(_ref) {
  var isVisible = _ref.isVisible,
    children = _ref.children,
    onClose = _ref.onClose,
    title = _ref.title,
    overrideWidth = _ref.overrideWidth;
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme;
  var insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();
  var _useWindowDimensions = (0, _reactNative.useWindowDimensions)(),
    screenHeight = _useWindowDimensions.height;
  var textStyle = (0, _styles.textStyles)();

  // 1. Constrain height so ScrollView has a boundary to scroll within
  var modalMaxHeight = screenHeight - insets.top - 60;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeModal["default"], {
    isVisible: isVisible,
    onBackdropPress: onClose,
    onBackButtonPress: onClose
    // 2. propagateSwipe is key, but some Android versions still struggle
    // if swipeDirection is overly aggressive.
    ,
    propagateSwipe: true,
    swipeDirection: "down",
    onSwipeComplete: onClose,
    style: styles.modalWrapper
    // 3. Flicker Fixes
    ,
    backdropOpacity: 0.5,
    backdropColor: "#000000" // Use a solid hex
    ,
    useNativeDriver: true,
    useNativeDriverForBackdrop: true,
    hideModalContentWhileAnimating: true,
    animationIn: "slideInUp",
    animationOut: "slideOutDown",
    backdropTransitionOutTiming: 0,
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      collapsable: false,
      style: [styles.modalContent, {
        maxHeight: modalMaxHeight,
        backgroundColor: colorTheme.surfaceContainerHigh
      }, overrideWidth && {
        maxWidth: overrideWidth
      }],
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.header,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: [textStyle.pageNameText, {
            flex: 1
          }],
          children: title
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_IconButton.IconButton, {
          ionicons_name: "close",
          color: colorTheme.onBackground,
          onPress: onClose
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.ScrollView
      // 4. Android Scroll Fixes
      , {
        nestedScrollEnabled: true,
        overScrollMode: "never",
        keyboardShouldPersistTaps: "handled",
        contentContainerStyle: [styles.scrollPadding, {
          paddingBottom: insets.bottom + 24
        }],
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
          children: children
        })
      })]
    })
  });
}
var styles = _reactNative.StyleSheet.create({
  modalWrapper: {
    margin: 0,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  scrollPadding: {
    paddingHorizontal: 16
  }
});