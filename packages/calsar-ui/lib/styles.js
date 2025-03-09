"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textStyles = void 0;
var _ThemeContext = require("./ThemeContext");
var _react = require("react");
var _reactNative = require("react-native");
var _inter = require("@expo-google-fonts/inter");
var _outfit = require("@expo-google-fonts/outfit");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var textStyles = exports.textStyles = function textStyles() {
  var _useFonts = (0, _outfit.useFonts)({
      Outfit_600SemiBold: _outfit.Outfit_600SemiBold,
      Outfit_500Medium: _outfit.Outfit_500Medium,
      Outfit_400Regular: _outfit.Outfit_400Regular,
      Inter_400Regular: _inter.Inter_400Regular,
      Inter_500Medium: _inter.Inter_500Medium,
      Inter_600SemiBold: _inter.Inter_600SemiBold,
      Inter_700Bold: _inter.Inter_700Bold
    }),
    _useFonts2 = _slicedToArray(_useFonts, 2),
    loaded = _useFonts2[0],
    error = _useFonts2[1];
  var _useContext = (0, _react.useContext)(_ThemeContext.ThemeContext),
    colorTheme = _useContext.colorTheme;
  var _useWindowDimensions = (0, _reactNative.useWindowDimensions)(),
    width = _useWindowDimensions.width;

  // Use Outfit if size is over 20

  return _reactNative.StyleSheet.create({
    text: {
      fontSize: 14,
      color: colorTheme.onSurface,
      fontFamily: 'Inter_400Regular'
    },
    headerText: {
      fontSize: 18,
      color: colorTheme.onPrimaryContainer,
      flex: -1,
      fontFamily: 'Inter_500Medium'
    },
    chipText: {
      fontSize: 12,
      color: colorTheme.onSurface,
      fontFamily: 'Inter_400Regular'
    },
    tertiaryText: {
      fontSize: 12,
      color: colorTheme.onSurfaceVariant,
      fontFamily: 'Inter_400Regular'
    },
    secondaryText: {
      fontSize: 14,
      color: colorTheme.onSurfaceVariant,
      fontFamily: 'Inter_400Regular'
    },
    buttonText: {
      color: colorTheme.secondary,
      fontFamily: 'Inter_500Medium'
    },
    cardTitleText: {
      fontSize: 20,
      color: colorTheme.primary,
      fontFamily: 'Outfit_600SemiBold'
    },
    kvValueText: {
      fontSize: width > 600 ? 14 : 12,
      color: colorTheme.onSurface,
      fontFamily: 'Inter_400Regular'
    },
    sectionTitleText: {
      fontSize: 14,
      color: colorTheme.onSurfaceVariant,
      paddingTop: 4,
      fontFamily: 'Inter_600SemiBold'
    },
    columnKeyText: {
      fontSize: 14,
      color: colorTheme.onSurfaceVariant,
      fontFamily: 'Inter_400Regular'
    },
    columnValueText: {
      fontSize: width > 600 ? 24 : 16,
      color: colorTheme.onSurface,
      fontFamily: width > 600 ? 'Outfit_400Regular' : 'Inter_400Regular'
    },
    columnValueTextMain: {
      fontSize: width > 600 ? 26 : 18,
      color: colorTheme.onSurface,
      fontFamily: width > 600 ? 'Outfit_600SemiBold' : 'Inter_600SemiBold'
    },
    rowTitleText: {
      fontSize: 16,
      color: colorTheme.onSurface,
      fontFamily: 'Inter_500Medium'
    },
    rowTitleTextPrimary: {
      fontSize: 16,
      color: colorTheme.primary,
      fontFamily: 'Inter_500Medium'
    },
    rowTitleTextBold: {
      fontSize: 16,
      color: colorTheme.onSurface,
      fontFamily: 'Inter_700Bold'
    },
    pageNameText: {
      fontSize: width > 600 ? 24 : 20,
      color: colorTheme.onBackground,
      fontFamily: 'Outfit_600SemiBold'
    }
  });
};