import { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { readWidgetSnapshot } from '../storage/widgetBridge';
import React from 'react';
import { ThermaFitWidget } from './ThermaFitWidget';

const nameToWidget = {
  ThermaFit: ThermaFitWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget =
    nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const snapshot = await readWidgetSnapshot();
      props.renderWidget(React.createElement(Widget, { snapshot }));
      break;
    }
    case 'WIDGET_CLICK':
      // Tapping widget opens the app — handled by Android deep link automatically
      break;
    default:
      break;
  }
}
