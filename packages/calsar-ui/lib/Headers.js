"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BackHeader = BackHeader;
exports.Header = Header;
var _vectorIcons = require("@expo/vector-icons");
var _expoRouter = require("expo-router");
var _react = require("react");
var _reactNative = require("react-native");
var _reactNativeSafeAreaContext = require("react-native-safe-area-context");
var _ThemeContext = require("./ThemeContext");
var _IconButton = require("./IconButton");
var _styles = require("./styles");
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
    width = _useWindowDimensions.width,
    height = _useWindowDimensions.height;
  var textStyle = (0, _styles.textStyles)();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Header, {
    style: {
      backgroundColor: backgroundColor ? backgroundColor : colorTheme.primaryContainer,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0
    },
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: [styles.mainContainer],
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: [styles.titleRow, {
          justifyContent: !menuButton && width < 600 ? "flex-start" : "space-between",
          minHeight: height < 500 || minimize ? 40 : 60
        }],
        children: [width < 600 ? /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: styles.leftContainer,
          children: [hideBack ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {}) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
            style: styles.backButtonContainer,
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_IconButton.IconButton, {
              ionicons_name: _reactNative.Platform.OS === 'android' ? "arrow-back" : "chevron-back",
              color: color ? color : colorTheme.onPrimaryContainer,
              onPress: function onPress() {
                href ? _expoRouter.router.navigate(href) : _expoRouter.router.back();
              }
            })
          }), customTitle ? customTitle : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: [textStyle.headerText, {
              color: color ? color : colorTheme.onPrimaryContainer
            }],
            adjustsFontSizeToFit: true,
            numberOfLines: 1,
            children: title
          })]
        }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
          children: [hideBack ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
            style: {
              flexGrow: 1,
              flexBasis: 1
            }
          }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
            style: styles.backButtonContainer,
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_IconButton.IconButton, {
              ionicons_name: _reactNative.Platform.OS === 'android' ? "arrow-back" : "chevron-back",
              color: color ? color : colorTheme.onPrimaryContainer,
              onPress: function onPress() {
                href ? _expoRouter.router.navigate(href) : _expoRouter.router.back();
              }
            })
          }), customTitle ? customTitle : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: [textStyle.headerText, {
              color: color ? color : colorTheme.onPrimaryContainer
            }],
            adjustsFontSizeToFit: true,
            numberOfLines: 1,
            children: title
          })]
        }), menuButton ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          style: [styles.menuContainer, {
            flexGrow: 1,
            flexBasis: 1,
            alignItems: "flex-end"
          }],
          children: menuButton
        }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          style: {
            flexGrow: 1,
            flexBasis: 1
          }
        })]
      }), children, subtitle && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: [styles.subtitleContainer, {
          backgroundColor: backgroundColor ? backgroundColor : colorTheme.tertiaryContainer
        }],
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: [styles.action, {
            color: color ? color : colorTheme.onTertiaryContainer
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 0,
    justifyContent: "center"
  },
  titleRow: {
    paddingLeft: 6,
    paddingRight: 12,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  leftContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: -1
  },
  subtitleContainer: {
    paddingTop: 10,
    paddingBottom: 10
  },
  action: {
    marginLeft: 20,
    marginRight: 20
  },
  title: {
    fontSize: 18,
    flex: -1,
    fontWeight: '500'
  },
  backButtonContainer: {
    width: 40,
    height: "100%",
    minHeight: 40,
    borderRadius: 20,
    overflow: 'hidden',
    flexGrow: 1,
    flexBasis: 1,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  menuContainer: {},
  circleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});