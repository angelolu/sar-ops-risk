"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RiskModal = RiskModal;
var _vectorIcons = require("@expo/vector-icons");
var _react = require("react");
var _reactNative = require("react-native");
var _reactNativeModal = _interopRequireDefault(require("react-native-modal"));
var _ThemeContext = require("./ThemeContext");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function RiskModal(_ref) {
  var isVisible = _ref.isVisible,
    children = _ref.children,
    onClose = _ref.onClose,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? 0 : _ref$height,
    title = _ref.title,
    overrideWidth = _ref.overrideWidth;
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme;
  var styles = modalStyles();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeModal["default"], {
    isVisible: isVisible,
    onBackdropPress: onClose,
    onSwipeComplete: onClose,
    swipeDirection: ['down'],
    onRequestClose: onClose,
    onBackButtonPress: onClose,
    style: {
      margin: 0,
      alignItems: 'center'
    },
    propagateSwipe: true,
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: [styles.modalContent, overrideWidth && {
        maxWidth: overrideWidth
      }, height > 0 && {
        height: height
      }, {
        backgroundColor: colorTheme.surfaceContainerHigh
      }],
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.titleContainer,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.title,
          children: title
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          style: styles.backButtonContainer,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
            style: styles.circleButton,
            android_ripple: {
              color: colorTheme.surfaceContainerHighest
            },
            onPress: onClose,
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_vectorIcons.Ionicons, {
              name: "close",
              color: colorTheme.onBackground,
              size: 22
            })
          })
        })]
      }), children]
    })
  });
}
var modalStyles = function modalStyles() {
  var _useContext2 = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext2.colorTheme;
  return _reactNative.StyleSheet.create({
    modalContent: {
      width: '100%',
      borderTopRightRadius: 16,
      borderTopLeftRadius: 16,
      position: 'absolute',
      bottom: 0,
      maxWidth: 600,
      paddingBottom: _reactNative.Platform.OS === "ios" ? 20 : 0
    },
    titleContainer: {
      marginTop: 16,
      marginBottom: 8,
      borderTopRightRadius: 16,
      borderTopLeftRadius: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      justifyContent: 'space-between'
    },
    title: {
      fontSize: 20,
      flex: -1,
      color: colorTheme.onSurface
    },
    pickerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 50,
      paddingVertical: 20
    },
    backButtonContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: 'hidden'
    },
    circleButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }
  });
};