var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { useRef, useEffect, useState, Children } from 'react';
import { StyleSheet, Text, View, I18nManager, } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, } from 'react-native-reanimated';
const styles = StyleSheet.create({
    row: {
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
        overflow: 'hidden',
    },
    hide: {
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 0,
    },
});
const uniq = (values) => {
    return values.filter((value, index) => {
        return values.indexOf(value) === index;
    });
};
const range = (length) => Array.from({ length }, (x, i) => i);
const splitText = (text = '') => (text + '').split('');
const numberRange = range(10).map((p) => p + '');
const numAdditional = [',', '.'];
const numberItems = [...numberRange, ...numAdditional];
const isNumber = (v) => !isNaN(parseInt(v));
const getPosition = ({ text, items, height, }) => {
    const index = items.findIndex((p) => p === text);
    return index * height * -1;
};
export const Tick = (_a) => {
    var props = __rest(_a, []);
    //@ts-ignore
    return <TickItem {...props}/>;
};
const TickItem = ({ children, duration, textStyle, textProps, measureMap, rotateItems, }) => {
    const measurement = measureMap[children];
    const position = getPosition({
        text: children,
        height: measurement.height,
        items: rotateItems,
    });
    const widthAnim = useSharedValue(measurement.width);
    const stylePos = useSharedValue(position);
    const animatedStyles = useAnimatedStyle(() => ({
        height: measurement.height,
        width: widthAnim.value,
        overflow: 'hidden',
        transform: [{ translateY: stylePos.value }],
    }));
    useEffect(() => {
        stylePos.value = withTiming(position, {
            duration: duration,
            easing: Easing.linear,
        });
        widthAnim.value = withTiming(measurement.width, {
            duration: 25,
            easing: Easing.linear,
        });
    }, [position, measurement, duration]);
    return (<Animated.View style={animatedStyles}>
      {rotateItems.map((v) => (<Text key={v} {...textProps} style={[textStyle, { height: measurement.height }]}>
          {v}
        </Text>))}
    </Animated.View>);
};
const Ticker = ({ duration = 250, containerStyle, textStyle, textProps, children, }) => {
    const [measured, setMeasured] = useState(false);
    const measureMap = useRef({});
    const measureStrings = Children.map(children, (child) => {
        var _a;
        if (typeof child === 'string' || typeof child === 'number') {
            return splitText(`${child}`);
        }
        else if (child) {
            return (child === null || child === void 0 ? void 0 : child.props) && ((_a = child === null || child === void 0 ? void 0 : child.props) === null || _a === void 0 ? void 0 : _a.rotateItems);
        }
    }).reduce((acc, val) => acc.concat(val), []);
    const hasNumbers = measureStrings.find((v) => isNumber(v)) !== undefined;
    const rotateItems = uniq([
        ...(hasNumbers ? numberItems : []),
        ...measureStrings,
    ]);
    const handleMeasure = (e, v) => {
        if (!measureMap.current)
            return;
        measureMap.current[v] = {
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
        };
        if (Object.keys(measureMap.current).length === rotateItems.length) {
            setMeasured(true);
        }
    };
    return (<View style={[styles.row, containerStyle]}>
      {measured === true &&
            Children.map(children, (child) => {
                if (typeof child === 'string' || typeof child === 'number') {
                    return splitText(`${child}`).map((text, index) => {
                        let items = isNumber(text) ? numberItems : [text];
                        return (<TickItem key={index} duration={duration} textStyle={textStyle} textProps={textProps} rotateItems={items} measureMap={measureMap.current}>
                  {text}
                </TickItem>);
                    });
                }
                else {
                    //@ts-ignore
                    return React.cloneElement(child, {
                        duration,
                        textStyle,
                        textProps,
                        measureMap: measureMap.current,
                    });
                }
            })}
      {rotateItems.map((v) => {
            return (<Text key={v} {...textProps} style={[textStyle, styles.hide]} onLayout={(e) => handleMeasure(e, v)}>
            {v}
          </Text>);
        })}
    </View>);
};
Ticker.defaultProps = {
    duration: 250,
};
export default Ticker;
