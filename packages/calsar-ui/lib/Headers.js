"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BackHeader = BackHeader;
exports.Header = Header;
var _expoRouter = require("expo-router");
var _react = require("react");
var _reactNative = require("react-native");
var _reactNativeSafeAreaContext = require("react-native-safe-area-context");
var _IconButton = require("./IconButton");
var _styles = require("./styles");
var _ThemeContext = require("./ThemeContext");
var _jsxRuntime = require("react/jsx-runtime");
function Header(_ref) {
  var children = _ref.children,
    style = _ref.style;
  var insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: [style, {
      paddingTop: insets.top
    }],
    children: children
  });
}
function BackHeader(_ref2) {
  var children = _ref2.children,
    title = _ref2.title,
    customTitle = _ref2.customTitle,
    subtitle = _ref2.subtitle,
    backgroundColor = _ref2.backgroundColor,
    color = _ref2.color,
    menuButton = _ref2.menuButton,
    _ref2$hideBack = _ref2.hideBack,
    hideBack = _ref2$hideBack === void 0 ? false : _ref2$hideBack,
    href = _ref2.href,
    _ref2$minimize = _ref2.minimize,
    minimize = _ref2$minimize === void 0 ? false : _ref2$minimize;
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme;
  var _useWindowDimensions = (0, _reactNative.useWindowDimensions)(),
    screenHeight = _useWindowDimensions.height;
  var _useWindowDimensions2 = (0, _reactNative.useWindowDimensions)(),
    width = _useWindowDimensions2.width;
  var textStyle = (0, _styles.textStyles)(colorTheme, width);
  var activeColor = color || colorTheme.onPrimaryContainer;
  var activeBg = backgroundColor || colorTheme.primaryContainer;
  var headerMinHeight = screenHeight < 500 || minimize ? 44 : 64;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Header, {
    style: {
      backgroundColor: activeBg
    },
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: styles.mainContainer,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: [styles.titleRow, {
          minHeight: headerMinHeight
        }],
        children: [!hideBack ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          style: styles.buttonZone,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_IconButton.IconButton, {
            ionicons_name: _reactNative.Platform.OS === 'android' ? "arrow-back" : "chevron-back",
            color: activeColor,
            onPress: function onPress() {
              return href ? _expoRouter.router.navigate(href) : _expoRouter.router.back();
            }
          })
        }) :
        /*#__PURE__*/
        // Placeholder to maintain spacing if back is hidden
        (0, _jsxRuntime.jsx)(_reactNative.View, {
          style: styles.buttonZone
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          style: styles.titleZone,
          children: customTitle ? customTitle : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: [textStyle.titleLarge, {
              color: activeColor
            }],
            numberOfLines: 1,
            adjustsFontSizeToFit: true,
            children: title
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          style: [styles.buttonZone, {
            alignItems: 'flex-end'
          }],
          children: menuButton ? menuButton : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
            style: {
              width: 40
            }
          })
        })]
      }), children, subtitle && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: [styles.subtitleContainer, {
          backgroundColor: backgroundColor || colorTheme.tertiaryContainer
        }],
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: [textStyle.bodyMedium, {
            color: color || colorTheme.onTertiaryContainer
          }],
          children: subtitle
        })
      })]
    })
  });
}
;
var styles = _reactNative.StyleSheet.create({
  mainContainer: {
    overflow: 'hidden'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4
  },
  buttonZone: {
    width: 48,
    // Fixed width for touch targets for symmetry
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  titleZone: {
    flex: 1,
    justifyContent: 'center',
    // On Web this is centered, on Android this is left-aligned
    alignItems: _reactNative.Platform.OS === 'web' ? 'center' : 'flex-start'
  },
  subtitleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  subtitleText: {}
});